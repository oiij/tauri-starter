/* eslint-disable no-prototype-builtins */
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { fetch } from '@tauri-apps/plugin-http'
import axios, { AxiosError, AxiosHeaders } from 'axios'
/* eslint-disable no-console */
import NProgress from 'nprogress'

function objectToURLParams(obj: Record<string, any>) {
  const params = []
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    }
  }
  return params.length > 0 ? `?${params.join('&')}` : ''
}

const BASE_PREFIX = import.meta.env.VITE_API_BASE_PREFIX || ''
const STATUS_TEXT: { [key: number]: string } = {
  200: '200请求成功',
  400: '400请求错误',
  401: '401无权限',
  403: '403认证失败',
  404: '404找不到',
  500: '500服务器错误',
}
// 创建实例
const axiosInstance: AxiosInstance = axios.create({
  // 前缀
  baseURL: BASE_PREFIX,
  // 超时
  timeout: 1000 * 30,
  // 请求头
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: (config) => {
    return new Promise((resolve) => {
      const { url = '', method, headers, params, data } = config

      fetch(url + objectToURLParams(params), {
        method,
        headers,
        body: ['GET', 'HEAD'].includes(method?.toUpperCase() ?? '') ? undefined : data,
      }).then(async (res) => {
        const contentType = res.headers.get('content-type')
        const isText = contentType === 'text/html'
        const isJson = contentType === 'application/json'
        const resData: AxiosResponse = {
          data: isJson ? await res.json() : isText ? await res.text() : res.body,
          status: res.status,
          statusText: res.statusText,
          headers: AxiosHeaders.from(res.headers as any),
          config,
        }
        console.log(resData)

        return resolve(resData)
      }).catch((err) => {
        throw new AxiosError(err)
      })
    })
  },
})
// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO 在这里可以加上想要在请求发送前处理的逻辑
    // TODO 比如 loading 等
    if (!NProgress.isStarted())
      NProgress.start()
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done()
    if (response.status === 200)
      return response.data

    return Promise.reject(response.data)
  },
  (error: AxiosError<{ msg: string }>) => {
    NProgress.done()
    const { response, request } = error
    if (response) {
      console.log(response)

      const code = response.status
      window.$notification.error({
        title: STATUS_TEXT[code] || `${code}错误`,
        duration: 5 * 1000,
      })
      return Promise.reject(response.data)
    }
    if (request) {
      console.log(request)

      window.$notification.error({ title: '出错了~', duration: 3000 })
      return Promise.reject(error)
    }
  },
)

export const get: <RES = any, REQ = object>(
  path: string,
  data?: REQ,
) => Promise<AxiosResponse<RES, REQ>['data']> = (path, data) => {
  return axiosInstance.get(path, {
    params: data,
  })
}

export const post: <RES = any, REQ = object>(
  path: string,
  data?: REQ,
) => Promise<AxiosResponse<RES, REQ>['data']> = (path, data) => {
  return axiosInstance.post(path, data)
}
export const http = {
  get,
  post,
}
