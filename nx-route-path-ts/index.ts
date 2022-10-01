import { pipe, map, split, join, toArray, isEmpty, filter, some } from '@fxts/core'
import { writeFile } from 'fs/promises'
import FILE_PATH_LIST from './FILE_PATH_LIST.json'

function parsePath(path: string) {
  const LAST_INDEX_ROUTE_REGEX = /\/index$/;
  if (path.lastIndexOf('/index') === -1) {
    return path;
  }
  return path.replace(LAST_INDEX_ROUTE_REGEX, '') || '/';
}

async function run() {
  const PATH_PREFIX = 'Users/hamtori/kurly/kurlymall-nx/pages';
  const FILE_EXT_REGEX = /(\.tsx)$/
  const PATH_DELIMITER = '/'
  const INDEX_ROUTE_REGEX = /(_INDEX)$/g
  const HYPHEN_DELIMITER_REGEX = /(-)/g
  const UNDER_LINE_DELIMITER = '_'
  const DYNAMIC_ROUTE_REGEX = /(\[)/
  const NUMBER_REGEX = /(\d)/

  const data = pipe(
    FILE_PATH_LIST,
    map(path => path.replace(PATH_PREFIX, '')),
    map(path => path.replace(FILE_EXT_REGEX, '')),
    filter(path => !some(
      (a) => a === path,
      ['/_app', '/_middleware', '_document']
    )),
    map(path => {
      const pathKey = pipe(
        split(PATH_DELIMITER, path),
        filter(pathArg => !isEmpty(pathArg)),
        map(pathArg => {
          if (pathArg === 'm') {
            return 'MOBILE'
          }
          if (DYNAMIC_ROUTE_REGEX.test(pathArg)) {
            return 'DETAIL'
          }
          if (NUMBER_REGEX.test(pathArg)) {
            return `ERROR_${pathArg}`
          }
          return pathArg
        }),
        map(pathArg => pathArg.toUpperCase()),
        map(pathArg => pathArg.replace(HYPHEN_DELIMITER_REGEX, UNDER_LINE_DELIMITER)),
        join(UNDER_LINE_DELIMITER)
      )
      const key = pathKey.replace(INDEX_ROUTE_REGEX, '')
      return [key, parsePath(path)]
    }),
    toArray
  )

  const pathKeyTypeStr = pipe(
    [
      `type PathKeyType = `,
      ...(
        pipe(
          data,
          map(entries => {
            const [key] = entries
            return `'${key}'`;
          }),
          join(' |\n')
        )
      ),
      `;`
    ],
    join('')
  )

  const pathKeyStr = pipe(
    [
      `const PathKey: Record<PathKeyType, PathKeyType> = {`,
      ...(
        pipe(
          data,
          map(entries => {
            const [key] = entries
            return `  ${key}: '${key}'`;
          }),
          join(',\n')
        )
      ),
      `};`
    ],
    join('')
  )

  const pathObjectStr = pipe(
    [
      `const Paths: Record<string, PathKeyType> = {`,
      ...(
        pipe(
          data,
          map(entries => {
            const [key, value] = entries
            return `\t'${value}': PathKey.${key},`
          }),
        )
      ),
      `};`
    ],
    join('\n')
  )

  await writeFile(`./RESULT.json`, JSON.stringify(data))
  await writeFile(
    `./Paths.tsx`,
      pipe(
        [pathKeyTypeStr, pathKeyStr, pathObjectStr],
        join('\n\n')
      )
    )

}

run()
