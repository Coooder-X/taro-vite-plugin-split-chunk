import { View, Text, Button } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { debounce } from 'lodash'
import './index.scss'
import Beagle from './beagle/beagle';

export default function Dog () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  const handleNavigate = (url: string) => {
    Taro.navigateTo({
      url,
    }).catch((err) => {
      console.error('页面跳转失败:', err);
    });
  };

  console.log(debounce)

  return (
    <View>
      <Text className='dog'>Dog</Text>
      <Button onClick={() => handleNavigate('/pages/dog/husky')}>点击跳转到 husky</Button>
      <Button onClick={() => handleNavigate('/pages/dog/beagle/snoopy/snoopy')}>点击跳转到 snoopy</Button>
      <Beagle></Beagle>
    </View>
  )
}
