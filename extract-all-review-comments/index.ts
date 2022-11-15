import {writeFile} from 'fs/promises'
import axios, {AxiosInstance} from 'axios'
import {pipe, range, toAsync, map, toArray, flat, take, takeUntil, size} from '@fxts/core'
import { config } from 'dotenv'

// NOTE: Setup env
config()

const Config = {
  GH_API: `${process.env.GH_API_PROTOCOL}://${process.env.GH_API_HOST}`,
  GH_PAT: process.env.GH_PAT
}

const fetchAllReviews = async (client: AxiosInstance, page: number) => {
  try {
    const { data } = await client.get(`/repos/thefarmersfront/kurlymall-nx/pulls/comments?page=${page}&per_page=20`)
    return data
  } catch (error) {
    console.warn(`Invalid Response : ${page}`)
    return []
  }
}

const run = async () => {
  const {GH_API, GH_PAT} = Config

  const httpClient = axios.create({
    baseURL: `${GH_API}`,
    headers: {
      Authorization: `Bearer ${GH_PAT}`
    },
  })

  const ALL_REVIEW_LIST = await pipe(
    range(1, Infinity),
    toAsync,
    map( i => fetchAllReviews(httpClient, i)),
    takeUntil(a => size(a) === 0),
    flat,
    toArray,
  )

  await writeFile(`${__dirname}/ALL_REVIEW_LIST.json`, JSON.stringify(ALL_REVIEW_LIST))
}

run()