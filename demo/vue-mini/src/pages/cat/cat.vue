<template>
  <view class="cat">
    <text>Cat</text>
  </view>
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import { debounce } from 'lodash';
import { onMounted } from 'vue';
import './index.scss';

onMounted(() => {
  console.log('Page loaded.');
});

console.log(d3);
console.log(debounce);
</script>

<style lang="scss">
@import './index.scss';
</style>
