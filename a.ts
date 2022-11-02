import { createWriteStream } from 'fs'
import { range, pipe, each } from '@fxts/core'

function run() {
  const stream = createWriteStream('/Users/hamtori/kurly/kurlymall-nx-lab/sample.txt', {
    autoClose: false
  });

  try {
    pipe(
      range(10),
      each(i => {
        stream.write(`test-${i}`)
      })
    )
    stream.close()

  } catch (error) {
    console.log(error)
    stream.close()
  }
}