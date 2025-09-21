import { AppConfig } from '@tarojs/taro';
import * as fs from 'fs';
import * as path from 'path';
import { inspect } from 'util';
import {
  GetManualChunk,
  InputOptions,
  ManualChunkMeta,
  ModuleInfo,
  OutputBundle,
  OutputOptions,
  RenderedChunk,
} from 'rollup';
import { ChunkName, FilePath, ModuleId } from './types';
import {
  getSubPackageRootFromFileName,
  getRelativeImportPath,
  getRelativeImportWxssPath,
  getSubPackageEntryFileNameMap,
  isSubpackageChunkFile,
  isSubPackagePageEntry,
} from './utils/chunks';
import { analyzeDep, ChunksInfo } from './utils/dependence-analyze';
import { getFileNameWithoutExt } from './utils/file';
import { logger, inspectOptions } from './utils/logger';
import { TempFileManager } from './utils/temp-file-manager';

export interface ViteSplitChunkPluginProps {
  appConfigPath: string;
  isDebug?: boolean;
}

export default function viteSplitChunkPlugin(props: ViteSplitChunkPluginProps) {
  let chunkContext: ChunksInfo = {} as any;
  let appConfig: AppConfig | null = null;
  let originManualChunks: GetManualChunk | null = null;
  const idImportedMap: Map<ModuleId, ModuleId[]> = new Map();
  let tempFileManager: TempFileManager | null = null;
  const { appConfigPath, isDebug = false } = props;

  return {
    name: 'vite-plugin-split-chunk',

    buildStart() {
      idImportedMap.clear();
    },

    async options(options: InputOptions) {
      tempFileManager = new TempFileManager(appConfigPath, isDebug);
      const appConfigFileName = path.basename(appConfigPath);
      try {
        tempFileManager?.createTmpAppConfig();
        appConfig = await tempFileManager?.getAppConfig();
        if (!appConfig) {
          logger.error(`加载 ${appConfigFileName} 失败`, 'options');
          return options;
        }
        logger.success(`读取 ${appConfigFileName} 成功`, 'options');
      } catch (error) {
        logger.error(`加载 ${appConfigFileName} 失败: ${inspect(error, inspectOptions)}`, 'options');
      }

      return {
        ...options,
      };
    },

    /** 收集每个模块的依赖关系 */
    moduleParsed(moduleInfo: ModuleInfo) {
      const { id, importedIds } = moduleInfo;
      idImportedMap.set(id as ModuleId, [...importedIds as ModuleId[]]);
    },

    /** build 结束后，依赖收集完成，可以根据依赖图做依赖分析 */
    buildEnd() {
      if (!appConfig) {
        logger.error('appConfig 不存在', 'buildEnd');
        return;
      }
      chunkContext = analyzeDep(idImportedMap, appConfig, isDebug);
      tempFileManager?.removeTmpAppConfig();
    },

    outputOptions(outputOptions: OutputOptions) {
      if (!chunkContext) {
        logger.error('依赖分析失败', 'outputOptions');
        return outputOptions;
      }
      const { subChunkMap = new Map<ModuleId, ChunkName>() } = chunkContext;

      if (!originManualChunks) {
        originManualChunks = outputOptions.manualChunks as GetManualChunk;
      }

      const getManualChunkAlias = (moduleId: ModuleId, manualChunksApi: ManualChunkMeta) => {
        const chunk = subChunkMap.get(moduleId);
        if (!chunk) return originManualChunks!(moduleId, manualChunksApi);
        return chunk;
      };

      // 生成 .js.map 文件，保证dev下断点调试
      const useSourceMap = process.env.NODE_ENV === 'development' ? true : false;

      const newOutputOptions = {
        ...outputOptions,
        sourcemap: useSourceMap,
        manualChunks: getManualChunkAlias,
      };

      return newOutputOptions;
    },

    renderChunk(code: string, chunk: RenderedChunk) {
      const fileName = chunk.fileName as FilePath;
      const { chunkPageMap, subPackagesInfoList } = chunkContext;
      const chunkNameList = [...chunkPageMap.keys()];
      // 修改仅被子包依赖的 chunk 代码中对主包公共代码的引用路径
      if (isSubpackageChunkFile(chunkPageMap, subPackagesInfoList, fileName)) {
        // taro 的 commonChunks 中可配置公共文件名，但只适用于 webpack 场景。因此在 vite 场景下，写死公共文件名称，只能是 taro、common、vendors
        const newCode = code
          .replaceAll("require('./taro.js')", "require('../../taro.js')")
          .replaceAll("require('./common.js')", "require('../../common.js')")
          .replaceAll("require('./vendors.js')", "require('../../vendors.js')")
          .replaceAll("require(\"./taro.js\")", "require('../../taro.js')")
          .replaceAll("require(\"./common.js\")", "require('../../common.js')")
          .replaceAll("require(\"./vendors.js\")", "require('../../vendors.js')");

        if (code === newCode) return { code, map: null };

        isDebug && logger.success(`更新 chunk: ${fileName} 的依赖引用路径成功`, 'renderChunk');
        return { code: newCode, map: null };
      }

      // 修改所有依赖了子包 chunk 的 js 文件代码中对 chunk 的引用路径(若未被配置为子包，则打出的 chunk 放在主包中，引用路径不修改)
      if (isSubPackagePageEntry(fileName, subPackagesInfoList)) {
        const newCode = chunkNameList.reduce((accCode, chunkName) => {
          const subPackageRoot = getSubPackageRootFromFileName(fileName, subPackagesInfoList);
          if (!subPackageRoot) return accCode;
          const relativeImportPath = getRelativeImportPath(subPackageRoot, chunkName, chunk.facadeModuleId as FilePath | null);
          if (!relativeImportPath) return accCode;

          if (
            !accCode.includes(chunkName) ||
            !isSubpackageChunkFile(chunkPageMap, subPackagesInfoList, chunkName)
          ) {
            return accCode;
          }
          // 若子包目录中嵌套多个页面，则对子包根目录中的子包 chunk 的引用路径进行替换时，需要匹配上 (../) * n 的相对路径前缀
          const requireRegex = new RegExp(`require\\(('|")(\\.\\./)+${chunkName}\\.js\\1\\)`, 'g');
          return accCode.replaceAll(requireRegex, `require('${relativeImportPath}')`);
        }, code);

        return {
          code: newCode,
          map: null,
        };
      }
      return {
        code,
        map: null,
      };
    },

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
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      isDebug && logger.success('generateBundle hook 执行完成', 'generateBundle');
      const { chunkPageMap, subPackagesInfoList } = chunkContext;

      for (const [chunkFilePath, file] of Object.entries(bundle)) {
        const chunkPath = chunkFilePath as FilePath;
        const chunkName = getFileNameWithoutExt<ChunkName>(chunkPath);
        // 如果文件是一个 chunk，且仅被子包依赖，则应当输出到子包的 pages 中
        if (!isSubpackageChunkFile(chunkPageMap, subPackagesInfoList, chunkPath)) continue;

        const outputPages = chunkPageMap.get(chunkName)!;
        if (!outputPages) return;

        for (const outputDir of outputPages) {
          const newChunkPath = `${outputDir}/${file.fileName}`;
          isDebug && logger.info(`将原 chunk ${chunkPath} 输出到 ${newChunkPath}`, 'generateBundle');

          bundle[newChunkPath] = {
            ...file,
            fileName: newChunkPath,
          };
          delete bundle[chunkPath];
        }
      }
    },

    /**
     * 在写入文件后，对公共 wxss chunk 进行处理，为子包页面的入口 wxss 代码中添加对公共 wxss chunk 的引用路径
     */
    writeBundle(options: OutputOptions, bundle: OutputBundle) {
      const distPath = options.dir;
      const { chunkPageMap, subPackagesInfoList } = chunkContext;

      for (const [, file] of Object.entries(bundle)) {
        const fileName = path.basename(file.fileName) as FilePath;
        const isWxssChunk =
          file.type === 'asset' &&
          path.extname(fileName) === '.wxss' &&
          isSubpackageChunkFile(chunkPageMap, subPackagesInfoList, fileName);
        if (!isWxssChunk) continue;

        const chunkName = getFileNameWithoutExt<ChunkName>(fileName);
        const pageList = chunkPageMap.get(chunkName);
        if (!pageList) continue;

        const subPackageEntryFileNameMap = getSubPackageEntryFileNameMap(pageList, subPackagesInfoList);

        pageList.forEach((pageName) => {
          // 遍历当前子包目录中，所有页面的入口 wxss 文件，为它们添加对公共样式的引用
          const entryFileList = subPackageEntryFileNameMap.get(pageName) || [];
          entryFileList.forEach((entryName) => {
            // 需要引用公共样式文件的 wxss 文件的路径
            const pageWxssPath = `${distPath}/${entryName}.wxss` as FilePath;
            const relativeImportWxssPath = getRelativeImportWxssPath(pageName, pageWxssPath, fileName);
            if (!relativeImportWxssPath) return;

            try {
              const importCode = `@import "${relativeImportWxssPath}";\n`;
              const pageWxssCode = fs.existsSync(pageWxssPath) ? fs.readFileSync(pageWxssPath, 'utf8') : '';
              // 第一次 build 后，引用语句已经存在，后续热更新不重复添加
              if (pageWxssCode.includes(importCode)) return;
              fs.writeFileSync(pageWxssPath, `${importCode}${pageWxssCode}`, 'utf8');
              isDebug && logger.success(`将 ${fileName} 链接到 ${entryName}.wxss`, 'writeBundle');
            } catch (error) {
              logger.error(`将 ${fileName} 链接到 ${entryName}.wxss 时失败， ${error}`, 'writeBundle');
            }
          });
        });
        delete bundle[fileName];
      }

      logger.success('构建结束', 'writeBundle');
    },
  };
}
