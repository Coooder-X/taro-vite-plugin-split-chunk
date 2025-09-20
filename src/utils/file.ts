import * as path from 'path';
import { FilePath } from '../types';

export function getFileNameWithoutExt<T = string>(fileName: FilePath): T {
  const jsMapExt = '.js.map';
  if (fileName.includes(jsMapExt)) {
    return fileName.split(jsMapExt)[0] as T;
  }
  return path.basename(fileName, path.extname(fileName)) as T;
}

/**
 * 将路径标准化为统一的正斜杠格式（用于配置和比较）
 * @param path 需要标准化的路径
 * @returns 使用正斜杠的标准化路径
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * 检查文件路径是否包含指定的配置路径
 * @param filePath 文件系统路径
 * @param configPath 配置路径（正斜杠格式）
 * @returns 是否包含
 */
export function pathIncludes(filePath: string, configPath: string): boolean {
  const normalizedFilePath = normalizePath(filePath);
  const normalizedConfigPath = normalizePath(configPath);
  return normalizedFilePath.includes(normalizedConfigPath);
}