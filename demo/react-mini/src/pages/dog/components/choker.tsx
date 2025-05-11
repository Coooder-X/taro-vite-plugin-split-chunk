import { View, Text } from '@tarojs/components';
import { debounce } from 'lodash'
import './choker.scss'

export default function Choker () {

  console.log(debounce)

  return (
    <View className='choker'>
      <Text>Choker</Text>
    </View>
  )
}
