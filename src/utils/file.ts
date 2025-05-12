import * as path from 'path';

export function getFileNameWithoutExt(fileName: string) {
  const jsMapExt = '.js.map';
  if (fileName.includes(jsMapExt)) {
    return fileName.split(jsMapExt)[0];
  }
  return path.basename(fileName, path.extname(fileName));
}