import { pipe, map, split, join, toArray, isEmpty, filter, some } from '@fxts/core'
import { writeFile } from 'fs/promises'
import FILE_PATH_LIST from './FILE_PATH_LIST.json'

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
      return [key, path]
    }),
    toArray
  )

  const pathTypeStr = pipe(
    [
      `type PathKey = `,
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

  const pathObjectStr = pipe(
    [
      `const Paths: Record<PathKey, string> = {`,
      ...(
        pipe(
          data,
          map(entries => {
            const [key, value] = entries
            return `\t${key}: '${value}',`
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
        [pathTypeStr, pathObjectStr],
        join('\n\n')
      )
    )

}

run()
