import {resolve, dirname} from 'path';
import {readFile, readdir} from 'fs/promises';
import {
  pipe,
  map,
  filter,
  toArray,
  toAsync,
  nth,
  flat,
  isEmpty,
  concurrent,
  each
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

/*
  원하는 데이터

  data = [
    {
      [pageFileName]: [
        // {
         depth: number,
         parentFilePath: string
         childFilePath: string
        },
        {
          depth: number,
          parentFilePath,
          childFilePath
        }
      ]
    }
  ]
*/

interface InternalDependencyItem {
  depth: number
  list: InternalDependencyItem[]
}

const REF_DATA: Record<string, Partial<InternalDependencyItem>> = {} as const

function recursiveRetrieveInternalDependencies(depth: number = 0, path: string) {
  // TODO: ReadFile(path)
  // TODO: Extract dependencies []
  // TODO: Set dependencies []
  // TODO: Recursive

}

async function run(workingDir: string) {
  const totalPageSourcePathList = await extractPages(`${workingDir}/pages`);

  pipe(
    totalPageSourcePathList,
    // TODO: 페이지를 순회하며 하위 의존성 배열을 재귀적으로 생성한다.
    each(path => {
      recursiveRetrieveInternalDependencies(0, path)
    })
  )

  /// await writeFile('temp-result.json', JSON.stringify(allPageSourcePathList))
  /*
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
   */
  // await writeFile('temp-result.json', JSON.stringify(result))
}

// run('/Users/hamtori/kurly/kurlymall-nx')
run('/Users/mk-am16-075/kurly/kurlymall-nx')
