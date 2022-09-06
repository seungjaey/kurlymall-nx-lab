import {resolve} from 'path';
import {readFile, writeFile} from 'fs/promises'
import {pipe, flat, map, toArray, toAsync, nth, tap, each, size} from '@fxts/core'
import ProgressBar from 'progress'

import ALL_FILE_LIST from './ALL_FILE_LIST.json'

import setupDir from '../utils/setupDir'

async function run() {
  const RESULT_DIR_PATH = resolve(__dirname, 'result')
  await setupDir(RESULT_DIR_PATH)

  const progressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
    width: 20,
    total: size(ALL_FILE_LIST)
  })

  const data = await pipe(
    ALL_FILE_LIST,
    toAsync,
    map(async path => {
      const buffer = await readFile(path, { encoding: "utf-8" })
      return [path, buffer.toString()]
    }),
    map(args => {
      const [path, fileContent] = args
      const regexIter = fileContent.matchAll(/(rgba\s*?\(\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(0|0?\.\d*|1|1.0*)\s*?\))|(rgb\s*?\(\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?\))|(transparent)|(#([a-fA-F0-9]){6})|(#([a-fA-F0-9]){3})|(hsl\s*?\(\s*?(000|0?\d{1,2}|[1-2]\d\d|3[0-5]\d|360)\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?\))|(hsla\s*?\(\s*?(000|0?\d{1,2}|[1-2]\d\d|3[0-5]\d|360)\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?,\s*?(0|0\.\d*|1|1.0*)\s*?\))/gm)
      progressBar.tick()
      return pipe(
        regexIter,
        map((iter) => [path, nth(0, iter)]),
        toArray,
      )
    }),
    flat,
    toArray
  )
  await writeFile(`${RESULT_DIR_PATH}/COLOR_LIST.json`, JSON.stringify(data), { encoding: "utf-8" })
}

run()