<template>
  <view class="train-container">
    <view class="search-header">
      <view class="city-selector">
        <view class="city-item" @click="showDeparturePicker = true">
          <text class="city-label">出发</text>
          <text class="city-value">{{ departureCity }}</text>
        </view>
        <view class="swap-btn" @click="swapCities">
          <u-icon name="arrow-right-left" size="40" color="#52C41A"></u-icon>
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
            :class="{ active: activeTrainType === item.value }"
            v-for="item in trainTypeFilters" 
            :key="item.value"
            @click="selectTrainType(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view class="train-list">
      <view 
        class="train-card" 
        v-for="train in trainList" 
        :key="train.id"
        @click="goToDetail(train.id)"
      >
        <view class="train-info">
          <view class="train-header">
            <view class="train-type-badge" :class="getTrainTypeClass(train.trainType)">
              {{ train.trainType }}
            </view>
            <text class="train-no">{{ train.trainNo }}</text>
          </view>
          
          <view class="train-route">
            <view class="route-item">
              <text class="time">{{ train.departureTime }}</text>
              <text class="station">{{ train.departureStation }}</text>
            </view>
            
            <view class="route-middle">
              <text class="duration">{{ train.duration }}</text>
              <view class="route-line"></view>
              <text class="through-tag" v-if="train.isThrough">直达</text>
              <text class="pass-tag" v-else>途经</text>
            </view>
            
            <view class="route-item">
              <text class="time">{{ train.arrivalTime }}</text>
              <text class="station">{{ train.arrivalStation }}</text>
            </view>
          </view>
          
          <view class="train-details" v-if="train.passStations && train.passStations.length > 0">
            <text class="detail-item">途经站点：{{ train.passStations.join('、') }}</text>
          </view>
        </view>
        
        <view class="train-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ train.price }}</text>
          <text class="price-unit">起</text>
          <view class="seat-info">
            <text class="seat-type">{{ train.seatType }}</text>
            <text class="seat-available">剩余{{ train.availableSeats }}张</text>
          </view>
        </view>
      </view>
      
      <view class="load-more" v-if="hasMore">
        <u-loading-icon size="32" color="#999999"></u-loading-icon>
        <text class="load-text">加载中...</text>
      </view>
      
      <view class="no-more" v-else-if="trainList.length > 0">
        <text class="no-more-text">没有更多了</text>
      </view>
      
      <view class="empty-state" v-else-if="!loading">
        <u-icon name="search" size="120" color="#DDDDDD"></u-icon>
        <text class="empty-text">暂无符合条件的车次</text>
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
import type { Train } from '@/types'
import { trainApi } from '@/api'

const departureCity = ref('北京')
const arrivalCity = ref('上海')
const departureDate = ref('')
const showDeparturePicker = ref(false)
const showArrivalPicker = ref(false)
const showDatePicker = ref(false)
const activeTrainType = ref('all')
const trainList = ref<Train[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

const cityColumns = ref([
  ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆', '厦门', '青岛', '大连', '沈阳', '哈尔滨']
])

const trainTypeFilters = ref([
  { label: '全部', value: 'all' },
  { label: '高铁', value: '高铁' },
  { label: '动车', value: '动车' },
  { label: '特快', value: '特快' },
  { label: '快速', value: '快速' }
])

const departureWeek = computed(() => {
  if (!departureDate.value) return ''
  const date = new Date(departureDate.value)
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weeks[date.getDay()]
})

const getTrainTypeClass = (trainType: string) => {
  switch (trainType) {
    case '高铁':
      return 'high-speed'
    case '动车':
      return 'bullet'
    case '特快':
      return 'express'
    case '快速':
      return 'fast'
    default:
      return ''
  }
}

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

const loadTrains = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  
  try {
    const params: any = {
      departureCity: departureCity.value,
      arrivalCity: arrivalCity.value,
      page: page.value,
      pageSize: 10
    }
    
    if (activeTrainType.value !== 'all') {
      params.trainType = activeTrainType.value
    }
    
    const res = await trainApi.searchTrains(params)
    
    if (page.value === 1) {
      trainList.value = res.list
    } else {
      trainList.value = [...trainList.value, ...res.list]
    }
    
    page.value++
    if (page.value > res.totalPages) {
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载车次失败:', error)
  } finally {
    loading.value = false
  }
}

const selectTrainType = (value: string) => {
  activeTrainType.value = value
  page.value = 1
  hasMore.value = true
  trainList.value = []
  loadTrains()
}

const swapCities = () => {
  const temp = departureCity.value
  departureCity.value = arrivalCity.value
  arrivalCity.value = temp
  page.value = 1
  hasMore.value = true
  trainList.value = []
  loadTrains()
}

const onDepartureConfirm = (e: any) => {
  departureCity.value = e.value[0]
  showDeparturePicker.value = false
  page.value = 1
  hasMore.value = true
  trainList.value = []
  loadTrains()
}

const onArrivalConfirm = (e: any) => {
  arrivalCity.value = e.value[0]
  showArrivalPicker.value = false
  page.value = 1
  hasMore.value = true
  trainList.value = []
  loadTrains()
}

const onDateConfirm = (e: any) => {
  departureDate.value = e
  showDatePicker.value = false
}

const goToDetail = (trainId: string) => {
  uni.navigateTo({
    url: `/pages/train/train-detail?id=${trainId}`
  })
}

const onPullDownRefresh = () => {
  page.value = 1
  hasMore.value = true
  trainList.value = []
  loadTrains().then(() => {
    uni.stopPullDownRefresh()
  })
}

const onReachBottom = () => {
  loadTrains()
}

onMounted(() => {
  initDate()
  loadTrains()
})
</script>

<style lang="scss" scoped>
.train-container {
  min-height: 100vh;
  background: #F5F5F5;
}

.search-header {
  background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
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
  background: #F6FFED;
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
  color: #52C41A;
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
    background: #F6FFED;
    color: #52C41A;
  }
}

.train-list {
  padding: 24rpx 32rpx;
}

.train-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.train-info {
  flex: 1;
}

.train-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.train-type-badge {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  
  &.high-speed {
    background: #FFECE8;
    color: #FA8C16;
  }
  
  &.bullet {
    background: #E6F7FF;
    color: #1890FF;
  }
  
  &.express {
    background: #FFF7E6;
    color: #FAAD14;
  }
  
  &.fast {
    background: #F6FFED;
    color: #52C41A;
  }
}

.train-no {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.train-route {
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

.station {
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

.through-tag {
  font-size: 20rpx;
  color: #52C41A;
  background: #F6FFED;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.pass-tag {
  font-size: 20rpx;
  color: #FA8C16;
  background: #FFF7E6;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.train-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.detail-item {
  font-size: 22rpx;
  color: #999999;
}

.train-price {
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

.seat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 8rpx;
}

.seat-type {
  font-size: 22rpx;
  color: #666666;
}

.seat-available {
  font-size: 20rpx;
  color: #52C41A;
  margin-top: 4rpx;
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
