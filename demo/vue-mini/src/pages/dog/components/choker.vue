<template>
  <view class="choker">
    <text>Choker</text>
  </view>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';
import './choker.scss';

console.log(debounce);
</script>

<style lang="scss">
@import './choker.scss';
</style>
