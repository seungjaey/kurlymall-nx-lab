import {readFile, writeFile} from 'fs/promises'
import {dirname, resolve} from 'path'
import {pipe, map, filter, flat, toAsync, toArray, nth, each, isUndefined, size, range} from '@fxts/core'
import ALL_PAGE_LIST from './ALL_PAGE_LIST.json'
import SOURCE_BY_COLOR_DICTIONARY from './SOURCE_BY_COLOR_DICTIONARY.json'
import ProgressBar from 'progress';

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
 ...
 page B
 ㄴ ...
 ...

 -> TOBE
 [
 [page A, [source 1, source 1-1, source 1-2, source 1-1-1, source 2, source 2-1, source 2-2, source 2-3 ...]],
 [page B, [...]
 ]
 */

const checkExternalModule = (path: string) => !path.startsWith('.')

// @ts-ignore
const checkFileExist = (path: string) => !!SOURCE_BY_COLOR_DICTIONARY[path]

type SimpleKeyValue = Record<string, { depth: number; path: string }>

const MEMO: Record<string, SimpleKeyValue> = {};

const IMPORT_REGEX = /import(?:(?:(?:[ \n\t]+([^ *\n\t\{\},]+)[ \n\t]*(?:,|[ \n\t]+))?([ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)|[ \n\t]*\*[ \n\t]*as[ \n\t]+([^ \n\t\{\}]+)[ \n\t]+)from[ \n\t]*(?:['"])([^'"\n]+)(['"])/gm;

async function recursiveFindDependencies(path: string, depth: number, rootPath: string) {
  const nextDepth = depth + 1
  const buffer = await readFile(path)
  const baseFileContent = buffer.toString()
  const baseDirPath = dirname(path)

  const importRegexIter = baseFileContent.matchAll(IMPORT_REGEX)

  const relatedResourceList = pipe(
    importRegexIter,
    map(iter => nth(4, iter) || ''),
    filter(targetPath => !checkExternalModule(targetPath)),
    map(targetPath => resolve(baseDirPath, targetPath)),
    map(targetBaseDirPath => [
      `${targetBaseDirPath}.ts`,
      `${targetBaseDirPath}.tsx`,
      `${targetBaseDirPath}/index.ts`,
      `${targetBaseDirPath}/index.tsx`,
      `${targetBaseDirPath}.js`,
      `${targetBaseDirPath}.jsx`,
      `${targetBaseDirPath}/index.js`,
      `${targetBaseDirPath}/index.jsx`,
    ]),
    flat,
    filter(targetPath => checkFileExist(targetPath)),
    toArray,
  )

  // TODO: 방문하지 않은 노드들만 재귀적으로 순회한다.
  await pipe(
    relatedResourceList,
    toAsync,
    filter(targetPath => isUndefined(MEMO[rootPath][targetPath])),
    each(async targetPath => {
      MEMO[rootPath][targetPath] = { path: targetPath, depth: nextDepth }
      await recursiveFindDependencies(targetPath, nextDepth, rootPath)
    })
  )
}

const run = async () => {
  const pageLength = size(ALL_PAGE_LIST)
  const progressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
    width: 30,
    total: pageLength
  })
  await pipe(
    range(pageLength),
    toAsync,
    each(async cursor => {
      const pageSourcePath = nth(cursor, ALL_PAGE_LIST) as string
      MEMO[pageSourcePath] = {};
      progressBar.tick()
      await recursiveFindDependencies(pageSourcePath, 0, pageSourcePath)
    }),
  )
  await writeFile('_PAGE_BY_DEPENDENCIES.json', JSON.stringify(MEMO))
}

run()