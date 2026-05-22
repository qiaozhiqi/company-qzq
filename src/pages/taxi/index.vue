<template>
  <view class="taxi-container">
    <view class="map-placeholder">
      <view class="map-content">
        <u-icon name="map" size="120" color="#1890FF"></u-icon>
        <text class="map-tip">地图区域 - 显示当前位置</text>
      </view>
    </view>
    
    <view class="address-card">
      <view class="address-item" @click="selectAddress('start')">
        <view class="address-icon start-icon">
          <view class="circle blue-circle"></view>
        </view>
        <view class="address-info">
          <view class="address-label">起点</view>
          <view class="address-name">
            {{ startLocation ? startLocation.name : '请选择出发地点' }}
          </view>
          <view class="address-detail" v-if="startLocation">
            {{ startLocation.address }}
          </view>
        </view>
        <u-icon name="arrow-right" size="32" color="#CCCCCC"></u-icon>
      </view>
      
      <view class="address-divider">
        <view class="divider-line"></view>
        <view class="swap-btn" @click="swapLocations">
          <u-icon name="arrow-up-down" size="32" color="#1890FF"></u-icon>
        </view>
      </view>
      
      <view class="address-item" @click="selectAddress('end')">
        <view class="address-icon end-icon">
          <view class="circle green-circle"></view>
        </view>
        <view class="address-info">
          <view class="address-label">终点</view>
          <view class="address-name">
            {{ endLocation ? endLocation.name : '请选择目的地' }}
          </view>
          <view class="address-detail" v-if="endLocation">
            {{ endLocation.address }}
          </view>
        </view>
        <u-icon name="arrow-right" size="32" color="#CCCCCC"></u-icon>
      </view>
    </view>
    
    <view class="car-type-section">
      <view class="section-title">选择车型</view>
      <scroll-view class="car-type-scroll" scroll-x>
        <view class="car-type-list">
          <view 
            class="car-type-item" 
            :class="{ active: selectedCarType === item.type }"
            v-for="item in carTypes" 
            :key="item.type"
            @click="selectCarType(item.type)"
          >
            <view class="car-icon">
              <u-icon :name="item.icon" size="48" :color="selectedCarType === item.type ? '#1890FF' : '#666666'"></u-icon>
            </view>
            <view class="car-name">{{ item.name }}</view>
            <view class="car-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ item.price }}</text>
              <text class="price-unit">起</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view class="quick-locations" v-if="!startLocation || !endLocation">
      <view class="section-title">常用地址</view>
      <view class="location-list">
        <view class="location-item" v-for="item in quickLocations" :key="item.id" @click="useQuickLocation(item)">
          <view class="location-icon">
            <u-icon :name="item.icon" size="40" color="#1890FF"></u-icon>
          </view>
          <view class="location-info">
            <view class="location-name">{{ item.name }}</view>
            <view class="location-address">{{ item.address }}</view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="bottom-actions">
      <view class="price-estimate" v-if="canEstimate">
        <view class="estimate-label">预估费用</view>
        <view class="estimate-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ estimatedPrice }}</text>
          <text class="price-range">~{{ estimatedPrice + 20 }}</text>
        </view>
        <view class="estimate-tip">企业对公支付 · 无需垫付</view>
      </view>
      
      <u-button 
        type="primary"
        :disabled="!canOrder"
        @click="goToConfirm"
        shape="circle"
        height="88rpx"
        customStyle="background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);"
      >
        {{ canOrder ? '立即叫车' : '请选择起终点' }}
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Location } from '@/types'
import { mockLocations } from '@/mock'

const startLocation = ref<Location | null>(null)
const endLocation = ref<Location | null>(null)
const selectedCarType = ref<string>('comfort')

const carTypes = ref([
  { type: 'economy', name: '经济型', icon: 'car', price: 15 },
  { type: 'comfort', name: '舒适型', icon: 'car-fill', price: 25 },
  { type: 'business', name: '商务型', icon: 'car-fill', price: 45 },
  { type: 'luxury', name: '豪华型', icon: 'car-fill', price: 80 }
])

const quickLocations = ref([
  { id: 'company', name: '公司总部', address: '北京市朝阳区建国路88号', icon: 'home' },
  { id: 'home', name: '家', address: '北京市海淀区中关村大街1号', icon: 'account' },
  { id: 'airport', name: '北京首都国际机场', address: '北京市顺义区机场西路', icon: 'map' }
])

const canOrder = computed(() => {
  return startLocation.value !== null && endLocation.value !== null
})

const canEstimate = computed(() => canOrder.value)

const estimatedPrice = computed(() => {
  if (!canEstimate.value) return 0
  const basePrice = carTypes.value.find(c => c.type === selectedCarType.value)?.price || 25
  return basePrice + Math.floor(Math.random() * 30)
})

const selectAddress = (type: 'start' | 'end') => {
  uni.navigateTo({
    url: `/pages/taxi/address-select?type=${type}`
  })
}

const swapLocations = () => {
  const temp = startLocation.value
  startLocation.value = endLocation.value
  endLocation.value = temp
}

const selectCarType = (type: string) => {
  selectedCarType.value = type
}

const useQuickLocation = (item: any) => {
  const location: Location = {
    name: item.name,
    address: item.address,
    latitude: 39.9,
    longitude: 116.4
  }
  
  if (!startLocation.value) {
    startLocation.value = location
  } else if (!endLocation.value) {
    endLocation.value = location
  } else {
    endLocation.value = location
  }
}

const goToConfirm = () => {
  if (!canOrder.value) return
  
  uni.navigateTo({
    url: '/pages/taxi/order-confirm'
  })
}

const onPullDownRefresh = () => {
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
}
</script>

<style lang="scss" scoped>
.taxi-container {
  min-height: 100vh;
  padding-bottom: 200rpx;
}

.map-placeholder {
  height: 400rpx;
  background: linear-gradient(180deg, #E6F7FF 0%, #FFFFFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-tip {
  font-size: 26rpx;
  color: #999999;
  margin-top: 24rpx;
}

.address-card {
  background: #FFFFFF;
  margin: -40rpx 32rpx 0;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.address-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.address-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
}

.blue-circle {
  background: #1890FF;
}

.green-circle {
  background: #52C41A;
}

.address-info {
  flex: 1;
  margin-left: 24rpx;
}

.address-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.address-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
}

.address-detail {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.address-divider {
  display: flex;
  align-items: center;
  position: relative;
  padding: 16rpx 0;
  margin-left: 32rpx;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: #F0F0F0;
}

.swap-btn {
  position: absolute;
  right: 0;
  width: 64rpx;
  height: 64rpx;
  background: #E6F7FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.car-type-section {
  margin-top: 32rpx;
  padding: 0 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 24rpx;
}

.car-type-scroll {
  white-space: nowrap;
}

.car-type-list {
  display: inline-flex;
}

.car-type-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-right: 24rpx;
  border: 2rpx solid transparent;
  
  &.active {
    border-color: #1890FF;
    background: #E6F7FF;
  }
}

.car-icon {
  margin-bottom: 16rpx;
}

.car-name {
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.car-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 22rpx;
  color: #1890FF;
}

.price-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #1890FF;
}

.price-unit {
  font-size: 22rpx;
  color: #999999;
}

.quick-locations {
  margin-top: 32rpx;
  padding: 0 32rpx;
}

.location-list {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 2rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
}

.location-icon {
  width: 72rpx;
  height: 72rpx;
  background: #E6F7FF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.location-info {
  flex: 1;
}

.location-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.location-address {
  font-size: 24rpx;
  color: #999999;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.price-estimate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.estimate-label {
  font-size: 26rpx;
  color: #666666;
}

.estimate-price {
  display: flex;
  align-items: baseline;
}

.price-range {
  font-size: 24rpx;
  color: #999999;
  margin-left: 8rpx;
}

.estimate-tip {
  font-size: 22rpx;
  color: #52C41A;
  background: #F6FFED;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}
</style>
