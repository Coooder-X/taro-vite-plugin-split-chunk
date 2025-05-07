import * as path from 'path';
import { SubPackageInfo } from './parse-subpackage';

/**
 * 判断一个文件是不是子包中的公共模块 chunk
 * @param chunkPageMap 一个映射，其中 key 是块名称，value 是依赖于块的页面名称数组
 * @param subPackagesInfoList 包含所有子包信息的数组
 * @param fileName 需要被判断的文件
 * @returns 当前文件是否是子包中的公共模块
 */
export function isSubpackageChunkFile(
  chunkPageMap: Map<string, string[]>,
  subPackagesInfoList: SubPackageInfo[],
  fileName: string,
) {
  const chunkNameList = [...chunkPageMap.keys()];

  return chunkNameList.some((chunkName) => {
    const isChunkFile = fileName.includes(chunkName);
    const isSubPackageChunk = subPackagesInfoList.some((sub) => chunkPageMap.get(chunkName)?.includes(sub.root));
    return isChunkFile && isSubPackageChunk;
  });
}

export function isSubPackageEntry(fileName: string, subPackagesInfoList: SubPackageInfo[]) {
  const targetName = path.basename(fileName, path.extname(fileName));
  return subPackagesInfoList.some((subPackageInfo) => subPackageInfo.pages.some((page) => page.includes(targetName)));
}

/**
 * 用于获取一个分包页面中，所有 js 入口文件的路径。
 * @param pageList 页面根目录数组，如 [ 'pages/cat' ]
 * @param subPackagesInfoList 数组中的元素形如：
    {
      root: 'pages/dog',
      pages: ['index', 'beagle', 'snoopy/snoopy'],
    }
 * @returns 返回一个 map，key 是页面根目录，value 是该页面下所有 js 入口文件路径构成的数组，如 
    [
      'pages/dog/index',
      'pages/dog/biggle',
      'pages/dog/snoopy/snoopy'
    ]
 */
export function getSubPackageEntryFileNameMap(pageList: string[], subPackagesInfoList: SubPackageInfo[]) {
  const pageRootEntryMap = new Map<string, string[]>();
  subPackagesInfoList.forEach((subPackagesInfo) => {
    subPackagesInfo.pages.forEach((pageEntryPath) => {
      pageList.forEach((pageRootPath) => {
        if (!pageEntryPath.includes(pageRootPath)) return;
        const entryName = pageEntryPath;
        if (!entryName) return;
        const value = pageRootEntryMap.get(pageRootPath) || [];
        pageRootEntryMap.set(pageRootPath, [...value, entryName]);
      });
    });
  });
  return pageRootEntryMap;
}

/**
 * 分包后，页面子包公共模块位于页面根目录下。页面目录下的所有 js 文件需要更新对该公共模块引用的相对路径，该路径由此函数计算
 * @param idPageMap pageId 到页面根目录的映射，如 page1 => 'pages/cat'
 * @param chunkName 子包公共模块的文件名，和 pageId 同名，如 page1（不带文件拓展名，此处只可能为 js 文件）
 * @param filePath 需要导入子包公共模块的文件的绝对路径
 * @returns 返回 filePath 对应文件导入子包页面公共模块时，require 语句中需要的相对路径
 */
export function getRelativeImportPath(idPageMap: Map<string, string>, chunkName: string, filePath: string | null) {
  if (!filePath) return;
  const pageName = idPageMap.get(chunkName);
  if (!pageName) return;
  const chunkPathInPageRoot = filePath.split(pageName)[1];
  if (!chunkPathInPageRoot) return;
  const relativeImportPath = `${getRelativeLevelPath(chunkPathInPageRoot)}${chunkName}.js`;
  return relativeImportPath;
}

/**
 * 分包后，页面子包公共样式文件位于页面根目录下。页面目录下的所有 wxss 文件需要更新对该公共样式文件引用的相对路径，该路径由此函数计算
 * @param pageRoot 当前页面根目录
 * @param entryWxssPath 当前页面中需要导入公共样式的 wxss 文件路径
 * @param wxssChunkName 公共样式文件名（包含 .wxss 拓展名）
 * @returns 返回 entryWxssPath 对应文件导入子包公共样式文件时，@import 语句中需要的相对路径
 */
export function getRelativeImportWxssPath(pageRoot: string, entryWxssPath: string, wxssChunkName: string) {
  const chunkPathInPageRoot = entryWxssPath.split(pageRoot)[1];
  if (!chunkPathInPageRoot) return;
  const relativeImportWxssPath = `${getRelativeLevelPath(chunkPathInPageRoot)}${wxssChunkName}`;
  return relativeImportWxssPath;
}

/**
 * 计算相对路径前缀
 * @param chunkPathInPageRoot 一个文件相对于其所在页面根目录的路径。若 chunkPathInPageRoot == index.js，则表示该文件位于页面根目录下，相对前缀路径为 ./；同理 /cat/index.js 位于根目录下的 cat 目录下
 * @returns 一个文件要引用一个位于其所在页面根目录中的文件时，引用语句的相对路径前缀。如 ./ 或 ../ 或 ../../ 等
 */
export function getRelativeLevelPath(chunkPathInPageRoot: string) {
  const levelList = chunkPathInPageRoot.split('/').filter(Boolean);
  if (levelList.length === 0 || levelList.length === 1) return './';
  return '../'.repeat(levelList.length - 1);
}
