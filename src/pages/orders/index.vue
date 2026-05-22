<template>
  <view class="orders-container">
    <view class="tabs-section">
      <scroll-view class="tabs-scroll" scroll-x>
        <view class="tabs-list">
          <view 
            class="tab-item" 
            :class="{ active: activeType === item.value }"
            v-for="item in orderTypes" 
            :key="item.value"
            @click="switchType(item.value)"
          >
            {{ item.label }}
            <view class="tab-badge" v-if="item.count > 0">{{ item.count }}</view>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view class="status-tabs" v-if="activeType !== 'all'">
      <view class="status-tabs-list">
        <view 
          class="status-tab-item" 
          :class="{ active: activeStatus === item.value }"
          v-for="item in statusTabs" 
          :key="item.value"
          @click="switchStatus(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>
    
    <view class="orders-list">
      <view 
        class="order-card" 
        v-for="order in ordersList" 
        :key="order.id"
        @click="goToDetail(order)"
      >
        <view class="order-header">
          <view class="order-type">
            <view class="type-icon" :class="order.type">
              <u-icon :name="order.type === 'taxi' ? 'car' : 'home'" size="32" color="#FFFFFF"></u-icon>
            </view>
            <text class="type-text">{{ order.type === 'taxi' ? '公务打车' : '酒店预订' }}</text>
          </view>
          <view class="order-status" :class="order.status">
            {{ order.statusText }}
          </view>
        </view>
        
        <view class="order-content">
          <view class="order-main" v-if="order.type === 'taxi'">
            <view class="route-info">
              <view class="route-item">
                <view class="dot start-dot"></view>
                <text class="location-text">{{ order.taxiOrder?.startLocation.name }}</text>
              </view>
              <view class="route-line"></view>
              <view class="route-item">
                <view class="dot end-dot"></view>
                <text class="location-text">{{ order.taxiOrder?.endLocation.name }}</text>
              </view>
            </view>
            <view class="order-subtitle">
              {{ order.subtitle }}
            </view>
          </view>
          
          <view class="order-main" v-else>
            <image class="hotel-image" :src="order.hotelOrder?.hotel.image" mode="aspectFill" />
            <view class="hotel-info">
              <view class="hotel-name">{{ order.hotelOrder?.hotel.name }}</view>
              <view class="hotel-subtitle">{{ order.subtitle }}</view>
              <view class="hotel-dates">
                <text>{{ order.hotelOrder?.checkInDate }}</text>
                <u-icon name="arrow-right" size="20" color="#999999"></u-icon>
                <text>{{ order.hotelOrder?.checkOutDate }}</text>
                <text class="nights">共{{ order.hotelOrder?.nights }}晚</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <view class="order-time">{{ order.createTime }}</view>
          <view class="order-price">
            <text class="price-label">订单金额</text>
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ order.price }}</text>
          </view>
        </view>
        
        <view class="order-actions" v-if="['matching', 'matched', 'driver_arrived', 'on_ride', 'confirmed'].includes(order.status)">
          <view class="action-btn secondary" @click.stop="contactService">
            联系客服
          </view>
          <view class="action-btn primary" v-if="['matching', 'matched', 'confirmed'].includes(order.status)" @click.stop="cancelOrder(order)">
            取消订单
          </view>
          <view class="action-btn primary" v-else-if="order.status === 'on_ride'" @click.stop="viewTrip(order)">
            查看行程
          </view>
        </view>
      </view>
      
      <view class="load-more" v-if="loading">
        <u-loading-icon size="32" color="#999999"></u-loading-icon>
        <text class="load-text">加载中...</text>
      </view>
      
      <view class="no-more" v-else-if="ordersList.length > 0 && !hasMore">
        <text class="no-more-text">没有更多了</text>
      </view>
      
      <view class="empty-state" v-else-if="ordersList.length === 0 && !loading">
        <u-icon name="list" size="120" color="#DDDDDD"></u-icon>
        <text class="empty-text">暂无订单记录</text>
        <view class="empty-btn" @click="goToBook">
          去预订
        </view>
      </view>
    </view>
    
    <u-action-sheet 
      :show="showCancelSheet" 
      :actions="cancelReasons" 
      :cancel-text="'取消'"
      @click="onCancelReasonSelect"
      @close="showCancelSheet = false"
    ></u-action-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/store/order'
import type { Order, HotelOrder } from '@/types'
import { mockOrders, getTaxiOrderStatusText, getHotelOrderStatusText } from '@/mock'
import { hotelApi } from '@/api'

const orderStore = useOrderStore()

const activeType = ref<'all' | 'taxi' | 'hotel'>('all')
const activeStatus = ref<string>('all')
const ordersList = ref<Order[]>([])
const hotelOrders = ref<HotelOrder[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const showCancelSheet = ref(false)
const currentCancelOrder = ref<Order | null>(null)

const orderTypes = ref([
  { label: '全部', value: 'all' as const, count: 0 },
  { label: '打车', value: 'taxi' as const, count: 1 },
  { label: '酒店', value: 'hotel' as const, count: 0 }
])

const statusTabs = ref([
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' }
])

const cancelReasons = ref([
  { text: '行程变更', value: '行程变更' },
  { text: '不需要了', value: '不需要了' },
  { text: '司机接单太慢', value: '司机接单太慢' },
  { text: '其他原因', value: '其他原因' }
])

const loadHotelOrders = async () => {
  try {
    const params: any = {
      page: page.value,
      pageSize: 10
    }
    
    if (activeStatus.value !== 'all') {
      if (activeStatus.value === 'pending') {
        params.status = 'pending'
      } else if (activeStatus.value === 'active') {
        params.status = 'confirmed'
      } else if (activeStatus.value === 'completed') {
        params.status = 'completed'
      }
    }
    
    const res = await hotelApi.getOrderList(params)
    
    if (res.data && res.data.list) {
      hotelOrders.value = res.data.list
      
      orderTypes.value.find(t => t.value === 'hotel')!.count = res.data.total
      
      hasMore.value = page.value < res.data.totalPages
    }
  } catch (error) {
    console.error('加载酒店订单失败:', error)
  }
}

const convertHotelOrderToOrder = (hotelOrder: HotelOrder): Order => {
  return {
    id: hotelOrder.id,
    orderNo: hotelOrder.orderNo,
    type: 'hotel',
    status: hotelOrder.status,
    statusText: getHotelOrderStatusText(hotelOrder.status),
    title: hotelOrder.hotel?.name || '酒店预订',
    subtitle: `${hotelOrder.roomType?.name || ''} · ${hotelOrder.checkInDate} 入住 ${hotelOrder.nights}晚`,
    price: hotelOrder.totalPrice,
    createTime: hotelOrder.createdAt ? new Date(hotelOrder.createdAt).toLocaleString() : '',
    hotelOrder: hotelOrder
  }
}

const loadOrders = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  
  if (activeType.value === 'hotel' || activeType.value === 'all') {
    await loadHotelOrders()
  }
  
  let filtered = [...mockOrders.filter(o => o.type === 'taxi')]
  
  if (hotelOrders.value.length > 0) {
    const convertedHotelOrders = hotelOrders.value.map(convertHotelOrderToOrder)
    filtered = [...filtered, ...convertedHotelOrders]
  }
  
  if (activeType.value !== 'all') {
    filtered = filtered.filter(order => order.type === activeType.value)
  }
  
  if (activeStatus.value !== 'all') {
    if (activeStatus.value === 'pending') {
      filtered = filtered.filter(order => ['pending', 'matching', 'matched'].includes(order.status))
    } else if (activeStatus.value === 'active') {
      filtered = filtered.filter(order => ['driver_arrived', 'on_ride', 'confirmed', 'checked_in'].includes(order.status))
    } else if (activeStatus.value === 'completed') {
      filtered = filtered.filter(order => order.status === 'completed')
    }
  }
  
  filtered.sort((a, b) => {
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  })
  
  if (page.value === 1) {
    ordersList.value = filtered
  } else {
    ordersList.value = [...ordersList.value, ...filtered]
  }
  
  page.value++
  if (page.value > 2) {
    hasMore.value = false
  }
  
  loading.value = false
}

const switchType = (type: 'all' | 'taxi' | 'hotel') => {
  activeType.value = type
  activeStatus.value = 'all'
  page.value = 1
  hasMore.value = true
  ordersList.value = []
  loadOrders()
}

const switchStatus = (status: string) => {
  activeStatus.value = status
  page.value = 1
  hasMore.value = true
  ordersList.value = []
  loadOrders()
}

const goToDetail = (order: Order) => {
  if (order.type === 'taxi') {
    uni.navigateTo({
      url: `/pages/taxi/trip-detail?id=${order.id}`
    })
  } else {
    uni.navigateTo({
      url: `/pages/hotel/order-detail?id=${order.id}`
    })
  }
}

const contactService = () => {
  uni.showToast({
    title: '客服功能开发中',
    icon: 'none'
  })
}

const cancelOrder = (order: Order) => {
  currentCancelOrder.value = order
  showCancelSheet.value = true
}

const onCancelReasonSelect = async (e: any) => {
  if (!currentCancelOrder.value) return
  
  const reason = e.text
  
  if (currentCancelOrder.value.type === 'hotel') {
    uni.showLoading({ title: '取消中...' })
    
    try {
      await hotelApi.cancelOrder(currentCancelOrder.value.id, reason)
      
      uni.hideLoading()
      uni.showToast({
        title: '订单已取消',
        icon: 'success'
      })
      
      const index = ordersList.value.findIndex(o => o.id === currentCancelOrder.value?.id)
      if (index > -1) {
        ordersList.value[index].status = 'cancelled'
        ordersList.value[index].statusText = '已取消'
      }
      
      showCancelSheet.value = false
      currentCancelOrder.value = null
      
      setTimeout(() => {
        page.value = 1
        hasMore.value = true
        loadOrders()
      }, 1000)
    } catch (error: any) {
      uni.hideLoading()
      console.error('取消订单失败:', error)
      uni.showToast({
        title: error.message || '取消失败，请重试',
        icon: 'none'
      })
    }
  } else {
    uni.showLoading({ title: '取消中...' })
    
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({
        title: '订单已取消',
        icon: 'success'
      })
      
      const index = ordersList.value.findIndex(o => o.id === currentCancelOrder.value?.id)
      if (index > -1) {
        ordersList.value[index].status = 'cancelled'
        ordersList.value[index].statusText = '已取消'
      }
      
      showCancelSheet.value = false
      currentCancelOrder.value = null
    }, 800)
  }
}

const viewTrip = (order: Order) => {
  uni.navigateTo({
    url: `/pages/taxi/trip-detail?id=${order.id}`
  })
}

const goToBook = () => {
  uni.switchTab({
    url: '/pages/taxi/index'
  })
}

const onPullDownRefresh = () => {
  page.value = 1
  hasMore.value = true
  ordersList.value = []
  loadOrders().then(() => {
    uni.stopPullDownRefresh()
  })
}

const onReachBottom = () => {
  loadOrders()
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.orders-container {
  min-height: 100vh;
  background: #F5F5F5;
}

.tabs-section {
  background: #FFFFFF;
  padding: 20rpx 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-list {
  display: inline-flex;
  padding: 0 32rpx;
  gap: 48rpx;
}

.tab-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 8rpx 0;
  font-size: 30rpx;
  color: #666666;
  
  &.active {
    color: #1890FF;
    font-weight: 500;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 6rpx;
      background: #1890FF;
      border-radius: 3rpx;
    }
  }
}

.tab-badge {
  position: absolute;
  top: 0;
  right: -24rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #FF4D4F;
  color: #FFFFFF;
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.status-tabs {
  background: #FFFFFF;
  padding: 16rpx 0;
  border-top: 2rpx solid #F5F5F5;
}

.status-tabs-list {
  display: flex;
  justify-content: space-around;
  padding: 0 32rpx;
}

.status-tab-item {
  font-size: 26rpx;
  color: #666666;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  
  &.active {
    background: #E6F7FF;
    color: #1890FF;
    font-weight: 500;
  }
}

.orders-list {
  padding: 24rpx 32rpx;
}

.order-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #F5F5F5;
  margin-bottom: 20rpx;
}

.order-type {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.type-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.taxi {
    background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  }
  
  &.hotel {
    background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
  }
}

.type-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.order-status {
  font-size: 26rpx;
  
  &.completed {
    color: #52C41A;
  }
  
  &.cancelled {
    color: #999999;
  }
  
  &.confirmed, &.matched {
    color: #1890FF;
  }
  
  &.on_ride, &.checked_in {
    color: #FAAD14;
  }
  
  &.pending, &.matching {
    color: #FF4D4F;
  }
}

.order-content {
  margin-bottom: 20rpx;
}

.order-main {
  display: flex;
}

.route-info {
  flex: 1;
}

.route-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 0;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.start-dot {
  background: #1890FF;
}

.end-dot {
  background: #52C41A;
}

.route-line {
  width: 2rpx;
  height: 32rpx;
  background: #E8E8E8;
  margin-left: 7rpx;
}

.location-text {
  font-size: 28rpx;
  color: #333333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-subtitle {
  font-size: 24rpx;
  color: #999999;
  margin-top: 12rpx;
  padding-left: 32rpx;
}

.hotel-image {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.hotel-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hotel-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-subtitle {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.hotel-dates {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 24rpx;
  color: #666666;
  margin-top: 8rpx;
}

.nights {
  color: #1890FF;
  margin-left: 8rpx;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 2rpx solid #F5F5F5;
}

.order-time {
  font-size: 24rpx;
  color: #999999;
}

.order-price {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-label {
  font-size: 24rpx;
  color: #999999;
  margin-right: 8rpx;
}

.price-symbol {
  font-size: 24rpx;
  color: #FF4D4F;
}

.price-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF4D4F;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #F5F5F5;
}

.action-btn {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  
  &.secondary {
    background: #F5F5F5;
    color: #666666;
  }
  
  &.primary {
    background: #1890FF;
    color: #FFFFFF;
  }
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

.empty-btn {
  margin-top: 32rpx;
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  color: #FFFFFF;
  font-size: 28rpx;
  border-radius: 40rpx;
}
</style>
