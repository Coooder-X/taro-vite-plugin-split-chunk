import { View, Text } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import * as three from 'three'

import './index.scss'

export default function Fish () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  console.log(three)

  return (
    <View className='fish'>
      <Text>Fish</Text>
    </View>
  )
}
