# vite-plugin-split-chunk

一个专为 Taro 小程序项目设计的 Vite 插件，用于智能分包和代码分割优化。该插件能够根据小程序的分包配置自动将代码分割到对应的子包中，优化小程序的加载性能。

## 特性

- 🚀 **智能分包**: 根据 Taro 项目的 `app.config.ts` 自动分析分包结构
- 📦 **代码分割**: 将仅被子包使用的代码自动分割到对应子包目录
- 🔧 **路径修复**: 自动修复子包中对主包公共代码的引用路径
- 💄 **样式处理**: 智能处理 WXSS 样式文件的引用关系
- 🛠️ **开发友好**: 支持开发环境下的 Source Map 生成
- 📝 **详细日志**: 提供详细的构建日志，便于调试

## 安装

```bash
npm install vite-plugin-split-chunk --save-dev
```

或者使用 yarn:

```bash
yarn add vite-plugin-split-chunk --dev
```

## 使用方法

在你的 Vite 配置文件中添加插件：

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import viteSplitChunkPlugin from 'vite-plugin-split-chunk'

export default defineConfig({
  plugins: [
    viteSplitChunkPlugin({
      appConfigPath: './src/app.config.ts' // 指向你的 app.config.ts 文件路径
    })
  ]
})
```

## 配置选项

### ViteSplitChunkPluginProps

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `appConfigPath` | `string` | ✅ | Taro 项目的 app.config.ts 文件路径 |

## 详细实现原理

### 核心设计思路

本插件基于 Vite/Rollup 的插件机制，通过多个生命周期钩子实现智能分包：

1. **依赖收集阶段**：在 `moduleParsed` 钩子中收集所有模块的依赖关系
2. **依赖分析阶段**：在 `buildEnd` 钩子中分析依赖图，确定分包策略
3. **代码分割阶段**：在 `outputOptions` 钩子中配置 `manualChunks` 实现分包
4. **路径修复阶段**：在 `renderChunk` 钩子中修复引用路径
5. **文件输出阶段**：在 `generateBundle` 和 `writeBundle` 钩子中处理文件输出

### 1. 依赖分析算法

#### 1.1 依赖图构建
```typescript
// 核心数据结构
interface DependencyAnalyzer {
  // 模块依赖映射：moduleId -> [依赖的moduleId列表]
  idImportedMap: Map<ModuleId, ModuleId[]>
  
  // 依赖信息映射：moduleId -> {importers: 依赖者集合, pageImporters: 页面依赖者集合}
  depMap: Map<ModuleId, { importers: Set<ModuleId>; pageImporters: Set<ModuleId> }>
  
  // 分包映射：moduleId -> chunkName
  subChunkMap: Map<ModuleId, ChunkName>
  
  // chunk到页面映射：chunkName -> [pageRoot列表]
  chunkPageMap: Map<ChunkName, PageRoot[]>
}
```

#### 1.2 深度优先搜索（DFS）依赖分析
插件使用 DFS 算法遍历依赖图，为每个模块标记其被哪些页面依赖：

```typescript
private dfs(pageModuleId: ModuleId, fatherModuleId: ModuleId, curModuleId: ModuleId) {
  // 1. 初始化当前模块的依赖信息
  if (!this.depMap.has(curModuleId)) {
    this.depMap.set(curModuleId, {
      importers: new Set<ModuleId>(),      // 直接依赖者
      pageImporters: new Set<ModuleId>(),  // 页面级依赖者
    });
  }
  
  // 2. 标记页面依赖关系
  const depInfo = this.depMap.get(curModuleId)!;
  if (depInfo.pageImporters.has(pageModuleId)) return; // 避免循环依赖
  
  depInfo.pageImporters.add(pageModuleId);
  
  // 3. 合并父级依赖者信息
  const fatherDepInfo = this.depMap.get(fatherModuleId);
  const { importers: fatherImporters = new Set<ModuleId>() } = fatherDepInfo || {};
  depInfo.importers = this.unionSet<ModuleId>(depInfo.importers, fatherImporters);
  
  // 4. 递归分析子依赖
  for (const id of this.idImportedMap.get(curModuleId) || []) {
    this.dfs(pageModuleId, curModuleId, id);
  }
}
```

#### 1.3 分包策略决策
基于依赖分析结果，插件采用以下策略决定模块的分包归属：

```typescript
private getSubChunkMap() {
  for (const [moduleId, { pageImporters }] of this.depMap) {
    let pages: PageRoot[] = [];
    
    // 1. 收集依赖该模块的所有页面
    for (const importerId of pageImporters) {
      const pageName = this.getPageNameById(importerId);
      if (pageName) pages.push(pageName);
    }
    
    // 2. 过滤条件：
    // - 模块必须被页面引用
    // - 不能被主包页面引用（避免主包依赖子包代码）
    if (!pages.length) continue;
    if (pages.some(page => isMainPackagePage(page, this.mainPageInfoList))) continue;
    
    // 3. 生成 chunk 名称和映射关系
    pages = [...new Set(pages)].sort();
    const chunkName = pages.map(item => this.pageIdMap.get(item)).join('_') as ChunkName;
    this.chunkPageMap.set(chunkName, pages);
    this.subChunkMap.set(moduleId, chunkName);
  }
}
```

### 2. 智能分包机制

#### 2.1 ManualChunks 配置
插件通过重写 Rollup 的 `manualChunks` 配置实现分包：

```typescript
const getManualChunkAlias = (moduleId: ModuleId, manualChunksApi: ManualChunkMeta) => {
  const chunk = subChunkMap.get(moduleId);
  if (!chunk) return originManualChunks!(moduleId, manualChunksApi);
  return chunk; // 返回自定义的 chunk 名称
};
```

#### 2.2 分包命名规则
- 单页面依赖：`page1`、`page2` 等
- 多页面共享：`page1_page3`、`page2_page4` 等
- 页面ID映射：按字母顺序排序生成稳定的页面ID

### 3. 路径修复机制

#### 3.1 子包内部路径修复
子包中的模块需要修复对主包公共代码的引用：

```typescript
// 修复前：require('./taro.js')
// 修复后：require('../../taro.js')
const newCode = code
  .replaceAll("require('./taro.js')", "require('../../taro.js')")
  .replaceAll("require('./common.js')", "require('../../common.js')")
  .replaceAll("require('./vendors.js')", "require('../../vendors.js')");
```

#### 3.2 相对路径计算算法
```typescript
export function getRelativeLevelPath(chunkPathInPageRoot: string) {
  const levelList = chunkPathInPageRoot.split('/').filter(Boolean);
  if (levelList.length === 0 || levelList.length === 1) return './';
  return '../'.repeat(levelList.length - 1);
}
```

#### 3.3 动态路径替换
对于嵌套页面结构，插件使用正则表达式动态替换引用路径：

```typescript
const requireRegex = new RegExp(`require\\(('|")(\\.\\./)+${chunkName}\\.js\\1\\)`, 'g');
return accCode.replaceAll(requireRegex, `require('${relativeImportPath}')`);
```

### 4. 文件输出优化

#### 4.1 Bundle 重组
在 `generateBundle` 钩子中，插件会重新组织输出文件结构：

```typescript
for (const [chunkFilePath, file] of Object.entries(bundle)) {
  if (!isSubpackageChunkFile(chunkPageMap, subPackagesInfoList, chunkPath)) continue;
  
  const outputPages = chunkPageMap.get(chunkName)!;
  for (const outputDir of outputPages) {
    const newChunkPath = `${outputDir}/${file.fileName}`;
    
    // 创建新的文件输出路径
    bundle[newChunkPath] = {
      ...file,
      fileName: newChunkPath,
    };
    
    // 删除原有路径
    delete bundle[chunkPath];
  }
}
```

#### 4.2 样式文件处理
对于 WXSS 样式文件，插件会自动在页面入口样式中添加公共样式引用：

```typescript
const importCode = `@import "${relativeImportWxssPath}";\n`;
const pageWxssCode = fs.existsSync(pageWxssPath) ? fs.readFileSync(pageWxssPath, 'utf8') : '';

// 避免重复添加引用
if (!pageWxssCode.includes(importCode)) {
  fs.writeFileSync(pageWxssPath, `${importCode}${pageWxssCode}`, 'utf8');
}
```

### 5. 性能优化策略

#### 5.1 循环依赖检测
通过 `pageImporters.has(pageModuleId)` 检查避免无限递归

#### 5.2 缓存机制
使用 Map 数据结构缓存计算结果，避免重复计算

#### 5.3 增量分析
只对变更的模块进行重新分析，提高热更新性能

### 6. 错误处理与日志

插件提供详细的日志输出，包括：
- 依赖分析统计信息
- 分包决策过程
- 路径修复操作
- 文件输出状态

```typescript
logger.info(`app 下 module 数量: ${this.depMap.size}`, 'analyzeDep.showDep');
logger.info(`可打入子包 chunk 的 module 数量: ${cnt}`, 'analyzeDep.showDep');
logger.success(`更新 chunk: ${fileName} 的依赖引用路径成功`, 'renderChunk');
```

## 工作原理概览

### 整体流程图
```
1. [moduleParsed] 收集模块依赖关系
   ↓
2. [buildEnd] DFS分析依赖图 → 生成分包映射
   ↓  
3. [outputOptions] 配置manualChunks → 实现代码分割
   ↓
4. [renderChunk] 修复引用路径 → 处理相对路径
   ↓
5. [generateBundle] 重组文件结构 → 输出到子包目录
   ↓
6. [writeBundle] 处理样式引用 → 完成构建
```

### 核心算法复杂度
- **时间复杂度**: O(V + E)，其中 V 是模块数量，E 是依赖关系数量
- **空间复杂度**: O(V)，主要用于存储依赖映射关系

这种设计确保了插件在大型项目中的高效运行，同时保持了代码的可维护性和扩展性。

## 示例项目

项目中包含了一个完整的示例项目，位于 `demo/react-mini` 目录下。你可以参考这个示例来了解如何在实际项目中使用该插件。

### 运行示例

```bash
cd demo/react-mini
npm install
npm run build
```

## 构建脚本

```bash
# 构建插件
npm run build

# 开发模式（监听文件变化）
npm run dev
```

## 技术栈

- **TypeScript**: 提供类型安全
- **Rollup**: 底层构建工具
- **Taro**: 小程序开发框架
- **Colorette**: 彩色日志输出

## 兼容性

- ✅ Taro 4.x
- ✅ Vite 3.x+
- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 其他 Taro 支持的小程序平台

## 注意事项

1. **公共文件命名**: 插件目前支持的公共文件名称为 `taro.js`、`common.js`、`vendors.js`
2. **开发环境**: 开发环境下会自动生成 Source Map 文件以便调试
3. **文件路径**: 确保 `appConfigPath` 指向正确的 app.config.ts 文件路径

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0.0
- 🎉 初始版本发布
- ✨ 支持基于 Taro 配置的智能分包
- ✨ 自动路径修复功能
- ✨ WXSS 样式文件处理
- ✨ 详细的构建日志
