/* eslint-disable no-console */

import type {
  AxiosInstance,
  AxiosPromise,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { fetch } from '@tauri-apps/plugin-http'
import axios, {
  AxiosError,
} from 'axios'
import { stringify } from 'qs'

const BASE_PREFIX = window.isTauri ? import.meta.env.VITE_API_BASE_URL : import.meta.env.VITE_API_BASE_PREFIX
function tauriAdapter(config: InternalAxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const controller = new AbortController()
    const { baseURL, url, method, params, data, headers, timeout, signal, validateStatus } = config
    if (data instanceof FormData) {
      headers.delete('Content-Type')
    }
    if (signal) {
      signal.onabort = () => {
        controller.abort()
      }
    }
    const _url = `${baseURL}${url}${params ? `?${stringify(params, { arrayFormat: 'brackets' })}` : ''}`

    fetch(_url, {
      method,
      body: data,
      headers,
      signal: controller.signal,
      connectTimeout: timeout,
    }).then(async (res) => {
      const { status, statusText, headers } = res
      const contentType = headers.get('content-type')
      const isText = contentType === 'text/html'
      const isJson = contentType === 'application/json'
      const response: AxiosResponse = {
        data: isJson ? await res.json() : isText ? await res.text() : res.body,
        status,
        statusText,
        headers: headers as any,
        config,
        request: '',

      }
      if (validateStatus)
        return validateStatus(status) ? resolve(response) : reject(new AxiosError(statusText, `${status}`, config, undefined, response))
      return status >= 200 && status < 300 ? resolve(response) : reject(new AxiosError(statusText, `${status}`, config, undefined, response))
    }).catch((err) => {
      return reject(new AxiosError('fetch-error', '400', config, {}, err))
    })
  })
}
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_PREFIX,
  timeout: 1000 * 30,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: window.isTauri ? tauriAdapter : undefined,
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error: AxiosError) => {
    console.error('request-error', error)
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('response', response)
    return response.data
  },
  (error: AxiosError) => {
    console.error('response-error', error)
    window.$message.error(error.message)
    return Promise.reject(error)
  },
)

export function get<RES = any, REQ = object>(path: string, data?: REQ): Promise<RES> {
  return axiosInstance(path, {
    method: 'get',
    params: data,
  })
}
export function post<RES extends string | object>(path: string, data?: Record<string, any>): Promise<RES> {
  return axiosInstance(path, {
    method: 'post',
    data,
  })
}
