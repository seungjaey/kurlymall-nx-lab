import {writeFile} from 'fs/promises'
import {pipe,map,toArray,join} from '@fxts/core'
import ALL_REVIEW_COMMENT_LIST from './ALL_REVIEW_LIST.json'

/**
 * TODO: Github REST API Response type
 * TODO: Pick Nested attr (data= {a: { b: { c } } } -> pick(['a', 'b.c'], data)
 * TODO: Remove @ts-ignore
 */

/**
 * extract-all-review-comments/index.ts 의 결과로 추출(ALL_REVIEW_LIST.json)된 모든 Pull Request 댓글들을 읽고
 * 분석에 필요한 최소한의 데이터남 남긴다. (COMMENTS_SUBSET.csv|json)
 */
const run = async () => {
  const subset = pipe(
    ALL_REVIEW_COMMENT_LIST,
    // @ts-ignore
    map(comment =>{
      // @ts-ignore
      const {url, body, created_at, user: {login, id}} = comment
      return {
        url,
        created_at,
        body,
        login,
        id,
      }
    }),
    toArray
  )
  const subsetCSV = pipe(
    subset,
    // @ts-ignore
    map(args => {
      // @ts-ignore
      const {url, created_at, body, login, id} = args
      return `${id},${login},${url},${body},${created_at}`
    }),
    join('\n')
  )
  await writeFile(`${__dirname}/COMMENTS_SUBSET.json`, JSON.stringify(subset))
  // @ts-ignore
  await writeFile(`${__dirname}/COMMENTS_SUBSET.csv`, subsetCSV)
}

run()