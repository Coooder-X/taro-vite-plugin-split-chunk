<template>
  <view class="beagle">
    <text>Beagle</text>
    <Choker></Choker>
    <button @tap="handleNavigate('/pages/dog/beagle/snoopy/snoopy')">点击跳转到 snoopy</button>
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import './index.scss';
import Choker from '../components/choker.vue';

useLoad(() => {
  console.log('Page loaded.');
});

const handleNavigate = (url: string) => {
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
