import { View, Text, Button } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  const handleNavigate = (url: string) => {
    // 使用 Taro 的 navigateTo 方法跳转到指定页面
    Taro.navigateTo({
      url,
    }).catch((err) => {
      console.error('页面跳转失败:', err);
    });
  };

  return (
    <View className='index'>
      <Text>Hello world!</Text>
      <Button onClick={() => handleNavigate('/pages/cat/cat')}>点击跳转到cat</Button>
      <Button onClick={() => handleNavigate('/pages/dog/index')}>点击跳转到dog</Button>
      <Button onClick={() => handleNavigate('/pages/fish/index')}>点击跳转到fish</Button>
    </View>
  )
}
