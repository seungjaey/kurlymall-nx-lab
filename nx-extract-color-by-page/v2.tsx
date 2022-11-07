import {readFile, writeFile} from 'fs/promises'
import {pipe, map, toAsync, toArray} from '@fxts/core'
import ALL_PAGE_LIST from './ALL_PAGE_LIST.json'
import SOURCE_BY_COLOR_DICTIONARY from './SOURCE_BY_COLOR_DICTIONARY.json'

/**
  page A
    ㄴ source 1
      ㄴ source 1-1
      ㄴ source 1-2
        ㄴ source 1-1-1
    ㄴ source 2
      ㄴ source 2-1
      ㄴ source 2-2
      ㄴ source 2-3

 ->
 [
  [page A, [source 1]]
 ]
*/

const run = async () => {
  const RESULT = await pipe(
    ALL_PAGE_LIST,
    toAsync,
    map(pageSourcePath => {

    }),
  )

}

run()