import {resolve, dirname} from 'path';
import {readFile, readdir, opendir} from 'fs/promises';
import {pipe, map, filter, split, toArray, take, toAsync, nth} from '@fxts/core'


async function run(workingDir: string) {
  // NOTE: pages 경로들을 모두 읽어들인다.
  const pageListBuffer = await readFile(`${__dirname}/page_list.txt`);

  const IMPORT_REGEX = /import(?:(?:(?:[ \n\t]+([^ *\n\t\{\},]+)[ \n\t]*(?:,|[ \n\t]+))?([ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)|[ \n\t]*\*[ \n\t]*as[ \n\t]+([^ \n\t\{\}]+)[ \n\t]+)from[ \n\t]*(?:['"])([^'"\n]+)(['"])/gm;

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
  console.log(pageList);

  pipe(
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
    })
  )





  /*
  const pageResourceDir = `${workingDir}/pages`
  const baseFilePath = `${workingDir}/mypage/emoney/index.tsx`
  const baseFileDirPath = dirname(baseFilePath)

  const targetPath = resolve(baseFilePath, '../../../src/footer/components/Footer')
  const targetDir = dirname(targetPath)

  console.log(targetPath)
  const result = await opendir(dirname(targetPath))
  console.log(result)
  */
}

run( '/Users/mk-am16-075/kurly/kurlymall-nx')