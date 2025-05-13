import { AppConfig } from '@tarojs/taro';
import { SubPackageInfo } from './parse-subpackage';
import { ChunkName, ModuleId, PageId, PageRoot } from '../types';
export interface ChunksInfo {
    subChunkMap: Map<ModuleId, ChunkName>;
    pageIdMap: Map<PageRoot, PageId>;
    idPageMap: Map<PageId, PageRoot>;
    chunkPageMap: Map<ChunkName, PageRoot[]>;
    subPackagesInfoList: SubPackageInfo[];
}
export declare function analyzeDep(idImportedMap: Map<ModuleId, ModuleId[]>, appConfig: AppConfig): ChunksInfo;
