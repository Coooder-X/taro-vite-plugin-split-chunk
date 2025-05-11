import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { debounce } from 'lodash'
import './index.scss'
import Choker from '../components/choker';

export default function Beagle () {

  console.log(debounce)

  const handleNavigate = (url: string) => {
    Taro.navigateTo({
      url,
    }).catch((err) => {
      console.error('页面跳转失败:', err);
    });
  };

  return (
    <View className='beagle'>
      <Text>Beagle</Text>
      <Choker></Choker>
      <Button onClick={() => handleNavigate('/pages/dog/beagle/snoopy/snoopy')}>点击跳转到 snoopy</Button>
    </View>
  )
}
