<template>
  <view class="addresses-container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <u-icon name="arrow-left" size="36" color="#333333"></u-icon>
      </view>
      <view class="header-title">常用地址</view>
      <view class="header-right" @click="addAddress">
        <u-icon name="plus" size="36" color="#1890FF"></u-icon>
      </view>
    </view>
    
    <view class="content">
      <view class="address-item" v-for="(address, index) in addresses" :key="index">
        <view class="address-header">
          <view class="address-type">{{ address.type === 'home' ? '家' : '公司' }}</view>
          <view class="address-name">{{ address.name }}</view>
          <view class="address-phone">{{ address.phone }}</view>
        </view>
        <view class="address-detail">{{ address.detail }}</view>
        <view class="address-actions">
          <view class="action-btn edit" @click="editAddress(address)">
            <u-icon name="edit" size="24" color="#1890FF"></u-icon>
            <text class="action-text">编辑</text>
          </view>
          <view class="action-btn delete" @click="deleteAddress(index)">
            <u-icon name="trash" size="24" color="#FF4D4F"></u-icon>
            <text class="action-text">删除</text>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-if="addresses.length === 0">
        <u-icon name="location" size="80" color="#CCCCCC"></u-icon>
        <text class="empty-text">暂无常用地址</text>
        <view class="add-btn" @click="addAddress">添加常用地址</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Address {
  type: 'home' | 'company'
  name: string
  phone: string
  detail: string
}

const addresses = ref<Address[]>([
  {
    type: 'home',
    name: '张三',
    phone: '13800138000',
    detail: '北京市朝阳区建国路88号SOHO现代城A座2301室'
  },
  {
    type: 'company',
    name: '张三',
    phone: '13800138000',
    detail: '北京市海淀区中关村大街1号中关村广场C座15层'
  }
])

const goBack = () => {
  uni.navigateBack()
}

const addAddress = () => {
  uni.showToast({
    title: '添加地址功能开发中',
    icon: 'none'
  })
}

const editAddress = (address: Address) => {
  uni.showToast({
    title: '编辑地址功能开发中',
    icon: 'none'
  })
}

const deleteAddress = (index: number) => {
  uni.showModal({
    title: '删除地址',
    content: '确定要删除这个地址吗？',
    success: (res) => {
      if (res.confirm) {
        addresses.value.splice(index, 1)
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.addresses-container {
  min-height: 100vh;
  background: #F5F5F5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: #FFFFFF;
  border-bottom: 2rpx solid #F5F5F5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left,
.header-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  flex: 1;
  text-align: center;
}

.content {
  padding: 24rpx 32rpx;
}

.address-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.address-type {
  min-width: 56rpx;
  height: 36rpx;
  background: #E6F7FF;
  color: #1890FF;
  font-size: 22rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.address-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-right: 24rpx;
}

.address-phone {
  font-size: 28rpx;
  color: #666666;
}

.address-detail {
  font-size: 28rpx;
  color: #666666;
  line-height: 40rpx;
  margin-bottom: 24rpx;
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  gap: 48rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.action-text {
  font-size: 26rpx;
  color: #666666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin: 32rpx 0;
}

.add-btn {
  width: 240rpx;
  height: 72rpx;
  background: #1890FF;
  color: #FFFFFF;
  font-size: 28rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>