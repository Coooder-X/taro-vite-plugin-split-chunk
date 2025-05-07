import { AppConfig } from '@tarojs/taro';
import { SubPackageInfo } from './parse-subpackage';
export interface ChunksInfo {
  subChunkMap: Map<string, string>;
  pageIdMap: Map<string, string>;
  idPageMap: Map<string, string>;
  chunkPageMap: Map<string, string[]>;
  subPackagesInfoList: SubPackageInfo[];
}
export declare function analyzeDep(idImportedMap: Map<string, string[]>, appConfig: AppConfig): ChunksInfo;
