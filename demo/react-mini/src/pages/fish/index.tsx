import { View, Text } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import * as echarts from 'echarts';

import './index.scss'

export default function Fish() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  console.log(echarts)

  return (
    <View className='fish'>
      <Text>Fish</Text>
    </View>
  )
}
