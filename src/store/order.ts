import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, TaxiOrder, HotelOrder, OrderQueryParams, PageResult } from '@/types'
import { mockOrders, mockTaxiOrders, mockHotelOrders, getTaxiOrderStatusText, getHotelOrderStatusText } from '@/mock'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const taxiOrders = ref<TaxiOrder[]>([])
  const hotelOrders = ref<HotelOrder[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)

  const getOrders = async (params?: OrderQueryParams): Promise<PageResult<Order>> => {
    loading.value = true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredOrders = [...mockOrders]
        
        if (params?.type && params.type !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.type === params.type)
        }
        
        if (params?.status) {
          filteredOrders = filteredOrders.filter(order => order.status === params.status)
        }
        
        const page = params?.page || 1
        const pageSize = params?.pageSize || 10
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedOrders = filteredOrders.slice(start, end)
        
        orders.value = paginatedOrders
        
        const result: PageResult<Order> = {
          list: paginatedOrders,
          total: filteredOrders.length,
          page,
          pageSize,
          totalPages: Math.ceil(filteredOrders.length / pageSize)
        }
        
        loading.value = false
        resolve(result)
      }, 500)
    })
  }

  const getTaxiOrders = async (status?: string): Promise<TaxiOrder[]> => {
    loading.value = true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mockTaxiOrders]
        
        if (status) {
          filtered = filtered.filter(order => order.status === status)
        }
        
        taxiOrders.value = filtered
        loading.value = false
        resolve(filtered)
      }, 500)
    })
  }

  const getHotelOrders = async (status?: string): Promise<HotelOrder[]> => {
    loading.value = true
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mockHotelOrders]
        
        if (status) {
          filtered = filtered.filter(order => order.status === status)
        }
        
        hotelOrders.value = filtered
        loading.value = false
        resolve(filtered)
      }, 500)
    })
  }

  const getOrderDetail = async (id: string, type: 'taxi' | 'hotel'): Promise<Order> => {
    loading.value = true
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === id && o.type === type)
        
        if (order) {
          currentOrder.value = order
          loading.value = false
          resolve(order)
        } else {
          loading.value = false
          reject(new Error('订单不存在'))
        }
      }, 300)
    })
  }

  const cancelTaxiOrder = async (orderId: string, reason: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = mockTaxiOrders.find(o => o.id === orderId)
        if (order) {
          order.status = 'cancelled'
          order.cancelReason = reason
          order.cancelTime = new Date().toISOString()
        }
        resolve(true)
      }, 500)
    })
  }

  const cancelHotelOrder = async (orderId: string, reason: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = mockHotelOrders.find(o => o.id === orderId)
        if (order) {
          order.status = 'cancelled'
          order.cancelReason = reason
          order.cancelTime = new Date().toISOString()
        }
        resolve(true)
      }, 500)
    })
  }

  return {
    orders,
    taxiOrders,
    hotelOrders,
    currentOrder,
    loading,
    getOrders,
    getTaxiOrders,
    getHotelOrders,
    getOrderDetail,
    cancelTaxiOrder,
    cancelHotelOrder
  }
})
