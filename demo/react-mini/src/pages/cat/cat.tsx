import { View, Text } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import * as d3 from 'd3';
import './index.scss';

export default function Cat () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  console.log(d3)

  return (
    <View className='cat'>
      <Text>Cat</Text>
    </View>
  )
}
