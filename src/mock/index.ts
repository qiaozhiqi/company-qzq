import type { User, TaxiOrder, Hotel, RoomType, HotelOrder, Order, Location } from '@/types'

export const mockUser: User = {
  id: 'user_001',
  name: '张三',
  phone: '13800138000',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20business%20portrait%20of%20a%20chinese%20male%20employee%20in%20suit&image_size=square',
  department: '技术部',
  position: '高级工程师',
  companyId: 'company_001',
  companyName: '某某科技有限公司'
}

export const mockLocations: Location[] = [
  {
    name: '公司总部',
    address: '北京市朝阳区建国路88号SOHO现代城',
    latitude: 39.91,
    longitude: 116.46
  },
  {
    name: '家',
    address: '北京市海淀区中关村大街1号',
    latitude: 39.98,
    longitude: 116.31
  },
  {
    name: '北京首都国际机场',
    address: '北京市顺义区机场西路',
    latitude: 40.08,
    longitude: 116.60
  },
  {
    name: '北京南站',
    address: '北京市丰台区永定门外大街',
    latitude: 39.87,
    longitude: 116.38
  }
]

export const mockTaxiOrders: TaxiOrder[] = [
  {
    id: 'taxi_001',
    orderNo: 'TX202401150001',
    status: 'completed',
    startLocation: {
      name: '公司总部',
      address: '北京市朝阳区建国路88号SOHO现代城',
      latitude: 39.91,
      longitude: 116.46
    },
    endLocation: {
      name: '北京首都国际机场',
      address: '北京市顺义区机场西路',
      latitude: 40.08,
      longitude: 116.60
    },
    estimatedPrice: 120,
    actualPrice: 125.5,
    distance: 28.5,
    duration: 45,
    carType: '舒适型',
    driverName: '李师傅',
    driverPhone: '13900139000',
    carNo: '京A12345',
    createTime: '2024-01-15 08:30:00',
    startTime: '2024-01-15 08:35:00',
    endTime: '2024-01-15 09:20:00'
  },
  {
    id: 'taxi_002',
    orderNo: 'TX202401140002',
    status: 'on_ride',
    startLocation: {
      name: '北京南站',
      address: '北京市丰台区永定门外大街',
      latitude: 39.87,
      longitude: 116.38
    },
    endLocation: {
      name: '公司总部',
      address: '北京市朝阳区建国路88号SOHO现代城',
      latitude: 39.91,
      longitude: 116.46
    },
    estimatedPrice: 45,
    actualPrice: 0,
    distance: 12.3,
    duration: 25,
    carType: '经济型',
    driverName: '王师傅',
    driverPhone: '13900139001',
    carNo: '京B67890',
    createTime: '2024-01-14 14:20:00',
    startTime: '2024-01-14 14:25:00',
    endTime: ''
  }
]

export const mockHotels: Hotel[] = [
  {
    id: 'hotel_001',
    name: '北京希尔顿酒店',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%205-star%20hotel%20exterior%20modern%20architecture%20beijing&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%205-star%20hotel%20lobby%20interior%20elegant&image_size=landscape_16_9',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20king%20bed%20luxury%20modern%20design&image_size=landscape_16_9'
    ],
    address: '北京市朝阳区东三环北路东方路1号',
    latitude: 39.92,
    longitude: 116.47,
    rating: 4.8,
    reviewCount: 2356,
    price: 888,
    distance: '距您2.5公里',
    tags: ['五星级', '含早餐', '免费WiFi'],
    facilities: ['免费WiFi', '停车场', '健身房', '游泳池', '餐厅', '商务中心'],
    description: '北京希尔顿酒店位于CBD核心区域，毗邻国贸商圈，交通便利，设施完善，是商务出行的理想选择。'
  },
  {
    id: 'hotel_002',
    name: '全季酒店(北京三里屯店)',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20boutique%20hotel%20exterior%20clean%20minimalist%20design&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20lobby%20minimalist%20warm%20lighting&image_size=landscape_16_9',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=comfortable%20hotel%20room%20twin%20beds%20clean%20bright&image_size=landscape_16_9'
    ],
    address: '北京市朝阳区工人体育场北路甲6号',
    latitude: 39.93,
    longitude: 116.45,
    rating: 4.6,
    reviewCount: 1892,
    price: 458,
    distance: '距您1.8公里',
    tags: ['商务优选', '近地铁', '含早餐'],
    facilities: ['免费WiFi', '停车场', '餐厅', '商务中心'],
    description: '全季酒店是华住集团旗下的中高端酒店品牌，以简约舒适的设计风格，为商务旅客提供优质的入住体验。'
  },
  {
    id: 'hotel_003',
    name: '北京国贸大酒店',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=skyscraper%20luxury%20hotel%20beijing%20skyline%20modern&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20rooftop%20bar%20city%20view%20night&image_size=landscape_16_9',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ultra%20luxury%20hotel%20suite%20panoramic%20window&image_size=landscape_16_9'
    ],
    address: '北京市朝阳区建国门外大街1号',
    latitude: 39.90,
    longitude: 116.46,
    rating: 4.9,
    reviewCount: 3567,
    price: 1588,
    distance: '距您0.8公里',
    tags: ['奢华五星', 'CBD核心', '行政酒廊'],
    facilities: ['免费WiFi', '停车场', '健身房', '游泳池', '多家餐厅', '商务中心', '行政酒廊'],
    description: '北京国贸大酒店位于中国国际贸易中心，是北京地标性建筑之一，提供无与伦比的奢华体验和城市景观。'
  }
]

export const mockRoomTypes: RoomType[] = [
  {
    id: 'room_001',
    hotelId: 'hotel_001',
    name: '豪华大床房',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20king%20bed%20room%20elegant%20furniture&image_size=landscape_16_9',
    price: 888,
    originalPrice: 1088,
    size: '45㎡',
    bedType: '2.0米大床',
    maxOccupancy: 2,
    facilities: ['免费WiFi', '迷你吧', '保险箱', '浴袍拖鞋', '咖啡茶具'],
    breakfast: '含双早',
    cancelPolicy: '入住前1天18:00前可免费取消',
    availableCount: 5
  },
  {
    id: 'room_002',
    hotelId: 'hotel_001',
    name: '行政套房',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=executive%20suite%20hotel%20living%20room%20separate%20bedroom&image_size=landscape_16_9',
    price: 1688,
    originalPrice: 1988,
    size: '85㎡',
    bedType: '2.2米特大床',
    maxOccupancy: 2,
    facilities: ['免费WiFi', '迷你吧', '保险箱', '浴袍拖鞋', '咖啡茶具', '独立客厅', '行政酒廊权益'],
    breakfast: '含双早',
    cancelPolicy: '入住前1天18:00前可免费取消',
    availableCount: 2
  },
  {
    id: 'room_003',
    hotelId: 'hotel_002',
    name: '标准双床房',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20twin%20beds%20room%20clean%20bright&image_size=landscape_16_9',
    price: 458,
    originalPrice: 558,
    size: '28㎡',
    bedType: '1.2米双床',
    maxOccupancy: 2,
    facilities: ['免费WiFi', '电视', '独立卫浴', '热水壶'],
    breakfast: '不含早餐',
    cancelPolicy: '入住当天18:00前可免费取消',
    availableCount: 8
  }
]

export const mockHotelOrders: HotelOrder[] = [
  {
    id: 'hotel_001',
    orderNo: 'HT202401150001',
    status: 'confirmed',
    hotel: mockHotels[0],
    roomType: mockRoomTypes[0],
    checkInDate: '2024-01-20',
    checkOutDate: '2024-01-23',
    nights: 3,
    guestName: '张三',
    guestPhone: '13800138000',
    totalPrice: 2664,
    actualPrice: 2664,
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 'hotel_002',
    orderNo: 'HT202401100002',
    status: 'completed',
    hotel: mockHotels[1],
    roomType: mockRoomTypes[2],
    checkInDate: '2024-01-12',
    checkOutDate: '2024-01-14',
    nights: 2,
    guestName: '张三',
    guestPhone: '13800138000',
    totalPrice: 916,
    actualPrice: 916,
    createTime: '2024-01-10 15:20:00',
    checkInTime: '2024-01-12 14:30:00',
    checkOutTime: '2024-01-14 12:00:00'
  }
]

export const mockOrders: Order[] = [
  {
    id: 'taxi_001',
    orderNo: 'TX202401150001',
    type: 'taxi',
    status: 'completed',
    statusText: '已完成',
    title: '公司总部 → 北京首都国际机场',
    subtitle: '舒适型 · 28.5公里 · 45分钟',
    price: 125.5,
    createTime: '2024-01-15 08:30:00',
    taxiOrder: mockTaxiOrders[0]
  },
  {
    id: 'taxi_002',
    orderNo: 'TX202401140002',
    type: 'taxi',
    status: 'on_ride',
    statusText: '行程中',
    title: '北京南站 → 公司总部',
    subtitle: '经济型 · 12.3公里 · 预计25分钟',
    price: 45,
    createTime: '2024-01-14 14:20:00',
    taxiOrder: mockTaxiOrders[1]
  },
  {
    id: 'hotel_001',
    orderNo: 'HT202401150001',
    type: 'hotel',
    status: 'confirmed',
    statusText: '已确认',
    title: '北京希尔顿酒店',
    subtitle: '豪华大床房 · 2024-01-20 入住 3晚',
    price: 2664,
    createTime: '2024-01-15 10:30:00',
    hotelOrder: mockHotelOrders[0]
  },
  {
    id: 'hotel_002',
    orderNo: 'HT202401100002',
    type: 'hotel',
    status: 'completed',
    statusText: '已完成',
    title: '全季酒店(北京三里屯店)',
    subtitle: '标准双床房 · 2024-01-12 入住 2晚',
    price: 916,
    createTime: '2024-01-10 15:20:00',
    hotelOrder: mockHotelOrders[1]
  }
]

export const getTaxiOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    matching: '匹配中',
    matched: '已匹配',
    driver_arrived: '司机已到达',
    on_ride: '行程中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

export const getHotelOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    checked_in: '已入住',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}
