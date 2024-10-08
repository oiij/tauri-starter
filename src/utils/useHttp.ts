/* eslint-disable no-console */
import type { ClientOptions } from '@tauri-apps/plugin-http'
import { fetch } from '@tauri-apps/plugin-http'

function objectToURLParams(obj?: Record<string, any>) {
  const params = new URLSearchParams()
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      params.append(key, obj[key])
    }
  }
  return params.toString()
}

const BASE_PREFIX = import.meta.env.VITE_API_BASE_URL || ''

type Options = RequestInit & ClientOptions & {
  data?: Record<string, any>
}
interface RequestResult<D extends object | string = any> {
  data: D
  request?: any
  status: number
  statusText: string
  url: string
  headers: Options['headers']
}
function request< D extends object | string = any>(url: string, options?: Options) {
  const token = ''
  const { method = 'get', headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }, data } = options ?? {}
  return new Promise<D>((resolve, reject) => {
    const _url = `${BASE_PREFIX}${url}${method === 'get' ? objectToURLParams(data) : ''}`
    const _data = ['GET', 'HEAD'].includes(method.toUpperCase()) ? undefined : JSON.stringify(data)
    fetch(_url, {
      method,
      body: _data,
      headers,
      ...options,
    }).then(async (res) => {
      const { ok, status, statusText, url, headers } = res
      const contentType = headers.get('content-type')
      const isText = contentType === 'text/html'
      const isJson = contentType === 'application/json'
      const result: RequestResult<D> = {
        data: isJson ? await res.json() : isText ? await res.text() : res.body,
        request: { url: _url, method, data, headers, options },
        status,
        statusText,
        url,
        headers,
      }
      if (ok) {
        if (status === 200) {
          console.info(result)

          return resolve(result.data)
        }
        else {
          console.error(result)
          window.$message.error(result.statusText)
          return reject(result.data)
        }
      }
      else {
        console.error(result)
        window.$message.error(result.statusText)
        return reject(result.data)
      }
    }).catch((err: { data: any, status: number, statusText: string, headers: Record<string, string> }) => {
      console.error(err)
      window.$message.error(err.statusText)
      return reject(err.data)
    })
  })
}

export function get<RES extends string | object>(path: string, data?: Record<string, any>) {
  return request<RES>(path, {
    method: 'get',
    data,
  })
}
export function post<RES extends string | object>(path: string, data?: Record<string, any>) {
  return request<RES>(path, {
    method: 'post',
    data,
  })
}
