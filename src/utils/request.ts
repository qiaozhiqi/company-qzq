import type { ApiResponse } from '@/types'

const BASE_URL = 'http://localhost:8080/api'
const TIMEOUT = 30000

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  timeout?: number
  showLoading?: boolean
  showError?: boolean
}

class HttpRequest {
  private baseURL: string = BASE_URL
  private timeout: number = TIMEOUT

  constructor(baseURL?: string, timeout?: number) {
    if (baseURL) this.baseURL = baseURL
    if (timeout) this.timeout = timeout
  }

  private getToken(): string | null {
    return uni.getStorageSync('token')
  }

  private showLoading(title: string = '加载中...') {
    uni.showLoading({
      title,
      mask: true
    })
  }

  private hideLoading() {
    uni.hideLoading()
  }

  private showError(message: string) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }

  private handleResponse<T>(response: any): ApiResponse<T> {
    if (response.statusCode === 200) {
      const data = response.data
      if (data.code === 200) {
        return data
      } else if (data.code === 401) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.reLaunch({
          url: '/pages/login/login'
        })
        throw new Error('登录已过期，请重新登录')
      } else {
        throw new Error(data.message || '请求失败')
      }
    } else {
      throw new Error(`请求失败: ${response.statusCode}`)
    }
  }

  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      timeout = this.timeout,
      showLoading = true,
      showError = true
    } = config

    const token = this.getToken()
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    header['Content-Type'] = 'application/json'

    if (showLoading) {
      this.showLoading()
    }

    try {
      const response = await uni.request({
        url: this.baseURL + url,
        method,
        data,
        header,
        timeout
      })

      if (showLoading) {
        this.hideLoading()
      }

      return this.handleResponse<T>(response)
    } catch (error: any) {
      if (showLoading) {
        this.hideLoading()
      }

      if (showError && error.message) {
        this.showError(error.message)
      }

      throw error
    }
  }

  get<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      data,
      ...config
    })
  }

  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  delete<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      data,
      ...config
    })
  }
}

export const http = new HttpRequest()
export default http
