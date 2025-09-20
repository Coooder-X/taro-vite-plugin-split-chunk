import { View, Text } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import * as d3 from 'd3';
import { debounce } from 'lodash';
import './index.scss';

export default function Cat() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  console.log(d3)
  console.log(debounce)

  return (
    <View className='cat'>
      <Text>Cat</Text>
    </View>
  )
}
