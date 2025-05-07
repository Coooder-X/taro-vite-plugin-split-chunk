import { InputOptions, ModuleInfo, OutputBundle, OutputOptions, RenderedChunk } from 'rollup';
export interface ViteSplitChunkPluginProps {
  appConfigPath: string;
}
export default function viteSplitChunkPlugin(props: ViteSplitChunkPluginProps): {
  name: string;
  buildStart(): void;
  options(options: InputOptions): Promise<InputOptions>;
  /** 收集每个模块的依赖关系 */
  moduleParsed(moduleInfo: ModuleInfo): void;
  /** build 结束后，依赖收集完成，可以根据依赖图做依赖分析 */
  buildEnd(): void;
  outputOptions(outputOptions: OutputOptions): OutputOptions;
  renderChunk(code: string, chunk: RenderedChunk): {
    code: string;
    map: null;
  };
  /**
   * 在 rollup 输出 bundle 之前，对 bundle 进行修改，目的是将 chunk 输出到对应的子包的目录中。
   * 修改的方法为：为 bundle 创建新的键值对，其中修改了 chunk 的文件路径，代表输出到的新 chunk，同时删除该 chunk 旧的键值对。
   *
   * 在小程序中，有以下现象（变量名均与下方代码中的对应）：
   * 1、对于 css chunk，其 file.name = 'page2.wxss'，chunkName = 'page2.css'，
   * 2、对于 js chunk，其 fileName 与 chunkName 相同。
   * 在 css chunk 场景下，需要删除 .css 的原文件，输出 .wxss 文件，因此对于 js 和 css chunk，newChunkName 均取 `${outputDir}/${file.fileName}`，
   * 删除的旧键值对应均为 bundle[chunkName]。
   */
  generateBundle(_options: OutputOptions, bundle: OutputBundle): void;
  /**
   * 在写入文件后，对公共 wxss chunk 进行处理，为子包页面的入口 wxss 代码中添加对公共 wxss chunk 的引用路径
   */
  writeBundle(options: OutputOptions, bundle: OutputBundle): void;
};
