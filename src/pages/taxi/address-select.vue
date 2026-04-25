<template>
  <view class="address-select-container">
    <view class="search-section">
      <view class="search-box">
        <u-icon name="search" size="32" color="#999999"></u-icon>
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索地址"
          @confirm="searchAddress"
        />
        <view class="search-btn" @click="searchAddress">搜索</view>
      </view>
    </view>
    
    <view class="current-location" v-if="!searchKeyword">
      <view class="location-item" @click="selectCurrentLocation">
        <view class="location-icon current-icon">
          <u-icon name="map" size="36" color="#1890FF"></u-icon>
        </view>
        <view class="location-info">
          <view class="location-name">当前位置</view>
          <view class="location-address">北京市朝阳区建国路附近</view>
        </view>
        <u-icon name="arrow-right" size="28" color="#CCCCCC"></u-icon>
      </view>
    </view>
    
    <view class="address-section" v-if="!searchKeyword">
      <view class="section-title">常用地址</view>
      <view class="address-list">
        <view 
          class="address-item" 
          v-for="item in commonAddresses" 
          :key="item.id"
          @click="selectAddress(item)"
        >
          <view class="address-icon">
            <u-icon :name="item.icon" size="36" :color="item.color"></u-icon>
          </view>
          <view class="address-info">
            <view class="address-name">{{ item.name }}</view>
            <view class="address-detail">{{ item.address }}</view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="search-result-section" v-if="searchKeyword">
      <view class="section-title">搜索结果</view>
      <view class="address-list">
        <view 
          class="address-item" 
          v-for="(item, index) in searchResults" 
          :key="index"
          @click="selectAddress(item)"
        >
          <view class="address-icon">
            <u-icon name="map" size="36" color="#999999"></u-icon>
          </view>
          <view class="address-info">
            <view class="address-name">{{ item.name }}</view>
            <view class="address-detail">{{ item.address }}</view>
          </view>
        </view>
        <view class="no-result" v-if="searchResults.length === 0 && !searching">
          <u-icon name="search" size="80" color="#DDDDDD"></u-icon>
          <text class="no-result-text">未找到相关地址</text>
        </view>
      </view>
    </view>
    
    <view class="loading-mask" v-if="searching">
      <u-loading-icon size="48" color="#1890FF"></u-loading-icon>
      <text class="loading-text">搜索中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Location } from '@/types'
import { mockLocations } from '@/mock'

const searchKeyword = ref('')
const searching = ref(false)
const searchResults = ref<Location[]>([])
const selectType = ref<'start' | 'end'>('start')

const commonAddresses = ref([
  { id: 'company', name: '公司总部', address: '北京市朝阳区建国路88号SOHO现代城', icon: 'home', color: '#1890FF' },
  { id: 'home', name: '家', address: '北京市海淀区中关村大街1号', icon: 'account', color: '#52C41A' },
  { id: 'airport', name: '北京首都国际机场', address: '北京市顺义区机场西路', icon: 'map', color: '#FAAD14' },
  { id: 'station', name: '北京南站', address: '北京市丰台区永定门外大街', icon: 'map', color: '#722ED1' }
])

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as any
  if (options.type) {
    selectType.value = options.type
  }
})

const searchAddress = () => {
  if (!searchKeyword.value.trim()) return
  
  searching.value = true
  
  setTimeout(() => {
    const keyword = searchKeyword.value.toLowerCase()
    searchResults.value = mockLocations.filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.address.toLowerCase().includes(keyword)
    )
    
    if (searchResults.value.length === 0) {
      searchResults.value = [
        {
          name: searchKeyword.value + '附近',
          address: '北京市朝阳区' + searchKeyword.value + '路',
          latitude: 39.9,
          longitude: 116.4
        }
      ]
    }
    
    searching.value = false
  }, 800)
}

const selectCurrentLocation = () => {
  const location: Location = {
    name: '当前位置',
    address: '北京市朝阳区建国路附近',
    latitude: 39.91,
    longitude: 116.46
  }
  confirmSelect(location)
}

const selectAddress = (item: any) => {
  const location: Location = {
    name: item.name,
    address: item.address,
    latitude: item.latitude || 39.9,
    longitude: item.longitude || 116.4
  }
  confirmSelect(location)
}

const confirmSelect = (location: Location) => {
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2] as any
  
  if (selectType.value === 'start') {
    prevPage.startLocation = location
  } else {
    prevPage.endLocation = location
  }
  
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.address-select-container {
  min-height: 100vh;
  background: #F5F5F5;
}

.search-section {
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-box {
  display: flex;
  align-items: center;
  background: #F5F5F5;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
}

.search-input {
  flex: 1;
  height: 48rpx;
  margin-left: 16rpx;
  font-size: 28rpx;
}

.search-btn {
  font-size: 28rpx;
  color: #1890FF;
  margin-left: 16rpx;
  padding: 8rpx 16rpx;
}

.current-location {
  background: #FFFFFF;
  margin-top: 20rpx;
  padding: 0 32rpx;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
}

.current-icon {
  width: 72rpx;
  height: 72rpx;
  background: #E6F7FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.location-info {
  flex: 1;
}

.location-name {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.location-address {
  font-size: 24rpx;
  color: #999999;
}

.address-section {
  background: #FFFFFF;
  margin-top: 20rpx;
  padding: 0 32rpx;
}

.section-title {
  font-size: 26rpx;
  color: #999999;
  padding: 24rpx 0 16rpx;
}

.address-list {
  background: #FFFFFF;
}

.address-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
}

.address-icon {
  width: 72rpx;
  height: 72rpx;
  background: #F5F5F5;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.address-info {
  flex: 1;
}

.address-name {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.address-detail {
  font-size: 24rpx;
  color: #999999;
}

.search-result-section {
  background: #FFFFFF;
  margin-top: 20rpx;
  padding: 0 32rpx;
  min-height: calc(100vh - 200rpx);
}

.no-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.no-result-text {
  font-size: 28rpx;
  color: #999999;
  margin-top: 24rpx;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
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
