import { AppConfig } from '@tarojs/taro';
import { inspect } from 'util';
import { cloneDeep } from 'lodash';
import { inspectOptions, logger } from './logger';
import { PageInfo, parseSubpackage, SubPackageInfo } from './parse-subpackage';

export interface ChunksInfo {
  subChunkMap: Map<string, string>;
  pageIdMap: Map<string, string>;
  idPageMap: Map<string, string>;
  chunkPageMap: Map<string, string[]>;
  subPackagesInfoList: SubPackageInfo[];
}

class DependencyAnalyzer {
  // 存储页面的文件夹名称（子包名）到页面id的映射 Map<pageid: string, id: string>
  private pageIdMap = new Map<string, string>();
  private idPageMap = new Map<string, string>();
  // 存储一个文件被页面依赖的情况 key：moduleId, value：{importers：该模块被哪些模块依赖, pageImporters：该模块被哪些页面依赖}>
  private depMap = new Map<string, { importers: Set<string>; pageImporters: Set<string> }>();
  // 存储文件到 chunk 的映射 key：moduleId，value：chunkName，如 'page1_page2'、'page3'
  private subChunkMap = new Map<string, string>();
  // 存储 chunk 到页面的映射 key：chunkName，value：pageNames，如：'page2' => [ 'pages/dog' ],
  private chunkPageMap = new Map<string, string[]>();
  // 存储所有页面模块的 moduleId
  private pageModuleIds: string[];
  // 存储一个 module 依赖其他 module 的情况。key：moduleId，value：该 module 依赖的其他 module 的 id
  private idImportedMap: Map<string, string[]> = new Map();
  // 所有页面信息数组
  private pageInfoList: PageInfo[];
  // 主包中包含的页面信息
  private mainPageInfoList: PageInfo[];
  // 子包中包含的页面信息
  private subPackagesInfoList: SubPackageInfo[];
  // 主包以及子包的根目录路径（当一个子包目录中包含多个页面时，subPackagesInfoList 的 root 中会包含重复的处于一个目录中的不同页面，导致分出多余的页面）
  private pageRootList: string[];

  constructor(idImportedMap: Map<string, string[]>, appConfig: AppConfig) {
    const { pageInfoList, subPackagesInfoList, mainPageInfoList, pageRootList } = parseSubpackage(appConfig);
    this.pageInfoList = pageInfoList;
    this.pageRootList = pageRootList;
    this.subPackagesInfoList = subPackagesInfoList;
    this.mainPageInfoList = mainPageInfoList;
    this.idImportedMap = idImportedMap;
    const totalModuleIds = [...idImportedMap.keys()];
    this.pageModuleIds = totalModuleIds.filter((id) => this.isPageIndexModule(id));
  }

  public analyze(): ChunksInfo {
    this.clear();

    if (this.subPackagesInfoList.length) {
      logger.info('当前小程序已开启分包配置', 'analyzeDep');
    }

    this.main();

    return {
      subChunkMap: this.subChunkMap,
      pageIdMap: this.pageIdMap,
      idPageMap: this.idPageMap,
      chunkPageMap: this.chunkPageMap,
      subPackagesInfoList: this.subPackagesInfoList,
    };
  }

  private isPageIndexModule(moduleId: string) {
    return this.pageInfoList.some((pageInfo) => moduleId.includes(pageInfo.page));
  }

  private isFirstPageModule(moduleId: string) {
    return this.mainPageInfoList.some((pageInfo) => moduleId.includes(pageInfo.page));
  }

  private unionSet<T = string>(set1: Set<T>, set2: Set<T>) {
    return new Set([...cloneDeep(set1), ...cloneDeep(set2)]);
  }

  /**
   * 计算一个文件的依赖者和依赖它的页面
   */
  private dfs(pageModuleId: string, fatherModuleId: string, curModuleId: string) {
    if (!this.depMap.has(curModuleId)) {
      this.depMap.set(curModuleId, {
        importers: new Set<string>(),
        pageImporters: new Set<string>(),
      });
    }
    const depInfo = this.depMap.get(curModuleId)!;
    if (depInfo.pageImporters.has(pageModuleId)) return;

    depInfo.pageImporters.add(pageModuleId);
    const fatherDepInfo = this.depMap.get(fatherModuleId);
    const { importers: fatherImporters = new Set<string>() } = fatherDepInfo || {};
    depInfo.importers = this.unionSet<string>(depInfo.importers, fatherImporters);

    for (const id of this.idImportedMap.get(curModuleId) || []) {
      this.dfs(pageModuleId, curModuleId, id);
    }
  }

  private getPageNameById(moduleId: string) {
    for (const pageRoot of this.pageRootList) {
      // TODO: 优化,root可能只有pages
      if (moduleId.includes(pageRoot)) return pageRoot;
    }
    return null;
  }

  private getPagesNameMap() {
    const pageNames = this.pageRootList.map((item) => item).sort((a, b) => a.localeCompare(b));
    pageNames.forEach((item, index) => {
      this.pageIdMap.set(item, `page${index + 1}`);
      this.idPageMap.set(`page${index + 1}`, item);
    });
    logger.info(`pageIdMap: ${inspect(this.pageIdMap, inspectOptions)}`, 'analyzeDep.getPagesNameMap');
  }

  private getSubChunkMap() {
    for (const [moduleId, { pageImporters }] of this.depMap) {
      let pages: string[] = [];
      for (const importerId of pageImporters) {
        const pageName = this.getPageNameById(importerId);
        if (!pageName) continue;
        pages.push(pageName);
      }
      // 有可能这个module是node modules 中的依赖，或者是app.ts等，不被page引用
      if (!pages.length) continue;
      // 被首页引用的不参与打入子包的逻辑
      if (pages.includes('index')) continue;
      pages = [...new Set(pages)].sort();
      const chunkName = pages.map((item) => this.pageIdMap.get(item)).join('_');
      this.chunkPageMap.set(chunkName, pages);
      this.subChunkMap.set(moduleId, chunkName);
    }
    logger.info(
      `module 的打包去向：subChunkMap: ${inspect(this.subChunkMap, inspectOptions)}`,
      'analyzeDep.getSubChunkMap',
    );
  }

  private showDep() {
    let cnt = 0;
    for (const [, { pageImporters }] of this.depMap) {
      const pageImporterList = [...pageImporters];
      if (pageImporterList.length && pageImporterList.every((item) => !this.isFirstPageModule(item))) {
        cnt += 1;
      }
    }
    logger.info(`app 下 module 数量: ${this.depMap.size}`, 'analyzeDep.showDep');
    logger.info(`可打入子包 chunk 的 module 数量: ${cnt}`, 'analyzeDep.showDep');
  }

  private main() {
    for (const moduleId of this.pageModuleIds) {
      for (const id of this.idImportedMap.get(moduleId) || []) {
        this.dfs(moduleId, moduleId, id);
      }
    }

    for (const [moduleId, { pageImporters }] of this.depMap) {
      if ([...pageImporters].some((id) => this.isFirstPageModule(id))) {
        this.depMap.delete(moduleId);
      }
    }

    this.showDep();
    this.getPagesNameMap();
    this.getSubChunkMap();
  }

  private clear() {
    this.pageIdMap.clear();
    this.idPageMap.clear();
    this.depMap.clear();
    this.subChunkMap.clear();
    this.chunkPageMap.clear();
  }
}

export function analyzeDep(idImportedMap: Map<string, string[]>, appConfig: AppConfig): ChunksInfo {
  const analyzer = new DependencyAnalyzer(idImportedMap, appConfig);
  return analyzer.analyze();
}
