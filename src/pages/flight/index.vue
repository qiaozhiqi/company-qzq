<template>
  <view class="flight-container">
    <view class="search-header">
      <view class="city-selector">
        <view class="city-item" @click="showDeparturePicker = true">
          <text class="city-label">出发</text>
          <text class="city-value">{{ departureCity }}</text>
        </view>
        <view class="swap-btn" @click="swapCities">
          <u-icon name="arrow-right-left" size="40" color="#1890FF"></u-icon>
        </view>
        <view class="city-item" @click="showArrivalPicker = true">
          <text class="city-label">到达</text>
          <text class="city-value">{{ arrivalCity }}</text>
        </view>
      </view>
      
      <view class="date-filter" @click="showDatePicker = true">
        <view class="date-item">
          <text class="date-label">出发日期</text>
          <text class="date-value">{{ departureDate }}</text>
          <text class="date-week">{{ departureWeek }}</text>
        </view>
      </view>
    </view>
    
    <view class="quick-filter">
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-list">
          <view 
            class="filter-item" 
            :class="{ active: activePriceRange === item.value }"
            v-for="item in priceRanges" 
            :key="item.value"
            @click="selectPriceRange(item.value)"
          >
            {{ item.label }}
          </view>
          <view 
            class="filter-item" 
            :class="{ active: activeDirect === item.value }"
            v-for="item in directFilters" 
            :key="item.value"
            @click="selectDirect(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view class="flight-list">
      <view 
        class="flight-card" 
        v-for="flight in flightList" 
        :key="flight.id"
        @click="goToDetail(flight.id)"
      >
        <view class="flight-info">
          <view class="airline-info">
            <text class="airline-name">{{ flight.airline }}</text>
            <text class="flight-no">{{ flight.flightNo }}</text>
          </view>
          
          <view class="flight-route">
            <view class="route-item">
              <text class="time">{{ flight.departureTime }}</text>
              <text class="airport">{{ flight.departureAirport }}</text>
            </view>
            
            <view class="route-middle">
              <text class="duration">{{ flight.duration }}</text>
              <view class="route-line"></view>
              <text class="direct-tag" v-if="flight.isDirect">直飞</text>
              <text class="transfer-tag" v-else>经停</text>
            </view>
            
            <view class="route-item">
              <text class="time">{{ flight.arrivalTime }}</text>
              <text class="airport">{{ flight.arrivalAirport }}</text>
            </view>
          </view>
          
          <view class="flight-details">
            <text class="detail-item">{{ flight.aircraftType }}</text>
            <text class="detail-item">{{ flight.meal }}</text>
            <text class="detail-item">{{ flight.baggagePolicy }}</text>
          </view>
        </view>
        
        <view class="flight-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ flight.price }}</text>
          <text class="price-unit">起</text>
          <view class="original-price" v-if="flight.originalPrice > flight.price">
            <text class="original-text">¥{{ flight.originalPrice }}</text>
          </view>
        </view>
      </view>
      
      <view class="load-more" v-if="hasMore">
        <u-loading-icon size="32" color="#999999"></u-loading-icon>
        <text class="load-text">加载中...</text>
      </view>
      
      <view class="no-more" v-else-if="flightList.length > 0">
        <text class="no-more-text">没有更多了</text>
      </view>
      
      <view class="empty-state" v-else-if="!loading">
        <u-icon name="search" size="120" color="#DDDDDD"></u-icon>
        <text class="empty-text">暂无符合条件的航班</text>
      </view>
    </view>
    
    <u-picker 
      :show="showDeparturePicker" 
      :columns="cityColumns" 
      @confirm="onDepartureConfirm" 
      @cancel="showDeparturePicker = false"
    ></u-picker>
    
    <u-picker 
      :show="showArrivalPicker" 
      :columns="cityColumns" 
      @confirm="onArrivalConfirm" 
      @cancel="showArrivalPicker = false"
    ></u-picker>
    
    <u-calendar 
      :show="showDatePicker" 
      :start-date="departureDate" 
      mode="single"
      @confirm="onDateConfirm"
      @close="showDatePicker = false"
    ></u-calendar>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Flight } from '@/types'
import { flightApi } from '@/api'

const departureCity = ref('北京')
const arrivalCity = ref('上海')
const departureDate = ref('')
const showDeparturePicker = ref(false)
const showArrivalPicker = ref(false)
const showDatePicker = ref(false)
const activePriceRange = ref('all')
const activeDirect = ref('all')
const flightList = ref<Flight[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

const cityColumns = ref([
  ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆', '厦门', '青岛', '大连', '沈阳', '哈尔滨']
])

const priceRanges = ref([
  { label: '价格不限', value: 'all' },
  { label: '¥300以下', value: 'low' },
  { label: '¥300-800', value: 'mid' },
  { label: '¥800-1500', value: 'high' },
  { label: '¥1500以上', value: 'luxury' }
])

const directFilters = ref([
  { label: '全部', value: 'all' },
  { label: '仅直飞', value: 'direct' }
])

const departureWeek = computed(() => {
  if (!departureDate.value) return ''
  const date = new Date(departureDate.value)
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weeks[date.getDay()]
})

const initDate = () => {
  const today = new Date()
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  departureDate.value = formatDate(today)
}

const loadFlights = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  
  try {
    const params: any = {
      departureCity: departureCity.value,
      arrivalCity: arrivalCity.value,
      page: page.value,
      pageSize: 10
    }
    
    if (activePriceRange.value !== 'all') {
      params.priceRange = activePriceRange.value
    }
    
    if (activeDirect.value === 'direct') {
      params.isDirect = true
    }
    
    const res = await flightApi.searchFlights(params)
    
    if (page.value === 1) {
      flightList.value = res.list
    } else {
      flightList.value = [...flightList.value, ...res.list]
    }
    
    page.value++
    if (page.value > res.totalPages) {
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载航班失败:', error)
  } finally {
    loading.value = false
  }
}

const selectPriceRange = (value: string) => {
  activePriceRange.value = value
  page.value = 1
  hasMore.value = true
  flightList.value = []
  loadFlights()
}

const selectDirect = (value: string) => {
  activeDirect.value = value
  page.value = 1
  hasMore.value = true
  flightList.value = []
  loadFlights()
}

const swapCities = () => {
  const temp = departureCity.value
  departureCity.value = arrivalCity.value
  arrivalCity.value = temp
  page.value = 1
  hasMore.value = true
  flightList.value = []
  loadFlights()
}

const onDepartureConfirm = (e: any) => {
  departureCity.value = e.value[0]
  showDeparturePicker.value = false
  page.value = 1
  hasMore.value = true
  flightList.value = []
  loadFlights()
}

const onArrivalConfirm = (e: any) => {
  arrivalCity.value = e.value[0]
  showArrivalPicker.value = false
  page.value = 1
  hasMore.value = true
  flightList.value = []
  loadFlights()
}

const onDateConfirm = (e: any) => {
  departureDate.value = e
  showDatePicker.value = false
}

const goToDetail = (flightId: string) => {
  uni.navigateTo({
    url: `/pages/flight/flight-detail?id=${flightId}`
  })
}

const onPullDownRefresh = () => {
  page.value = 1
  hasMore.value = true
  flightList.value = []
  loadFlights().then(() => {
    uni.stopPullDownRefresh()
  })
}

const onReachBottom = () => {
  loadFlights()
}

onMounted(() => {
  initDate()
  loadFlights()
})
</script>

<style lang="scss" scoped>
.flight-container {
  min-height: 100vh;
  background: #F5F5F5;
}

.search-header {
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  padding: 32rpx;
}

.city-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.city-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.city-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.city-value {
  font-size: 36rpx;
  font-weight: 500;
  color: #333333;
}

.swap-btn {
  width: 64rpx;
  height: 64rpx;
  background: #E6F7FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-filter {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
}

.date-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.date-label {
  font-size: 24rpx;
  color: #999999;
}

.date-value {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.date-week {
  font-size: 24rpx;
  color: #1890FF;
}

.quick-filter {
  background: #FFFFFF;
  margin-top: 20rpx;
  padding: 20rpx 0;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-list {
  display: inline-flex;
  padding: 0 32rpx;
  gap: 20rpx;
}

.filter-item {
  display: inline-flex;
  padding: 16rpx 28rpx;
  background: #F5F5F5;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #666666;
  
  &.active {
    background: #E6F7FF;
    color: #1890FF;
  }
}

.flight-list {
  padding: 24rpx 32rpx;
}

.flight-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.flight-info {
  flex: 1;
}

.airline-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.airline-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.flight-no {
  font-size: 24rpx;
  color: #999999;
}

.flight-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.route-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time {
  font-size: 36rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
}

.airport {
  font-size: 22rpx;
  color: #999999;
}

.route-middle {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 16rpx;
  position: relative;
}

.duration {
  font-size: 22rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.route-line {
  height: 2rpx;
  width: 80%;
  background: #E0E0E0;
  margin-bottom: 8rpx;
}

.direct-tag {
  font-size: 20rpx;
  color: #1890FF;
  background: #E6F7FF;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.transfer-tag {
  font-size: 20rpx;
  color: #FA8C16;
  background: #FFF7E6;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.flight-details {
  display: flex;
  gap: 24rpx;
}

.detail-item {
  font-size: 22rpx;
  color: #999999;
}

.flight-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  margin-left: 16rpx;
}

.price-symbol {
  font-size: 24rpx;
  color: #FF4D4F;
}

.price-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #FF4D4F;
}

.price-unit {
  font-size: 22rpx;
  color: #999999;
}

.original-price {
  margin-top: 8rpx;
}

.original-text {
  font-size: 22rpx;
  color: #999999;
  text-decoration: line-through;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 32rpx;
}

.load-text {
  font-size: 26rpx;
  color: #999999;
}

.no-more {
  display: flex;
  justify-content: center;
  padding: 32rpx;
}

.no-more-text {
  font-size: 24rpx;
  color: #CCCCCC;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-top: 24rpx;
}
</style>
