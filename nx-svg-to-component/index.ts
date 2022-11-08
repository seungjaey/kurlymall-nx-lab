import {basename, resolve} from 'path'
import {config} from 'dotenv'
import {readFile, writeFile} from 'fs/promises'
import {pipe, map, each, toAsync, size, toArray} from '@fxts/core'
import {transform} from '@svgr/core'
import ProgressBar from 'progress'

import SVG_FILE_PATH_LIST from './SVG_FILE_PATH_LIST_V2.json'

import setupDir from '../utils/setupDir'

config()

async function run() {
  const RESULT_DIR_PATH = resolve(__dirname, 'result')

  await setupDir(RESULT_DIR_PATH)

  const progressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
    width: 20,
    total: size(SVG_FILE_PATH_LIST)
  })

  const pathList = pipe(
    SVG_FILE_PATH_LIST,
    map(path => {
      const baseName = basename(path)
      const componentName = baseName
        .replace(new RegExp('-', 'g'), '_')
        .replace('.svg', '')
      return [path, componentName]
    }),
    toArray
  )

  await writeFile(
    `${RESULT_DIR_PATH}/component_list.json`,
    JSON.stringify(pathList),
    {encoding: 'utf-8'}
  )

  await pipe(
    pathList,
    toAsync,
    each( async args => {
      const [path, componentName] = args
      const buffer = await readFile(path, { encoding: 'utf-8' })
      const jsCode = await transform(
        buffer.toString(),
        {
          jsxRuntime: 'automatic',
          icon: false,
          typescript: true,
          dimensions: true,
          plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
        },
        { componentName }
      )
      await writeFile(`${RESULT_DIR_PATH}/${componentName}.tsx`, jsCode, {
        encoding: 'utf-8'
      })
      progressBar.tick()
    }),
  )
}

run();
