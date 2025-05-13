import * as path from 'path';
import { FilePath } from '../types';

export function getFileNameWithoutExt<T = string>(fileName: FilePath): T {
  const jsMapExt = '.js.map';
  if (fileName.includes(jsMapExt)) {
    return fileName.split(jsMapExt)[0] as T;
  }
  return path.basename(fileName, path.extname(fileName)) as T;
}