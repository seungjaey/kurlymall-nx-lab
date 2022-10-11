import { pipe, range, map, each, toAsync, toArray } from '@fxts/core';


/**
 * TODO
 * - Target User Token
 * - Target inquiry count
 * - POST : draft
 * - POST : Actual inquiry
 */
async function run() {
  await pipe(
    range(0, 10),
    toAsync,
    map(() => {

    })
  )
}
run()