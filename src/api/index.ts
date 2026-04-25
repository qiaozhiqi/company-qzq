import http from '@/utils/request'
import type { 
  User, 
  LoginParams, 
  LoginResult,
  TaxiOrder,
  Hotel,
  RoomType,
  HotelOrder,
  Order,
  OrderQueryParams,
  PageResult,
  Location
} from '@/types'

// ==================== 认证相关接口 ====================

export const authApi = {
  login: (params: LoginParams) => {
    return http.post<LoginResult>('/auth/login', params)
  },

  logout: () => {
    return http.post<void>('/auth/logout')
  },

  refreshToken: () => {
    return http.post<{ token: string }>('/auth/refresh')
  },

  getCurrentUser: () => {
    return http.get<User>('/auth/user')
  },

  updateProfile: (data: Partial<User>) => {
    return http.put<User>('/auth/profile', data)
  }
}

// ==================== 打车相关接口 ====================

export const taxiApi = {
  getNearbyDrivers: (location: Location) => {
    return http.post<{ drivers: any[] }>('/taxi/nearby-drivers', location)
  },

  estimatePrice: (params: {
    startLocation: Location
    endLocation: Location
    carType: string
  }) => {
    return http.post<{
      estimatedPrice: number
      distance: number
      duration: number
    }>('/taxi/estimate-price', params)
  },

  createOrder: (params: {
    startLocation: Location
    endLocation: Location
    carType: string
    passengerName: string
    passengerPhone: string
    remark?: string
  }) => {
    return http.post<TaxiOrder>('/taxi/orders', params)
  },

  cancelOrder: (orderId: string, reason: string) => {
    return http.post<void>(`/taxi/orders/${orderId}/cancel`, { reason })
  },

  getOrderDetail: (orderId: string) => {
    return http.get<TaxiOrder>(`/taxi/orders/${orderId}`)
  },

  getOrderList: (params?: {
    status?: string
    page?: number
    pageSize?: number
  }) => {
    return http.get<PageResult<TaxiOrder>>('/taxi/orders', params)
  },

  getOngoingOrder: () => {
    return http.get<TaxiOrder | null>('/taxi/orders/ongoing')
  }
}

// ==================== 酒店相关接口 ====================

export const hotelApi = {
  searchHotels: (params: {
    city: string
    keyword?: string
    checkInDate: string
    checkOutDate: string
    minPrice?: number
    maxPrice?: number
    starLevel?: number
    page?: number
    pageSize?: number
  }) => {
    return http.get<PageResult<Hotel>>('/hotels', params)
  },

  getHotelDetail: (hotelId: string) => {
    return http.get<Hotel>(`/hotels/${hotelId}`)
  },

  getRoomTypes: (hotelId: string, params?: {
    checkInDate?: string
    checkOutDate?: string
  }) => {
    return http.get<RoomType[]>(`/hotels/${hotelId}/rooms`, params)
  },

  getRoomDetail: (roomId: string) => {
    return http.get<RoomType>(`/hotels/rooms/${roomId}`)
  },

  createOrder: (params: {
    hotelId: string
    roomTypeId: string
    checkInDate: string
    checkOutDate: string
    guestName: string
    guestPhone: string
    remark?: string
  }) => {
    return http.post<HotelOrder>('/hotel/orders', params)
  },

  cancelOrder: (orderId: string, reason: string) => {
    return http.post<void>(`/hotel/orders/${orderId}/cancel`, { reason })
  },

  getOrderDetail: (orderId: string) => {
    return http.get<HotelOrder>(`/hotel/orders/${orderId}`)
  },

  getOrderList: (params?: {
    status?: string
    page?: number
    pageSize?: number
  }) => {
    return http.get<PageResult<HotelOrder>>('/hotel/orders', params)
  }
}

// ==================== 订单相关接口（统一查询） ====================

export const orderApi = {
  getAllOrders: (params?: OrderQueryParams) => {
    return http.get<PageResult<Order>>('/orders', params)
  },

  getOrderStatistics: () => {
    return http.get<{
      taxiOrders: { total: number; pending: number; completed: number }
      hotelOrders: { total: number; pending: number; completed: number }
      totalSpent: number
    }>('/orders/statistics')
  }
}

// ==================== 地址相关接口 ====================

export const addressApi = {
  getCommonAddresses: () => {
    return http.get<Location[]>('/addresses/common')
  },

  addCommonAddress: (address: Location & { type: string }) => {
    return http.post<Location>('/addresses/common', address)
  },

  updateCommonAddress: (id: string, address: Partial<Location>) => {
    return http.put<Location>(`/addresses/common/${id}`, address)
  },

  deleteCommonAddress: (id: string) => {
    return http.delete<void>(`/addresses/common/${id}`)
  },

  searchAddress: (keyword: string, city?: string) => {
    return http.get<Location[]>('/addresses/search', { keyword, city })
  },

  getCurrentLocation: () => {
    return http.get<Location>('/addresses/current')
  }
}

// ==================== 企业相关接口 ====================

export const companyApi = {
  getCompanyInfo: () => {
    return http.get<{
      id: string
      name: string
      code: string
      balance: number
      creditLimit: number
    }>('/company/info')
  },

  getInvoiceInfo: () => {
    return http.get<{
      companyName: string
      taxNumber: string
      address: string
      phone: string
      bankName: string
      bankAccount: string
    }>('/company/invoice')
  },

  updateInvoiceInfo: (data: any) => {
    return http.put<void>('/company/invoice', data)
  }
}

export default {
  auth: authApi,
  taxi: taxiApi,
  hotel: hotelApi,
  order: orderApi,
  address: addressApi,
  company: companyApi
}
