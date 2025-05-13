import * as fs from 'fs';
import * as path from 'path';
import { FilePath } from '../types';
import { getFileNameWithoutExt } from './file';
import { logger } from './logger';

/**
 * 【背景】：
 * Taro 脚手架在生成项目时，app.config.ts 中导出的对象会被 defineAppConfig 函数包裹。
 * defineAppConfig & definePageConfig 是宏函数，它主要用于类型提示和自动补全。 在编译时会提取config部分生成单独的配置文件，它并不是运行时可用的函数。该函数的类型定义在 node_modules/@tarojs/taro/types/index.d.ts
 * 然而，插件在通过 import 获取 app.config.ts 配置时无法理解 defineAppConfig 函数，会报未定义的错误，可见相关 issue：https://github.com/NervJS/taro/issues/11949
 * 【解决方案】：
 * 1、创建一个临时的 tmp-app.config.ts 文件，其配置与原 app.config 相同，区别在于删除了 defineAppConfig 的包裹，使得插件能够正常读取配置。
 * 2、需要读取配置时，从临时的 tmp-app.config.ts 中读取
 * 3、插件运行结束后，删除临时配置文件
 */
export class TempFileManager {
  private tmpAppConfigPath: string;
  private appConfigPath: string;

  public constructor(appConfigPath: string) {
    this.appConfigPath = appConfigPath;
    const fileName = path.basename(appConfigPath) as FilePath;
    const targetName = getFileNameWithoutExt(fileName);
    this.tmpAppConfigPath = path.join(__dirname, fileName.replace(targetName, `tmp-${targetName}`));
  }

  public createTmpAppConfig() {
    if (!this.tmpAppConfigPath) return;

    const appConfigCode = fs.readFileSync(this.appConfigPath, 'utf8');
    const newCode = appConfigCode.replace(/defineAppConfig\((\{[\s\S]*\})\)/, '$1').replace(/definePageConfig\((\{[\s\S]*\})\)/, '$1');
    fs.writeFileSync(this.tmpAppConfigPath, newCode, 'utf8');
    logger.success(`创建临时 app.config 配置文件 ${this.tmpAppConfigPath}`, 'TempFileManager.createTmpAppConfig');
  }

  public removeTmpAppConfig() {
    if (!this.tmpAppConfigPath) return;
    fs.unlinkSync(this.tmpAppConfigPath);
    logger.success('已删除临时 app.config 配置文件', 'TempFileManager.createTmpAppConfig');
  }

  public async getAppConfig() {
    return (await import(this.tmpAppConfigPath)).default;
  }
}