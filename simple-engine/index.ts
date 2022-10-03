import { writeFile } from 'fs/promises'
import puppeteer, {Page} from 'puppeteer'
import {filter, map, pipe, toArray, toAsync, uniq, isEmpty, each} from '@fxts/core'

const checkValidHref = (url: string): boolean => url.startsWith('http')
  || url.startsWith('https')
  || url.startsWith('/')

const checkInternalUrl = (host: string): boolean => (host === 'www.kurly.com' || host === 'kurly.com')

type MetaData = {
  meta: Meta
  count: number
}
type Meta = [string, string][]

const DATA: Record<string, MetaData> = {}

async function extractUrlListFromPage(page: Page) {
  const anchorElements = await page.$$('a')
  const list = await pipe(
    anchorElements,
    toAsync,
    map(async element => {
      const href = await element.getProperty('href')
      return await href.jsonValue();
    }),
    filter((href) => checkValidHref(href)),
    uniq,
    toArray
  );
  return list
}

const checkTargetMetaKey = (key: string): boolean => !isEmpty(key) && (
  key.startsWith('og:')
  || key.startsWith('twitter:')
  || key.startsWith('description')
  || key.startsWith('keywords')
)

async function extractMetaDataEntriesFromPage(page: Page): Promise<MetaData> {
  const metaElements = await page.$$('meta')
  const entries = await pipe(
    metaElements,
    toAsync,
    map(async element => {
      const name = await (await element.getProperty('name')).jsonValue()
      const property = await (await element.getProperty('property')).jsonValue()
      const content = await (await element.getProperty('content')).jsonValue()
      return [name || property, content]
    }),
    filter(args => {
      const [key] = args
      return checkTargetMetaKey(key as string)
    }),
    toArray
  );
  return {
    meta: entries as Meta,
    count: 0
  };
}

async function run(url: URL) {
  console.log(`run : ${url}`)
  const { host, href, pathname } = url
  // NOTE: 이 예제에서는 ${host}${pathname} 을 기준으로 잡음
  const targetUrl =`${host}${pathname}`

  // NOTE : External URL 은 추가 탐색하지 않음
  if (!checkInternalUrl(host)) {
    if (!DATA[host]) {
      DATA[host] = {
        meta: [],
        count: 0,
      }
    }
    DATA[host].count += 1
    return;
  }
  if (DATA[targetUrl]) {
    DATA[targetUrl].count += 1
    return;
  }
  // NOTE: START : Execute Chrome
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.on('dialog', async dialog => {
    await dialog.accept()
  })
  await page.goto(href, {
    waitUntil: 'networkidle0'
  })
  const hrefList = await extractUrlListFromPage(page)
  const metaEntries = await extractMetaDataEntriesFromPage(page)
  await browser.close()
  // NOTE: END: Execute Chrome

  DATA[targetUrl] = metaEntries
  DATA[targetUrl].count += 1

  // NOTE: Recursive retrieve link urls
  await pipe(
    hrefList,
    toAsync,
    filter(href => DATA[href] === undefined),
    map(href => new URL(href)),
    each(async nextUrl => {
      await run(nextUrl)
    })
  )
}

async function main() {
  await run(new URL('https://www.kurly.com/main'))
  await writeFile('./result.json', JSON.stringify(DATA))
}

main()