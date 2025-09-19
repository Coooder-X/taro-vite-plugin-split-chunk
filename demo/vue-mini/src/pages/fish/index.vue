<template>
  <view class="fish">
    <text>Fish</text>
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro';
import * as three from 'three';
import './index.scss';

useLoad(() => {
  console.log('Page loaded.');
});

console.log(three.Vector2);
</script>

<style lang="scss">
@import './index.scss';
</style>
