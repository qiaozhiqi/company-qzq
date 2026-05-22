<template>
  <view class="invoice-container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <u-icon name="arrow-left" size="36" color="#333333"></u-icon>
      </view>
      <view class="header-title">发票信息</view>
      <view class="header-right" @click="addInvoice">
        <u-icon name="plus" size="36" color="#1890FF"></u-icon>
      </view>
    </view>
    
    <view class="content">
      <view class="invoice-item" v-for="(invoice, index) in invoices" :key="index">
        <view class="invoice-header">
          <view class="invoice-type">{{ invoice.type === 'company' ? '企业发票' : '个人发票' }}</view>
          <view class="invoice-status" v-if="invoice.isDefault">默认</view>
        </view>
        <view class="invoice-content">
          <view class="invoice-row">
            <view class="label">发票抬头</view>
            <view class="value">{{ invoice.title }}</view>
          </view>
          <view class="invoice-row" v-if="invoice.type === 'company'">
            <view class="label">税号</view>
            <view class="value">{{ invoice.taxNumber }}</view>
          </view>
          <view class="invoice-row">
            <view class="label">开户行</view>
            <view class="value">{{ invoice.bank }}</view>
          </view>
          <view class="invoice-row">
            <view class="label">银行账号</view>
            <view class="value">{{ invoice.account }}</view>
          </view>
          <view class="invoice-row">
            <view class="label">地址</view>
            <view class="value">{{ invoice.address }}</view>
          </view>
          <view class="invoice-row">
            <view class="label">电话</view>
            <view class="value">{{ invoice.phone }}</view>
          </view>
        </view>
        <view class="invoice-actions">
          <view class="action-btn default" @click="setDefault(index)">
            <u-icon name="check-circle" size="24" :color="invoice.isDefault ? '#1890FF' : '#CCCCCC'"></u-icon>
            <text class="action-text">设为默认</text>
          </view>
          <view class="action-btn edit" @click="editInvoice(invoice)">
            <u-icon name="edit" size="24" color="#1890FF"></u-icon>
            <text class="action-text">编辑</text>
          </view>
          <view class="action-btn delete" @click="deleteInvoice(index)">
            <u-icon name="trash" size="24" color="#FF4D4F"></u-icon>
            <text class="action-text">删除</text>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-if="invoices.length === 0">
        <u-icon name="file-text" size="80" color="#CCCCCC"></u-icon>
        <text class="empty-text">暂无发票信息</text>
        <view class="add-btn" @click="addInvoice">添加发票信息</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Invoice {
  type: 'company' | 'personal'
  title: string
  taxNumber?: string
  bank: string
  account: string
  address: string
  phone: string
  isDefault: boolean
}

const invoices = ref<Invoice[]>([
  {
    type: 'company',
    title: '北京科技有限公司',
    taxNumber: '91110000MA12345678',
    bank: '中国工商银行北京分行',
    account: '6222021234567890123',
    address: '北京市海淀区中关村大街1号',
    phone: '010-12345678',
    isDefault: true
  },
  {
    type: 'personal',
    title: '张三',
    bank: '中国建设银行北京分行',
    account: '6227001234567890123',
    address: '北京市朝阳区建国路88号',
    phone: '13800138000',
    isDefault: false
  }
])

const goBack = () => {
  uni.navigateBack()
}

const addInvoice = () => {
  uni.showToast({
    title: '添加发票功能开发中',
    icon: 'none'
  })
}

const editInvoice = (invoice: Invoice) => {
  uni.showToast({
    title: '编辑发票功能开发中',
    icon: 'none'
  })
}

const deleteInvoice = (index: number) => {
  if (invoices.value[index].isDefault) {
    uni.showToast({
      title: '默认发票不能删除',
      icon: 'none'
    })
    return
  }
  
  uni.showModal({
    title: '删除发票',
    content: '确定要删除这个发票信息吗？',
    success: (res) => {
      if (res.confirm) {
        invoices.value.splice(index, 1)
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

const setDefault = (index: number) => {
  invoices.value.forEach((invoice, i) => {
    invoice.isDefault = i === index
  })
  uni.showToast({
    title: '已设为默认',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.invoice-container {
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

.invoice-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.invoice-type {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
}

.invoice-status {
  min-width: 64rpx;
  height: 36rpx;
  background: #E6F7FF;
  color: #1890FF;
  font-size: 22rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invoice-content {
  margin-bottom: 24rpx;
}

.invoice-row {
  display: flex;
  margin-bottom: 16rpx;
  align-items: flex-start;
}

.label {
  width: 120rpx;
  font-size: 26rpx;
  color: #999999;
  flex-shrink: 0;
}

.value {
  flex: 1;
  font-size: 26rpx;
  color: #333333;
  line-height: 36rpx;
}

.invoice-actions {
  display: flex;
  justify-content: flex-end;
  gap: 32rpx;
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
</style>