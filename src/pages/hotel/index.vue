<template>
  <view class="hotel-container">
    <view class="search-header">
      <view class="search-box" @click="showCityPicker = true">
        <u-icon name="map" size="32" color="#1890FF"></u-icon>
        <text class="city-text">{{ currentCity }}</text>
        <u-icon name="arrow-down" size="24" color="#999999"></u-icon>
      </view>
      <view class="search-input-box" @click="goToSearch">
        <u-icon name="search" size="32" color="#999999"></u-icon>
        <text class="search-placeholder">搜索酒店名称/位置</text>
      </view>
    </view>
    
    <view class="filter-section">
      <view class="date-filter" @click="showDatePicker = true">
        <view class="date-item">
          <text class="date-label">入住</text>
          <text class="date-value">{{ checkInDate }}</text>
          <text class="date-week">{{ checkInWeek }}</text>
        </view>
        <view class="date-arrow">
          <u-icon name="arrow-right" size="32" color="#1890FF"></u-icon>
        </view>
        <view class="date-item">
          <text class="date-label">离店</text>
          <text class="date-value">{{ checkOutDate }}</text>
          <text class="date-week">{{ checkOutWeek }}</text>
        </view>
        <view class="nights-badge">共 {{ nights }} 晚</view>
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
            :class="{ active: activeStar === item.value }"
            v-for="item in starFilters" 
            :key="item.value"
            @click="selectStar(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view class="hotel-list">
      <view 
        class="hotel-card" 
        v-for="hotel in hotelList" 
        :key="hotel.id"
        @click="goToDetail(hotel.id)"
      >
        <image class="hotel-image" :src="hotel.image" mode="aspectFill" />
        <view class="hotel-info">
          <view class="hotel-name">{{ hotel.name }}</view>
          <view class="hotel-tags">
            <text class="tag" v-for="(tag, index) in hotel.tags.slice(0, 3)" :key="index">{{ tag }}</text>
          </view>
          <view class="hotel-rating">
            <u-rate :value="hotel.rating / 2" :count="5" :size="24" activeColor="#FAAD14" :readonly="true"></u-rate>
            <text class="rating-score">{{ hotel.rating }}</text>
            <text class="review-count">{{ hotel.reviewCount }}条评价</text>
          </view>
          <view class="hotel-location">
            <u-icon name="map" size="20" color="#999999"></u-icon>
            <text class="location-text">{{ hotel.distance }}</text>
          </view>
        </view>
        <view class="hotel-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ hotel.price }}</text>
          <text class="price-unit">起/晚</text>
        </view>
      </view>
      
      <view class="load-more" v-if="hasMore">
        <u-loading-icon size="32" color="#999999"></u-loading-icon>
        <text class="load-text">加载中...</text>
      </view>
      
      <view class="no-more" v-else-if="hotelList.length > 0">
        <text class="no-more-text">没有更多了</text>
      </view>
      
      <view class="empty-state" v-else-if="!loading">
        <u-icon name="search" size="120" color="#DDDDDD"></u-icon>
        <text class="empty-text">暂无符合条件的酒店</text>
      </view>
    </view>
    
    <u-picker 
      :show="showCityPicker" 
      :columns="cityColumns" 
      @confirm="onCityConfirm" 
      @cancel="showCityPicker = false"
    ></u-picker>
    
    <u-calendar 
      :show="showDatePicker" 
      :start-date="checkInDate" 
      :end-date="checkOutDate"
      mode="range"
      @confirm="onDateConfirm"
      @close="showDatePicker = false"
    ></u-calendar>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Hotel } from '@/types'
import { mockHotels } from '@/mock'

const currentCity = ref('北京')
const checkInDate = ref('')
const checkOutDate = ref('')
const showCityPicker = ref(false)
const showDatePicker = ref(false)
const activePriceRange = ref('all')
const activeStar = ref('all')
const hotelList = ref<Hotel[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

const cityColumns = ref([
  ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆']
])

const priceRanges = ref([
  { label: '价格不限', value: 'all' },
  { label: '¥300以下', value: 'low' },
  { label: '¥300-600', value: 'mid' },
  { label: '¥600-1000', value: 'high' },
  { label: '¥1000以上', value: 'luxury' }
])

const starFilters = ref([
  { label: '酒店等级', value: 'all' },
  { label: '经济型', value: 'economy' },
  { label: '三星/舒适', value: 'three' },
  { label: '四星/高档', value: 'four' },
  { label: '五星/豪华', value: 'five' }
])

const nights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1
  const start = new Date(checkInDate.value)
  const end = new Date(checkOutDate.value)
  const diff = end.getTime() - start.getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const checkInWeek = computed(() => {
  if (!checkInDate.value) return ''
  const date = new Date(checkInDate.value)
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weeks[date.getDay()]
})

const checkOutWeek = computed(() => {
  if (!checkOutDate.value) return ''
  const date = new Date(checkOutDate.value)
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weeks[date.getDay()]
})

const initDates = () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  checkInDate.value = formatDate(today)
  checkOutDate.value = formatDate(tomorrow)
}

const loadHotels = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  
  setTimeout(() => {
    if (page.value === 1) {
      hotelList.value = [...mockHotels]
    } else {
      hotelList.value = [...hotelList.value, ...mockHotels]
    }
    
    page.value++
    if (page.value > 3) {
      hasMore.value = false
    }
    
    loading.value = false
  }, 800)
}

const selectPriceRange = (value: string) => {
  activePriceRange.value = value
  page.value = 1
  hasMore.value = true
  hotelList.value = []
  loadHotels()
}

const selectStar = (value: string) => {
  activeStar.value = value
  page.value = 1
  hasMore.value = true
  hotelList.value = []
  loadHotels()
}

const onCityConfirm = (e: any) => {
  currentCity.value = e.value[0]
  showCityPicker.value = false
  page.value = 1
  hasMore.value = true
  hotelList.value = []
  loadHotels()
}

const onDateConfirm = (e: any) => {
  checkInDate.value = e[0]
  checkOutDate.value = e[1]
  showDatePicker.value = false
}

const goToSearch = () => {
  uni.showToast({
    title: '搜索功能开发中',
    icon: 'none'
  })
}

const goToDetail = (hotelId: string) => {
  uni.navigateTo({
    url: `/pages/hotel/hotel-detail?id=${hotelId}`
  })
}

const onPullDownRefresh = () => {
  page.value = 1
  hasMore.value = true
  hotelList.value = []
  loadHotels().then(() => {
    uni.stopPullDownRefresh()
  })
}

const onReachBottom = () => {
  loadHotels()
}

onMounted(() => {
  initDates()
  loadHotels()
})
</script>

<style lang="scss" scoped>
.hotel-container {
  min-height: 100vh;
  background: #F5F5F5;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  gap: 24rpx;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #F5F5F5;
  border-radius: 40rpx;
  gap: 12rpx;
}

.city-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.search-input-box {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #F5F5F5;
  border-radius: 40rpx;
  gap: 12rpx;
}

.search-placeholder {
  font-size: 26rpx;
  color: #999999;
}

.filter-section {
  background: #FFFFFF;
  margin-top: 20rpx;
  padding: 24rpx 32rpx;
}

.date-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 24rpx;
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.date-value {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.date-week {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

.date-arrow {
  padding: 0 24rpx;
}

.nights-badge {
  background: #1890FF;
  color: #FFFFFF;
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
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

.hotel-list {
  padding: 24rpx 32rpx;
}

.hotel-card {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.hotel-image {
  width: 200rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.hotel-info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
}

.hotel-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 12rpx;
  flex-wrap: wrap;
}

.tag {
  font-size: 20rpx;
  color: #1890FF;
  background: #E6F7FF;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.hotel-rating {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.rating-score {
  font-size: 26rpx;
  font-weight: 500;
  color: #FAAD14;
}

.review-count {
  font-size: 22rpx;
  color: #999999;
}

.hotel-location {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.location-text {
  font-size: 22rpx;
  color: #999999;
}

.hotel-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
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
