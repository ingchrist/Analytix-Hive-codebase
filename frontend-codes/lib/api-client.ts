import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { tokenStorage, formatError } from './utils'
import { toast } from 'sonner'

// API Response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  status?: number
  field_errors?: Record<string, string[]>
}

class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    // Use the current host for the API base URL in development
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 
                   (typeof window !== 'undefined' 
                     ? `${window.location.protocol}//${window.location.hostname}:8000`
                     : 'http://0.0.0.0:8000')

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenStorage.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        const formattedError = this.handleError(error)

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401) {
          tokenStorage.clearTokens()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth'
          }
        }

        return Promise.reject(formattedError)
      }
    )
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      let message = 'An error occurred'
      let field_errors: Record<string, string[]> | undefined

      if (data?.detail) {
        message = data.detail
      } else if (data?.message) {
        message = data.message
      } else if (data?.error) {
        message = data.error
      } else if (data?.non_field_errors) {
        message = Array.isArray(data.non_field_errors)
          ? data.non_field_errors[0]
          : data.non_field_errors
      } else if (typeof data === 'string') {
        message = data
      }

      // Handle field-specific errors
      if (data && typeof data === 'object') {
        field_errors = {}
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            field_errors![key] = data[key]
          } else if (typeof data[key] === 'string') {
            field_errors![key] = [data[key]]
          }
        })

        // If we have field errors but no general message, create one
        if (Object.keys(field_errors).length > 0 && message === 'An error occurred') {
          message = 'Please check the form for errors'
        }
      }

      return {
        message,
        status,
        field_errors: Object.keys(field_errors || {}).length > 0 ? field_errors : undefined
      }
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0
      }
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
      }
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // File upload method
  async uploadFile<T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })

    return response.data
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/api/core/health/')
      return true
    } catch (error) {
      return false
    }
  }

  // Get base URL
  getBaseURL(): string {
    return this.baseURL
  }
}

// Create and export the singleton instance
export const apiClient = new ApiClient()

// Helper function to handle API errors in components
export const handleApiError = (error: ApiError, showToast = true) => {
  if (showToast) {
    toast.error(error.message)
  }

  // Log error for debugging
  console.error('API Error:', error)

  return error
}

// Type guards
export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.message === 'string'
}

export default apiClient