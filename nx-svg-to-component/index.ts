import { basename, resolve } from 'path'
import { config } from 'dotenv'
import { readFile, writeFile, readdir, mkdir } from 'fs/promises'
import {pipe, map, each, toAsync, size} from '@fxts/core'
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

const readOrCreateDir = async (path: string): Promise<void> => {
  const isDirExist = await checkDirExist(path)
  if (isDirExist) {
    return
  }
  await mkdir(path)
}

async function run() {
  const RESULT_DIR_PATH = resolve(__dirname, 'result')
  // TODO: Extract as ENV Variable
  const BASE_PROJECT_PATH = '/Users/mk-mac-135/kurly/kurlymall-nx'

  // TODO: Spawn child process for run  `extract.sh`

  await readOrCreateDir(RESULT_DIR_PATH)

  const progressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
    width: 20,
    total: size(SVG_FILE_PATH_LIST)
  })

  await pipe(
    SVG_FILE_PATH_LIST,
    map(path => `${BASE_PROJECT_PATH}${path}`),
    toAsync,
    each( async path => {
      const baseName = basename(path)
      const componentName = baseName
        .replace(new RegExp('-', 'g'), '_')
        .replace('.svg', '')
      const buffer = await readFile(path, { encoding: 'utf-8' })
      const jsCode = await transform(
        buffer.toString(),
        { jsxRuntime: 'automatic', icon: false, typescript: true },
        { componentName }
      )
      await writeFile(`${RESULT_DIR_PATH}/${baseName.replace('svg', 'tsx')}`, jsCode, {
        encoding: 'utf-8'
      })
      progressBar.tick()
    }),
  )
}

run();
