<template>
  <view class="snoopy">
    <text>Snoopy</text>
  </view>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';
import './index.scss';

console.log(debounce);
</script>

<style lang="scss">
@import './index.scss';
</style>
