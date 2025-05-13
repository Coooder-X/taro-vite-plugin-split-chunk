import { AppConfig } from '@tarojs/taro';
import { pageEntryPath, PageRoot } from '../types';

export interface PageInfo {
  root: PageRoot;
  page: pageEntryPath;
}

export interface SubPackageInfo {
  root: PageRoot;
  pages: pageEntryPath[];
}

export function parseSubpackage(appConfig: AppConfig) {
  const subPackages = appConfig.subPackages || appConfig.subpackages || [];
  // TODO: 优化,root可能只有pages
  const subPackagesInfoList = subPackages.map(
    (sub) =>
      ({
        root: sub.root as PageRoot,
        pages: sub.pages.map((item) => `${sub.root}/${item}` as pageEntryPath),
      }) satisfies SubPackageInfo,
  );

  const mainPageInfoList: PageInfo[] =
    appConfig.pages?.map((page: pageEntryPath) => ({
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

function getFatherRoot(page: pageEntryPath): PageRoot {
  return page.split('/').slice(0, -1).join('/') as PageRoot;
}