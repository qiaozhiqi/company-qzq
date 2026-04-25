export interface User {
  id: string
  name: string
  phone: string
  avatar: string
  department: string
  position: string
  companyId: string
  companyName: string
}

export interface LoginParams {
  companyCode: string
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: User
}

export interface Location {
  name: string
  address: string
  latitude: number
  longitude: number
}

export interface TaxiOrder {
  id: string
  orderNo: string
  status: TaxiOrderStatus
  startLocation: Location
  endLocation: Location
  estimatedPrice: number
  actualPrice: number
  distance: number
  duration: number
  carType: string
  driverName: string
  driverPhone: string
  carNo: string
  createTime: string
  startTime: string
  endTime: string
  cancelReason?: string
  cancelTime?: string
}

export type TaxiOrderStatus = 
  | 'pending'      
  | 'matching'     
  | 'matched'      
  | 'driver_arrived' 
  | 'on_ride'      
  | 'completed'    
  | 'cancelled'    

export interface Hotel {
  id: string
  name: string
  image: string
  images: string[]
  address: string
  latitude: number
  longitude: number
  rating: number
  reviewCount: number
  price: number
  distance: string
  tags: string[]
  facilities: string[]
  description: string
}

export interface RoomType {
  id: string
  hotelId: string
  name: string
  image: string
  price: number
  originalPrice: number
  size: string
  bedType: string
  maxOccupancy: number
  facilities: string[]
  breakfast: string
  cancelPolicy: string
  availableCount: number
}

export interface HotelOrder {
  id: string
  orderNo: string
  status: HotelOrderStatus
  hotel: Hotel
  roomType: RoomType
  checkInDate: string
  checkOutDate: string
  nights: number
  guestName: string
  guestPhone: string
  totalPrice: number
  actualPrice: number
  createTime: string
  checkInTime?: string
  checkOutTime?: string
  cancelReason?: string
  cancelTime?: string
}

export type HotelOrderStatus = 
  | 'pending'      
  | 'confirmed'    
  | 'checked_in'   
  | 'completed'    
  | 'cancelled'    

export interface Order {
  id: string
  orderNo: string
  type: 'taxi' | 'hotel'
  status: string
  statusText: string
  title: string
  subtitle: string
  price: number
  createTime: string
  taxiOrder?: TaxiOrder
  hotelOrder?: HotelOrder
}

export interface OrderQueryParams {
  type?: 'taxi' | 'hotel' | 'all'
  status?: string
  page?: number
  pageSize?: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
