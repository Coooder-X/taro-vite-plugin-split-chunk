<template>
  <view>
    <text class="dog">Dog</text>
    <button @tap="handleNavigate('/pages/dog/husky')">点击跳转到 husky</button>
    <button @tap="handleNavigate('/pages/dog/beagle/snoopy/snoopy')">点击跳转到 snoopy</button>
    <Beagle></Beagle>
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import * as d3 from 'd3';
import * as lodash from 'lodash';
import './index.scss';
import Beagle from './beagle/beagle.vue';

useLoad(() => {
  console.log('Page loaded.');
});

console.log(d3);
console.log(lodash);

const handleNavigate = (url: string) => {
  debugger; // 用于断点调试，测试分包插件在 dev 下 source map 的正确性
  Taro.navigateTo({
    url,
  }).catch((err) => {
    console.error('页面跳转失败:', err);
  });
};

console.log(lodash.debounce);
</script>

<style lang="scss">
@import './index.scss';
</style>
