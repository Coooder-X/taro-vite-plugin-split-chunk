import { AppConfig } from '@tarojs/taro';
import { PageEntryPath, PageRoot } from '../types';
export interface PageInfo {
    root: PageRoot;
    page: PageEntryPath;
}
export interface SubPackageInfo {
    root: PageRoot;
    pages: PageEntryPath[];
}
export declare function parseSubpackage(appConfig: AppConfig): {
    pageInfoList: PageInfo[];
    pageRootList: PageRoot[];
    subPackagesInfoList: {
        root: PageRoot;
        pages: PageEntryPath[];
    }[];
    mainPageInfoList: PageInfo[];
};
