import { AppConfig } from '@tarojs/taro';
import { PageEntryPath, PageRoot } from '../types';
import { normalizePath } from './file';

export interface PageInfo {
  root: PageRoot;
  page: PageEntryPath;
}

export interface SubPackageInfo {
  root: PageRoot;
  pages: PageEntryPath[];
}

export function parseSubpackage(appConfig: AppConfig) {
  const subPackages = appConfig.subPackages || appConfig.subpackages || [];
  // TODO: 优化,root可能只有pages
  const subPackagesInfoList = subPackages.map(
    (sub) =>
      ({
        root: sub.root as PageRoot,
        // 保持正斜杠格式，符合小程序规范
        pages: sub.pages.map((item) => `${sub.root}/${item}` as PageEntryPath),
      }) satisfies SubPackageInfo,
  );

  const mainPageInfoList: PageInfo[] =
    appConfig.pages?.map((page: PageEntryPath) => ({
      page,
      root: getFatherRoot(page),
    })) || [];

  const pageInfoList: PageInfo[] = [...mainPageInfoList];

  subPackagesInfoList.forEach((item) => {
    pageInfoList.push(...item.pages.map((page) => ({ page, root: getFatherRoot(page) })));
  });

  const pageRootList: PageRoot[] = [
    ...mainPageInfoList.map((item) => item.root),
    ...subPackagesInfoList.map((item) => item.root),
  ];

  return {
    pageInfoList,
    pageRootList,
    subPackagesInfoList,
    mainPageInfoList,
  };
}

function getFatherRoot(page: PageEntryPath): PageRoot {
  // 使用标准化路径进行分割，但结果仍保持正斜杠格式
  const normalizedPage = normalizePath(page);
  return normalizedPage.split('/').slice(0, -1).join('/') as PageRoot;
}