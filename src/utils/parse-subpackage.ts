import { AppConfig } from '@tarojs/taro';

export interface PageInfo {
  root: string;
  page: string;
}

export interface SubPackageInfo {
  root: string;
  pages: string[];
}

export function parseSubpackage(appConfig: AppConfig) {
  const subPackages = appConfig.subPackages || appConfig.subpackages || [];
  // TODO: 优化,root可能只有pages
  const subPackagesInfoList = subPackages.map(
    (sub) =>
      ({
        root: sub.root,
        pages: sub.pages.map((item) => `${sub.root}/${item}`),
      }) satisfies SubPackageInfo,
  );

  const mainPageInfoList =
    appConfig.pages?.map((item) => ({
      page: item,
      root: item.split('/').slice(0, -1).join('/'),
    })) || [];

  const pageInfoList: PageInfo[] = [...mainPageInfoList];

  subPackagesInfoList.forEach((item) => {
    pageInfoList.push(...item.pages.map((page) => ({ page, root: page.split('/').slice(0, -1).join('/') })));
  });

  const pageRootList: string[] = [
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
