<template>
  <view class="fish">
    <text>Fish</text>
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro';
import * as echarts from 'echarts';
import './index.scss';

useLoad(() => {
  console.log('Page loaded.');
});

console.log(echarts);
</script>

<style lang="scss">
@import './index.scss';
</style>
