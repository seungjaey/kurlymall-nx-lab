import {readFile, writeFile} from 'fs/promises'
import {pipe, flat, map, toArray, toAsync, nth} from '@fxts/core'

import PATH_LIST from './data/COLOR_PATH_LIST.json'

async function run() {
  const WORKING_DIR = '/Users/mk-mac-135/Lab/mono/kurlymall-nx'
  const data = await pipe(
    PATH_LIST,
    map((rPath) => [rPath, `${WORKING_DIR}${rPath}`]),
    toAsync,
    map(async args => {
      const [rPath, aPath] = args
      const buffer = await readFile(aPath, { encoding: "utf-8" })
      return [rPath, aPath, buffer.toString()]
    }),
    map(args => {
      const [rPath, aPath, fileContent] = args
      const regexIter = fileContent.matchAll(/(rgba\s*?\(\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(0|0?\.\d*|1|1.0*)\s*?\))|(rgb\s*?\(\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?\))|(transparent)|(#([a-fA-F0-9]){6})|(#([a-fA-F0-9]){3})|(hsl\s*?\(\s*?(000|0?\d{1,2}|[1-2]\d\d|3[0-5]\d|360)\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?\))|(hsla\s*?\(\s*?(000|0?\d{1,2}|[1-2]\d\d|3[0-5]\d|360)\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?,\s*?(0|0\.\d*|1|1.0*)\s*?\))/gm)
      return pipe(
        regexIter,
        map((iter) => [rPath, aPath, nth(0, iter)]),
        toArray,
      )
    }),
    flat,
    toArray
  )
  await writeFile('./result/COLOR_LIST.json', JSON.stringify(data), { encoding: "utf-8" })
}

run()