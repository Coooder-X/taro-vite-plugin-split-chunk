# vite-plugin-split-chunk

一个专为 Taro 4.x 小程序项目设计的 Vite 插件，用于智能分包和代码分割优化。该插件能够根据小程序的分包配置自动将代码分割到对应的子包中，优化小程序的加载性能。

[实现思路](./DOC.md)

## 特性

- ⚡ 支持 Taro 4.x 的 vite 项目
- 🚀 **智能分包**: 根据 Taro 项目中 `app.config.ts` 的配置自动分析分包结构
- 📦 **代码分割**: 将仅被子包使用的代码自动分割到对应子包目录。尽可能少的代码冗余，尽可能多地优化主包及分包的大小。
- 🛠️ **开发友好**: 支持开发环境下的 Source Map 生成

## 安装

```bash
npm install vite-plugin-split-chunk --save-dev
```

或者使用 yarn:

```bash
yarn add vite-plugin-split-chunk --dev
```

## 使用方法

在你的小程序配置文件中添加插件：

```javascript
// config/index.ts
import { defineConfig } from 'vite'
import viteSplitChunkPlugin from 'vite-plugin-split-chunk'
export default defineConfig<'vite'>(async (merge) => {
  ...,
  compiler: {
    type: 'vite',
    vitePlugins: [
      viteSplitChunkPlugin({
        // 传入 app.config.ts 的绝对路径
        appConfigPath: join(__dirname, '../src/app.config.ts'),
      }),
    ],
  },
  ...
});
```

## 配置选项

### ViteSplitChunkPluginProps

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `appConfigPath` | `string` | ✅ | Taro 项目的 app.config.ts 文件绝对路径 |
| `isDebug` | `boolean` | ❌ | 是否开启调试模式，开启后控制台将输出更多信息；同时 chunk 文件名使用页面 id 的拼接，方便观察 chunk 依赖关系 |

### 项目结构

项目结构如下：
```
├── demo
|  ├── react-mini
|  └── vue-mini
├── dist
|  ├── index.js
|  ├── types
|  └── utils
├── README.md
├── src
|  ├── index.ts
|  ├── types
|  └── utils
└── types
```
src 目录下是插件源码。在根目录下运行 `npm run build` 后可输出到 dist 目录，demo 目录下的两个示例项目依赖 dist 目录下的文件，便于调试插件。

## demo 项目

项目中包含了两个完整的示例项目，分别基于 react 和 vue，位于 `demo/react-mini` 和 `demo/vue-mini` 目录下。
你可以参考这个示例来了解如何在实际项目中使用该插件,以及验证和对比分包的效果。

### 运行示例

#### 构建插件

在项目根目录下运行 `npm run build` 可以构建插件，构建后的文件会输出到 `dist` 目录。

```bash
# 构建插件
npm run build

# 开发模式
npm run dev
```

#### 运行 demo 项目

```bash
cd demo/react-mini
npm install
npm run build:weapp
```

> vue 项目同理。


## 兼容性

- ✅ Taro 4.x
- ✅ Vite 3.x+
- ✅ 目前仅在微信小程序中验证可用，其他平台待验证


## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0.0
- 🎉 初始版本发布
- ✨ 支持基于 Taro vite 的智能分包
