import { View, Text } from '@tarojs/components';
import { debounce } from 'lodash'
import './index.scss'

export default function Husky () {

  console.log(debounce)

  return (
    <View className='husky'>
      <Text>Husky</Text>
    </View>
  )
}
