import { writeFile } from 'fs/promises';
import { extname } from 'path';
import {reverse, pipe, groupBy, map, entries, sortBy, size, toArray} from '@fxts/core';

import ProgressBar from 'progress';

import ALL_SOURCES from './ALL_PAGES_LIST.json';

const run = async () => {
  const sourceCount = size(ALL_SOURCES as string[]);
  const progressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
    width: 50,
    total: sourceCount
  })
  const summary = pipe(
    ALL_SOURCES as string[],
    map(filePath => extname(filePath)),
    groupBy((ext) => ext),
    entries,
    map(args => {
      const [ext, values] = args
      progressBar.tick()
      return [ext, size(values)]
    }),
    sortBy(args => {
      const [, count] = args
      return count
    }),
    reverse,
    toArray,
  )
  await writeFile(`${__dirname}/EXT_BREAK_DOWN.json`, JSON.stringify(summary))
}

run();