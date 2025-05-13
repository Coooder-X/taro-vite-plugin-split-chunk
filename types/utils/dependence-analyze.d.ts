import { AppConfig } from '@tarojs/taro';
import { ChunkName, ModuleId, PageId, PageRoot } from '../types';
import { SubPackageInfo } from './parse-subpackage';
export interface ChunksInfo {
    subChunkMap: Map<ModuleId, ChunkName>;
    pageIdMap: Map<PageRoot, PageId>;
    idPageMap: Map<PageId, PageRoot>;
    chunkPageMap: Map<ChunkName, PageRoot[]>;
    subPackagesInfoList: SubPackageInfo[];
}
export declare function analyzeDep(idImportedMap: Map<ModuleId, ModuleId[]>, appConfig: AppConfig): ChunksInfo;
