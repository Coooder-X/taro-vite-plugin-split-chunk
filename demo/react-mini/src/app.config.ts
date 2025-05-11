export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  subPackages: [
    {
      root: 'pages/cat',
      pages: ['cat'],
    },
    {
      root: 'pages/fish',
      pages: ['index'],
    },
    {
      root: 'pages/dog',
      pages: ['index', 'husky', 'beagle/beagle', 'beagle/snoopy/snoopy'],
    },
  ]
})
