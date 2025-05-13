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
export declare function parseSubpackage(appConfig: AppConfig): {
    pageInfoList: PageInfo[];
    pageRootList: PageRoot[];
    subPackagesInfoList: {
        root: PageRoot;
        pages: pageEntryPath[];
    }[];
    mainPageInfoList: PageInfo[];
};
