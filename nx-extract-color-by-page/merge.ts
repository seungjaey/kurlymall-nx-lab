import {writeFile} from 'fs/promises'
import {
  pipe,
  map,
  entries,
  each,
  filter,
  fromEntries,
  toArray,
  isEmpty,
  isUndefined,
  size,
} from '@fxts/core'
import PAGE_BY_DEP from './PAGE_BY_DEPENDENCIES.json'
import SOURCE_COLOR_DICTIONARY from './SOURCE_BY_COLOR_DICTIONARY.json'
import ProgressBar from 'progress';

const run = async () => {
  const pageDepSize = size(entries(PAGE_BY_DEP));
  const progressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
    width: 30,
    total: pageDepSize
  })
  const result = pipe(
    entries(PAGE_BY_DEP),
    map(tuple => {
      // @ts-ignore
      const [pagePath, dep] = tuple
      const colors = {}
      progressBar.tick()
      pipe(
        entries(dep),
        map(args => {
          // @ts-ignore
          const [dependencyPath] = args
          return dependencyPath
        }),
        // @ts-ignore
        filter(path => !isEmpty(SOURCE_COLOR_DICTIONARY[path])),
        filter(path => path !== '/Users/mk-am16-075/kurly/kurlymall-nx/src/shared/constant/colorset.ts'),
        map(path => {
          return pipe(
            // @ts-ignore
            entries(SOURCE_COLOR_DICTIONARY[path]),
            each(colorTuple => {
              const [colorCode, count] = colorTuple
              // @ts-ignore
              const isNotExist = isUndefined(colors[colorCode])
              if (isNotExist) {
                // @ts-ignore
                colors[colorCode] = count
              } else {
                // @ts-ignore
                colors[colorCode] += count
              }
            })
          )
        }),
        toArray
      )
      const child = pipe(
        entries(dep),
        map(args => {
          // @ts-ignore
          const [dependencyPath, data] = args
          const { depth } = data
          return [
            dependencyPath,
            {
              depth,
              // @ts-ignore
              colors: SOURCE_COLOR_DICTIONARY[dependencyPath]
            }
          ]
        }),
        toArray,
        // @ts-ignore
        fromEntries,
      )
      return [pagePath, { child, colors }]
    }),
    toArray
  )

  await writeFile(`${__dirname}/MERGED.json`, JSON.stringify(result))
}

run()