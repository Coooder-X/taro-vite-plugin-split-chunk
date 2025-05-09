import * as path from 'path';

export function getFileNameWithoutExt(fileName: string) {
  return path.basename(fileName, path.extname(fileName));
}