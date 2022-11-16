import {readFile, writeFile} from 'fs/promises';

import {filter, sum, pipe, toAsync, map, toArray, flat, size, sortBy} from '@fxts/core';

import ProgressBar from 'progress';

import ALL_SOURCES from './ALL_PAGES_LIST.json';

const calculateMedian = (arr: number[]) => {
  const length = size(arr);
  const middleIndex = Math.floor(length / 2);
  const oddLength = length % 2 != 0;
  return oddLength
    ? arr[middleIndex]
    : (arr[middleIndex] + arr[middleIndex - 1]) / 2;
}

const run = async () => {
  const sourceCount = size(ALL_SOURCES as string[]);
  const sourceCodeProgressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
    width: 50,
    total: sourceCount
  })
  const perLineTextList = await pipe(
    ALL_SOURCES as string[],
    toAsync,
    map(async filePath => {
      const buffer = await readFile(filePath)
      return buffer.toString()
    }),
    map(fileContent => {
      sourceCodeProgressBar.tick()
      return fileContent.split('\n')
    }),
    flat,
    map(lineText => size(lineText)),
    filter(lineTextCount => lineTextCount > 80),
    sortBy(lineTextCount => lineTextCount),
    toArray
  )

  const total = pipe(
    perLineTextList,
    sum,
  );
  const lineCount = size(perLineTextList);
  const average = Math.ceil(total/lineCount);
  const median = calculateMedian(perLineTextList)
  console.log(`Average : ${total}/${lineCount} = ${average}`);
  console.log(`Median : ${lineCount} = ${median}`);
  await writeFile(`${__dirname}/RESULT.json`, JSON.stringify(perLineTextList));
}

run();