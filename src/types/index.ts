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

export interface Flight {
  id: string
  airline: string
  flightNo: string
  aircraftType: string
  departureCity: string
  arrivalCity: string
  departureAirport: string
  arrivalAirport: string
  departureTime: string
  arrivalTime: string
  duration: string
  isDirect: boolean
  stopCities: string[]
  price: number
  originalPrice: number
  availableSeats: number
  cabinClass: string
  meal: string
  baggagePolicy: string
}

export interface FlightOrder {
  id: string
  orderNo: string
  status: FlightOrderStatus
  flight: Flight
  departureDate: string
  passengerName: string
  passengerId: string
  passengerPhone: string
  cabinClass: string
  seatCount: number
  totalPrice: number
  actualPrice: number
  insurance: boolean
  createTime: string
  cancelReason?: string
  cancelTime?: string
}

export type FlightOrderStatus = 
  | 'pending'      
  | 'confirmed'    
  | 'completed'    
  | 'cancelled'    

export interface Train {
  id: string
  trainNo: string
  trainType: string
  departureCity: string
  arrivalCity: string
  departureStation: string
  arrivalStation: string
  departureTime: string
  arrivalTime: string
  duration: string
  isThrough: boolean
  passStations: string[]
  price: number
  seatType: string
  availableSeats: number
}

export interface TrainOrder {
  id: string
  orderNo: string
  status: TrainOrderStatus
  train: Train
  departureDate: string
  passengerName: string
  passengerId: string
  passengerPhone: string
  seatType: string
  seatCount: number
  totalPrice: number
  actualPrice: number
  insurance: boolean
  createTime: string
  cancelReason?: string
  cancelTime?: string
}

export type TrainOrderStatus = 
  | 'pending'      
  | 'confirmed'    
  | 'completed'    
  | 'cancelled'    

export interface Order {
  id: string
  orderNo: string
  type: 'taxi' | 'hotel' | 'flight' | 'train'
  status: string
  statusText: string
  title: string
  subtitle: string
  price: number
  createTime: string
  taxiOrder?: TaxiOrder
  hotelOrder?: HotelOrder
  flightOrder?: FlightOrder
  trainOrder?: TrainOrder
}

export interface OrderQueryParams {
  type?: 'taxi' | 'hotel' | 'flight' | 'train' | 'all'
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
