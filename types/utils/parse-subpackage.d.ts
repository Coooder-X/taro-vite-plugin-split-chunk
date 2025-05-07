import { AppConfig } from '@tarojs/taro';
export interface PageInfo {
  root: string;
  page: string;
}
export interface SubPackageInfo {
  root: string;
  pages: string[];
}
export declare function parseSubpackage(appConfig: AppConfig): {
  pageInfoList: PageInfo[];
  pageRootList: string[];
  subPackagesInfoList: {
    root: string;
    pages: string[];
  }[];
  mainPageInfoList: {
    page: string;
    root: string;
  }[];
};
