import {readFile, writeFile} from 'fs/promises'
import {pipe, map, toArray, toAsync, uniq, nth, flat} from '@fxts/core'

import WWW_V2_ALL_FILE_LIST from './WWW_V2_ALL_FILE_LIST.json'

const REGEX_SVG_LINK = /(http.+\.svg)/gm

const run = async () => {
  const ALL_SVG_FILES = await pipe(
    WWW_V2_ALL_FILE_LIST,
    toAsync,
    map(async path => {
      const buffer = await readFile(path)
      return [path, buffer.toString()]
    }),
    map(args => {
      const [_, fileContent] = args
      const iter = fileContent.matchAll(REGEX_SVG_LINK)
      return pipe(
        iter,
        map(item => nth(1, item)),
      )
    }),
    flat,
    uniq,
    toArray
  )

  await writeFile(`${__dirname}/SVG_RESOURCE_LINK_LIST.json`, JSON.stringify(ALL_SVG_FILES))
}

run()