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
export declare class TempFileManager {
    private tmpAppConfigPath;
    private appConfigPath;
    constructor(appConfigPath: string);
    createTmpAppConfig(): void;
    removeTmpAppConfig(): void;
    getAppConfig(): Promise<any>;
}
