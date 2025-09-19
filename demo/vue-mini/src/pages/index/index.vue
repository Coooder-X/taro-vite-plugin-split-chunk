<template>
  <view class="index">
    <text>Hello world!</text>
    <button @tap="handleNavigate('/pages/cat/cat')">点击跳转到cat</button>
    <button @tap="handleNavigate('/pages/dog/index')">点击跳转到dog</button>
    <button @tap="handleNavigate('/pages/fish/index')">点击跳转到fish</button>
    <button @tap="testClick">测试点击事件</button>
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import './index.scss';

useLoad(() => {
  console.log('Page loaded.');
});

const testClick = () => {
  console.log('测试点击事件被触发！');
  Taro.showToast({
    title: '点击事件正常！',
    icon: 'success'
  });
};

const handleNavigate = (url: string) => {
  // 使用 Taro 的 navigateTo 方法跳转到指定页面
  Taro.navigateTo({
    url,
  }).catch((err) => {
    console.error('页面跳转失败:', err);
  });
};
</script>

<style lang="scss">
@import './index.scss';
</style>
