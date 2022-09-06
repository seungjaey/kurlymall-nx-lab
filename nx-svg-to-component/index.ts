import { basename, resolve } from 'path'
import { config } from 'dotenv'
import { readFile, writeFile, readdir, mkdir, rmdir } from 'fs/promises'
import {pipe, map, each, toAsync, size, toArray} from '@fxts/core'
import { transform } from '@svgr/core'
import ProgressBar from 'progress'

import SVG_FILE_PATH_LIST from './SVG_FILE_PATH_LIST.json'

config()

const checkDirExist = async (path: string): Promise<boolean> => {
  try {
    await readdir(path)
    return true
  } catch (error) {
    return false
  }
}

const setupDir = async (path: string): Promise<void> => {
  const isDirExist = await checkDirExist(path)
  if (isDirExist) {
    await rmdir(path, {recursive: true})
  }
  await mkdir(path)
}

async function run() {
  const RESULT_DIR_PATH = resolve(__dirname, 'result')
  // TODO: Extract as ENV Variable
  const BASE_PROJECT_PATH = '/Users/mk-mac-135/kurly/kurlymall-nx'

  // TODO: Spawn child process for run  `extract.sh`

  await setupDir(RESULT_DIR_PATH)

  const progressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
    width: 20,
    total: size(SVG_FILE_PATH_LIST)
  })

  const pathList = pipe(
    SVG_FILE_PATH_LIST,
    map(path => {
      const absolutePath = `${BASE_PROJECT_PATH}${path}`
      const baseName = basename(absolutePath)
      const componentName = baseName
        .replace(new RegExp('-', 'g'), '_')
        .replace('.svg', '')
      return [absolutePath, componentName]
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
        { jsxRuntime: 'automatic', icon: false, typescript: true },
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
