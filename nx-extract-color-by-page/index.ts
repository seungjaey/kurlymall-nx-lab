import {resolve, dirname} from 'path';
import {readFile, readdir, writeFile} from 'fs/promises';
import {
  pipe,
  map,
  filter,
  toArray,
  toAsync,
  nth,
  flat,
  isEmpty,
  concurrent
} from '@fxts/core'

type PageItem = string;

async function checkFileExist(path: string) {
  try {
    await readFile(path)
    return true
  } catch (error) {
    return false
  }
}

// 디렉토리는 빼고 파일들만 재귀적으로 읽는다.
async function extractPages(pagesDir: string): Promise<PageItem[]> {
  const dirContents = await readdir(pagesDir, {
    withFileTypes: true,
  });

  const files = await pipe(
    dirContents,
    toAsync,
    filter((content)=> content.isFile()),
    map(async({name}) => {
      const absolutePath = `${pagesDir}/${name}`
      return absolutePath;
    }),
    toArray,
  ) as PageItem[]

  const dirs = await pipe(
    dirContents,
    toAsync,
    filter((content)=> content.isDirectory()),
    map(async ({name}) => {
      const absolutePath = `${pagesDir}/${name}`
      const fileList = await extractPages(absolutePath)
      return fileList
    }),
    flat,
    toArray,
  ) as PageItem[]

  return [...files, ...dirs];
}

const IMPORT_REGEX = /import(?:(?:(?:[ \n\t]+([^ *\n\t\{\},]+)[ \n\t]*(?:,|[ \n\t]+))?([ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)|[ \n\t]*\*[ \n\t]*as[ \n\t]+([^ \n\t\{\}]+)[ \n\t]+)from[ \n\t]*(?:['"])([^'"\n]+)(['"])/gm;
const checkNodeModuleByPath = (path: string) => !(path.startsWith('.') || path.startsWith('..'));

type ChildFileTuple = [number, string]

async function findFileInDepth(aPath: string, depth: number = 0): Promise<[string, ChildFileTuple[]]> {
  const buffer = await readFile(aPath)
  const fileContent = buffer.toString()
  const regexIter = fileContent.matchAll(IMPORT_REGEX)
  const baseDirPath = dirname(aPath)

  const arbitraryTargetFileList = pipe(
    regexIter,
    map(iter => nth(4, iter) || ''),
    filter(targetPath => !checkNodeModuleByPath(targetPath)),
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
    toArray,
  )

  const actualFileList = await pipe(
    arbitraryTargetFileList,
    toAsync,
    map(async targetPath => {
      const result = await checkFileExist(targetPath)
      return [targetPath, result]
    }),
    filter(args => {
      const [_, result] = args
      return result
    }),
    map( args => {
      const [targetPath] = args
      return targetPath
    }),
    concurrent(8),
    toArray,
  )

  if (isEmpty(actualFileList)) {
    return ['end', []]
  }

  const result = await pipe(
    actualFileList,
    toAsync,
    map(async filePath => {
      console.log(`${depth}\tfile = ${filePath}`)
      const childFile = await findFileInDepth(filePath as string, depth + 1)
      return [[filePath], [childFile]]
    }),
    flat,
    concurrent(10),
    toArray,
  ) as ChildFileTuple[]

  return [aPath, result]
}

async function run(workingDir: string) {
  const allPageSourcePathList = await extractPages(`${workingDir}/pages`);

  const result = await pipe(
    allPageSourcePathList,
    toAsync,
    map(async pageSourcePath => {
      console.log(`pageSourcePath = ${pageSourcePath}`)
      const targetPaths = await findFileInDepth(pageSourcePath)
      return [pageSourcePath, targetPaths]
    }),
    toArray
  )

  await writeFile('temp-result.json', JSON.stringify(result))
  /*
    {
      [path1, 1depth, 2depth,.....n-depth],

    }
    await pipe(

    )

  */


  /*
  const data = await pipe(
    allPages,
    toAsync,
    map(async args => {
      const aPath = args
      const buffer = await readFile(aPath)
      const fileContent = buffer.toString()
      const regexIter = fileContent.matchAll(IMPORT_REGEX)
      const basePath = dirname(aPath)
      // 0: import expression, 1: match1, 2:, 3, 4, 5,
      return [
        aPath,
        pipe(
          regexIter,
          map(iter => {
            const targetPath = nth(4, iter) || ''
            return targetPath
          }),
          filter((targetPath) => !checkNodeModuleByPath(targetPath)),
          map(targetPath => {
            const targetBasePath = resolve(basePath, targetPath)
            return [
              `${targetBasePath}.ts`,
              `${targetBasePath}.tsx`,
              `${targetBasePath}/index.ts`,
              `${targetBasePath}/index.tsx`,
              `${targetBasePath}.js`,
              `${targetBasePath}.jsx`,
              `${targetBasePath}/index.js`,
              `${targetBasePath}/index.jsx`,
            ]
          }),
          flat,
          toArray,
        )
      ]
    }),
    toArray,
  )

  const finalFileList = await pipe(
    data,
    toAsync,
    map(async args => {
      const [aPath, pathList] = args
      const validFile = await pipe(
        pathList,
        toAsync,
        map(async path => {
          const result = await checkFileExist(path)
          return [path, result]
        }),
        filter(args => {
          const [_, result] = args
          return result
        }),
        map((args) => {
          const [path] = args
          return path
        }),
        flat,
        toArray,
      )
      return [aPath, validFile]
    }),
    toArray
  )

   */
}

run('/Users/hamtori/kurly/kurlymall-nx')

/*
async function run(workingDir: string) {
  // NOTE: pages 경로들을 모두 읽어들인다.
  const pageListBuffer = await readFile(`${__dirname}/page_list.txt`);

  const IMPORT_REGEX = /import(?:(?:(?:[ \n\t]+([^ *\n\t\{\},]+)[ \n\t]*(?:,|[ \n\t]+))?([ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)|[ \n\t]*\*[ \n\t]*as[ \n\t]+([^ \n\t\{\}]+)[ \n\t]+)from[ \n\t]*(?:['"])([^'"\n]+)(['"])/gm;
  // TODO: Dynamic import (dynamic(() => import('x'))

  const pageList = await pipe(
    split('\n', pageListBuffer.toString()),
    toAsync,
    map(path => {
      return `${workingDir}/${path}`
    }),
    map(async aPath => {
      const buffer = await readFile(aPath)
      return [aPath, buffer.toString()]
    }),
    take(1),
  )

  const result = pipe(
    pageList,
    // toAsync,
    map(args => {
      const [aPath, fileContent] = args
      const regexIter = fileContent.matchAll(IMPORT_REGEX)
      // 0: import expression, 1: match1, 2:, 3, 4, 5,
      return pipe(
        regexIter,
        map(iter => {
          return [
            aPath,
            nth(1, iter) || 'na',
            nth(2, iter) || 'na',
            nth(4, iter),
          ]
        }),
      )
    }),
    toArray,
  )

  console.log(result);

  const pageResourceDir = `${workingDir}/pages`
  const baseFilePath = `${workingDir}/mypage/emoney/index.tsx`
  const baseFileDirPath = dirname(baseFilePath)

  const targetPath = resolve(baseFilePath, '../../../src/footer/components/Footer')
  const targetDir = dirname(targetPath)

  console.log(targetPath)
  const result = await opendir(dirname(targetPath))
  console.log(result)
}

run( '/Users/mk-am16-075/kurly/kurlymall-nx')
*/