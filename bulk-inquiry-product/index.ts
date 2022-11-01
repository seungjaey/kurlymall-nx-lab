import { pipe, range, map, each, toAsync, toArray } from '@fxts/core';
import axios, {AxiosInstance} from 'axios';

interface BasePostData {
  contents: string | null
  id: number
  is_secret: boolean | null
  subject: string | null
}

interface InquiryDraftResponse {
  data: BasePostData;
  message: string | null
  success: boolean
}

interface InquiryResponse {
  data: BasePostData;
  message: string | null
  success: boolean
}

/**
 * TODO
 * - Target User Token
 * - Target inquiry count
 * - POST : draft
 * - POST : Actual inquiry
 */
// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjYXJ0X2lkIjoiZDY5NjI1ZDYtNDZlMy00MTEyLTg4ODAtNmM2ZTQ5ODBlMzU4IiwiaXNfZ3Vlc3QiOmZhbHNlLCJ1dWlkIjoiYTlmY2VmNWItOWY4ZS01YTdmLTk1NDEtMjBjZDc4N2Q5ZGNjIiwibV9ubyI6MjUzMzA1NzYsIm1faWQiOiJ0aGVwdXJwbGV1c2VyIiwibGV2ZWwiOjEsInN1YiI6ImE5ZmNlZjViLTlmOGUtNWE3Zi05NTQxLTIwY2Q3ODdkOWRjYyIsImlzcyI6Imh0dHBzOi8vYXBpLnBlcmYua3VybHkuY29tL3YzL2F1dGgvcmVmcmVzaCIsImlhdCI6MTY2NTQ3MzE5NiwiZXhwIjoxNjY1NDc2ODA5LCJuYmYiOjE2NjU0NzMyMDksImp0aSI6IjZ5QmRRYU4yOWg4dktYaHIifQ.q-oqle8vNHJXBo7txtsyqH20aqPLBkV5VkZBx4PSxpw

const postInquiryDraft = async (client: AxiosInstance, productCode: string): Promise<number> => {
  const { data } = await client.post<InquiryDraftResponse>(`/board/v1/product-inquiry/content-products/${productCode}/posts/draft`)
  const { data: { id } } = data
  return id
};

const postInquiry = async (client: AxiosInstance, productCode: string, postId: number, postData: BasePostData) => {
  await client.post<InquiryResponse>(`/board/v1/product-inquiry/content-products/${productCode}/posts/${postId}`, postData)
  return true
};


async function run() {
  const TARGET_PRODUCT_CODE = '5116466';
  const httpClient = axios.create({
    baseURL: 'https://api.perf.kurly.com',
    headers: {
      authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjYXJ0X2lkIjoiYjhmN2E2NjEtOGMxNi00MmM3LThjZTktNDE5ODcxZDc2MmNjIiwiaXNfZ3Vlc3QiOmZhbHNlLCJ1dWlkIjoiOTBlMDljYmEtZjhiYi01ZGFlLWEwMDUtNjY3YjFmYWYxMTExIiwibV9ubyI6MjUzMzA1ODMsIm1faWQiOiJwdXJwbGV1c2VyIiwibGV2ZWwiOjE0LCJzdWIiOiI5MGUwOWNiYS1mOGJiLTVkYWUtYTAwNS02NjdiMWZhZjExMTEiLCJpc3MiOiJodHRwczovL2FwaS5wZXJmLmt1cmx5LmNvbS92My9hdXRoL3JlZnJlc2giLCJpYXQiOjE2NjcyODIyNTgsImV4cCI6MTY2NzI5MTM0NCwibmJmIjoxNjY3Mjg3NzQ0LCJqdGkiOiJKdjJ6VHk5ckZnWGxnbXlqIn0.ts7kA9OGuUyz9CHWzzH3Lu8Yh_TE7gPDYpvzA87YiBc'
    },
  });

  await pipe(
    range(0, 40),
    map(i => ({
      id: null,
      contents: `[pre 2.7.2] 상품문의_테스트_${i}`,
      is_secret: true,
      subject: `[pre 2.7.2] 상품문의_테스트_${i}`,
    })),
    toAsync,
    map(async post => {
      const id = await postInquiryDraft(httpClient, TARGET_PRODUCT_CODE)
      return {
        ...post,
        id,
      };
    }),
    each(async post => {
      const { id } = post
      await postInquiry(httpClient, TARGET_PRODUCT_CODE, id, post)
    })
  )
}

run()