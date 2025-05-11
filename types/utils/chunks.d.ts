import { SubPackageInfo } from './parse-subpackage';
/**
 * 判断一个文件是不是子包中的公共模块 chunk
 * @param chunkPageMap 一个映射，其中 key 是块名称，value 是依赖于块的页面名称数组
 * @param subPackagesInfoList 包含所有子包信息的数组
 * @param fileName 需要被判断的文件
 * @returns 当前文件是否是子包中的公共模块
 */
export declare function isSubpackageChunkFile(chunkPageMap: Map<string, string[]>, subPackagesInfoList: SubPackageInfo[], fileName: string): boolean;
export declare function isSubPackageEntry(fileName: string, subPackagesInfoList: SubPackageInfo[]): boolean;
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
      'pages/dog/beagle',
      'pages/dog/snoopy/snoopy'
    ]
 */
export declare function getSubPackageEntryFileNameMap(pageList: string[], subPackagesInfoList: SubPackageInfo[]): Map<string, string[]>;
/**
 * 分包后，页面子包公共模块位于页面根目录下。页面目录下的所有 js 文件需要更新对该公共模块引用的相对路径，该路径由此函数计算
 * @param idPageMap pageId 到页面根目录的映射，如 page1 => 'pages/cat'
 * @param chunkName 子包公共模块的文件名，和 pageId 同名，如 page1（不带文件拓展名，此处只可能为 js 文件）
 * @param filePath 需要导入子包公共模块的文件的绝对路径
 * @returns 返回 filePath 对应文件导入子包页面公共模块时，require 语句中需要的相对路径
 */
export declare function getRelativeImportPath(idPageMap: Map<string, string>, chunkName: string, filePath: string | null): string | undefined;
/**
 * 分包后，页面子包公共样式文件位于页面根目录下。页面目录下的所有 wxss 文件需要更新对该公共样式文件引用的相对路径，该路径由此函数计算
 * @param pageRoot 当前页面根目录
 * @param entryWxssPath 当前页面中需要导入公共样式的 wxss 文件路径
 * @param wxssChunkName 公共样式文件名（包含 .wxss 拓展名）
 * @returns 返回 entryWxssPath 对应文件导入子包公共样式文件时，@import 语句中需要的相对路径
 */
export declare function getRelativeImportWxssPath(pageRoot: string, entryWxssPath: string, wxssChunkName: string): string | undefined;
/**
 * 计算相对路径前缀
 * @param chunkPathInPageRoot 一个文件相对于其所在页面根目录的路径。若 chunkPathInPageRoot == index.js，则表示该文件位于页面根目录下，相对前缀路径为 ./；同理 /cat/index.js 位于根目录下的 cat 目录下
 * @returns 一个文件要引用一个位于其所在页面根目录中的文件时，引用语句的相对路径前缀。如 ./ 或 ../ 或 ../../ 等
 */
export declare function getRelativeLevelPath(chunkPathInPageRoot: string): string;
