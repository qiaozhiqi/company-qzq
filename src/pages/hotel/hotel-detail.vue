<template>
  <view class="hotel-detail-container">
    <swiper class="image-swiper" :indicator-dots="true" indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#FFFFFF" circular>
      <swiper-item v-for="(img, index) in hotelImages" :key="index">
        <image class="slide-image" :src="img" mode="aspectFill" />
      </swiper-item>
    </swiper>
    
    <view class="hotel-info-section">
      <view class="hotel-name">{{ hotel?.name }}</view>
      <view class="hotel-tags">
        <text class="tag" v-for="(tag, index) in hotel?.tags" :key="index">{{ tag }}</text>
      </view>
      <view class="hotel-rating">
        <u-rate :value="(hotel?.rating || 0) / 2" :count="5" :size="28" activeColor="#FAAD14" :readonly="true"></u-rate>
        <text class="rating-score">{{ hotel?.rating }}</text>
        <text class="review-count">{{ hotel?.reviewCount }}条评价</text>
      </view>
      <view class="hotel-location">
        <u-icon name="map" size="28" color="#999999"></u-icon>
        <text class="location-text">{{ hotel?.address }}</text>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="room-types-section" v-if="roomTypes.length > 0">
      <view class="section-header">
        <text class="section-title">可选房型</text>
      </view>
      
      <view class="room-type-list">
        <view 
          class="room-type-card" 
          v-for="room in roomTypes" 
          :key="room.id"
          @click="goToRoomDetail(room.id)"
        >
          <image class="room-image" :src="room.image" mode="aspectFill" />
          <view class="room-info">
            <view class="room-name">{{ room.name }}</view>
            <view class="room-specs">
              <text class="spec-item">{{ room.size }}</text>
              <text class="spec-item">{{ room.bedType }}</text>
              <text class="spec-item">最多{{ room.maxOccupancy }}人</text>
            </view>
            <view class="room-facilities">
              <text class="facility-item" v-for="(f, idx) in room.facilities.slice(0, 3)" :key="idx">{{ f }}</text>
            </view>
            <view class="room-footer">
              <view class="room-extra">
                <text class="extra-item" v-if="room.breakfast">{{ room.breakfast }}</text>
                <text class="extra-item available" v-if="room.availableCount > 0">剩余{{ room.availableCount }}间</text>
                <text class="extra-item sold-out" v-else>暂无房</text>
              </view>
              <view class="room-price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ room.price }}</text>
                <text class="price-unit">起/晚</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="facilities-section" v-if="hotel?.facilities && hotel.facilities.length > 0">
      <view class="section-header">
        <text class="section-title">酒店设施</text>
      </view>
      <view class="facilities-list">
        <view class="facility-item" v-for="(f, index) in hotel?.facilities" :key="index">
          <u-icon name="checkmark" size="32" color="#52C41A"></u-icon>
          <text class="facility-text">{{ f }}</text>
        </view>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="description-section" v-if="hotel?.description">
      <view class="section-header">
        <text class="section-title">酒店介绍</text>
      </view>
      <text class="description-text">{{ hotel?.description }}</text>
    </view>
    
    <view class="bottom-placeholder"></view>
    
    <view class="bottom-bar">
      <view class="bottom-price">
        <text class="price-label">每晚</text>
        <view class="price-value">
          <text class="symbol">¥</text>
          <text class="amount">{{ minPrice }}</text>
          <text class="unit">起</text>
        </view>
      </view>
      <u-button 
        type="primary"
        @click="goToBook"
        shape="circle"
        height="88rpx"
        customStyle="background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%); width: 320rpx;"
      >
        立即预订
      </u-button>
    </view>
    
    <view class="loading-mask" v-if="loading">
      <u-loading-icon size="48" color="#1890FF"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Hotel, RoomType } from '@/types'
import { hotelApi } from '@/api'

const hotelId = ref<string>('')
const hotel = ref<(Hotel & { roomTypes: RoomType[] }) | null>(null)
const roomTypes = ref<RoomType[]>([])
const loading = ref<boolean>(true)

const hotelImages = computed(() => {
  if (hotel.value?.image) {
    return [hotel.value.image, ...(hotel.value.images || [])]
  }
  return hotel.value?.images || []
})

const minPrice = computed(() => {
  if (roomTypes.value.length === 0) return 0
  return Math.min(...roomTypes.value.map(r => r.price))
})

const loadHotelDetail = async () => {
  loading.value = true
  
  try {
    const res = await hotelApi.getHotelDetail(hotelId.value)
    
    if (res.data) {
      hotel.value = res.data
      roomTypes.value = res.data.roomTypes || []
    }
  } catch (error) {
    console.error('加载酒店详情失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const goToRoomDetail = (roomTypeId: string) => {
  uni.navigateTo({
    url: `/pages/hotel/room-detail?id=${roomTypeId}&hotelId=${hotelId.value}`
  })
}

const goToBook = () => {
  if (roomTypes.value.length === 0) {
    uni.showToast({
      title: '该酒店暂无可用房型',
      icon: 'none'
    })
    return
  }
  uni.navigateTo({
    url: `/pages/hotel/order-confirm?hotelId=${hotelId.value}`
  })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}
  
  hotelId.value = options.id || ''
  
  if (!hotelId.value) {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }
  
  loadHotelDetail()
})
</script>

<style lang="scss" scoped>
.hotel-detail-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 180rpx;
  position: relative;
}

.image-swiper {
  width: 100%;
  height: 500rpx;
}

.slide-image {
  width: 100%;
  height: 100%;
}

.hotel-info-section {
  background: #FFFFFF;
  padding: 32rpx;
}

.hotel-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.hotel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tag {
  font-size: 22rpx;
  color: #1890FF;
  background: #E6F7FF;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
}

.hotel-rating {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.rating-score {
  font-size: 30rpx;
  font-weight: 500;
  color: #FAAD14;
}

.review-count {
  font-size: 24rpx;
  color: #999999;
}

.hotel-location {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.location-text {
  font-size: 26rpx;
  color: #666666;
  flex: 1;
}

.section-divider {
  height: 20rpx;
  background: #F5F5F5;
}

.room-types-section,
.facilities-section,
.description-section {
  background: #FFFFFF;
  padding: 32rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.room-type-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.room-type-card {
  display: flex;
  background: #FAFAFA;
  border-radius: 16rpx;
  padding: 20rpx;
}

.room-image {
  width: 200rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.room-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.room-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12rpx;
}

.room-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.spec-item {
  font-size: 22rpx;
  color: #666666;
}

.room-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.facility-item {
  font-size: 20rpx;
  color: #999999;
  background: #F0F0F0;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.room-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
}

.extra-item {
  font-size: 22rpx;
  color: #666666;
  
  &.available {
    color: #52C41A;
  }
  
  &.sold-out {
    color: #FF4D4F;
  }
}

.room-price {
  display: flex;
  align-items: baseline;
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

.facilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 30%;
}

.facility-text {
  font-size: 26rpx;
  color: #333333;
}

.description-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.8;
}

.bottom-placeholder {
  height: 120rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.bottom-price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.price-value {
  display: flex;
  align-items: baseline;
}

.symbol {
  font-size: 28rpx;
  color: #FF4D4F;
}

.amount {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF4D4F;
}

.unit {
  font-size: 24rpx;
  color: #999999;
  margin-left: 8rpx;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
  margin-top: 24rpx;
}
</style>
