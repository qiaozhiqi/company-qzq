<template>
  <view class="contact-container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <u-icon name="arrow-left" size="36" color="#333333"></u-icon>
      </view>
      <view class="header-title">紧急联系人</view>
      <view class="header-right" @click="addContact">
        <u-icon name="plus" size="36" color="#1890FF"></u-icon>
      </view>
    </view>
    
    <view class="content">
      <view class="contact-item" v-for="(contact, index) in contacts" :key="index">
        <view class="contact-header">
          <view class="contact-name">{{ contact.name }}</view>
          <view class="contact-relation">{{ contact.relation }}</view>
        </view>
        <view class="contact-info">
          <view class="info-row">
            <u-icon name="phone" size="24" color="#999999"></u-icon>
            <text class="info-text">{{ contact.phone }}</text>
          </view>
          <view class="info-row">
            <u-icon name="map" size="24" color="#999999"></u-icon>
            <text class="info-text">{{ contact.address }}</text>
          </view>
        </view>
        <view class="contact-actions">
          <view class="action-btn edit" @click="editContact(contact)">
            <u-icon name="edit" size="24" color="#1890FF"></u-icon>
            <text class="action-text">编辑</text>
          </view>
          <view class="action-btn delete" @click="deleteContact(index)">
            <u-icon name="trash" size="24" color="#FF4D4F"></u-icon>
            <text class="action-text">删除</text>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-if="contacts.length === 0">
        <u-icon name="phone" size="80" color="#CCCCCC"></u-icon>
        <text class="empty-text">暂无紧急联系人</text>
        <view class="add-btn" @click="addContact">添加紧急联系人</view>
      </view>
      
      <view class="tips">
        <u-icon name="info-circle" size="24" color="#1890FF"></u-icon>
        <text class="tips-text">紧急联系人信息仅用于紧急情况下的联系，不会用于其他用途</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Contact {
  name: string
  relation: string
  phone: string
  address: string
}

const contacts = ref<Contact[]>([
  {
    name: '李四',
    relation: '配偶',
    phone: '13900139000',
    address: '北京市朝阳区建国路88号'
  },
  {
    name: '王五',
    relation: '父母',
    phone: '13700137000',
    address: '北京市海淀区中关村大街1号'
  }
])

const goBack = () => {
  uni.navigateBack()
}

const addContact = () => {
  uni.showToast({
    title: '添加联系人功能开发中',
    icon: 'none'
  })
}

const editContact = (contact: Contact) => {
  uni.showToast({
    title: '编辑联系人功能开发中',
    icon: 'none'
  })
}

const deleteContact = (index: number) => {
  uni.showModal({
    title: '删除联系人',
    content: '确定要删除这个紧急联系人吗？',
    success: (res) => {
      if (res.confirm) {
        contacts.value.splice(index, 1)
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
.contact-container {
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

.contact-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.contact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.contact-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
}

.contact-relation {
  min-width: 80rpx;
  height: 36rpx;
  background: #E6F7FF;
  color: #1890FF;
  font-size: 22rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-info {
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.info-text {
  font-size: 26rpx;
  color: #666666;
  margin-left: 16rpx;
  flex: 1;
}

.contact-actions {
  display: flex;
  justify-content: flex-end;
  gap: 48rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #F5F5F5;
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

.tips {
  display: flex;
  align-items: flex-start;
  background: #F0F9FF;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-top: 32rpx;
}

.tips-text {
  flex: 1;
  font-size: 24rpx;
  color: #1890FF;
  line-height: 36rpx;
  margin-left: 16rpx;
}
</style>