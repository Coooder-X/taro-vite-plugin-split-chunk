import { View, Text } from '@tarojs/components';
import { debounce } from 'lodash'
import './index.scss'

export default function Snoopy () {

  console.log(debounce)

  return (
    <View className='snoopy'>
      <Text>Snoopy</Text>
    </View>
  )
}
