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
  status: number
  statusText: string
  url: string
  headers: HeadersInit
}
function request< D extends object | string = any>(url: string, options?: Options) {
  const { method = 'get', headers = {
    'Content-Type': 'application/json',
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
      const data: RequestResult<D> = {
        data: isJson ? await res.json() : isText ? await res.text() : res.body,
        status,
        statusText,
        url,
        headers,
      }
      if (ok) {
        if (status === 200) {
          return resolve(data.data)
        }
        else {
          console.error(data)
          window.$message.error(data.statusText)
          return reject(data.data)
        }
      }
      else {
        console.error(data)
        window.$message.error(data.statusText)
        return reject(data.data)
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
