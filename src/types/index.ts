declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };

export type Branded<T, B> = T & Brand<B>;

// rollup 中获取的模块 id
export type ModuleId = Branded<string, "ModuleId">;

// 分包得到的公共模块名，如 page1、page2_page3，与 PageId 相同
export type ChunkName = Branded<string, "ChunkName">;

// 分包后的分包目录 id，如 page1、page2_page3，与 ChunkName 相同
export type PageId = Branded<string, "PageId">;

// 分包后的分包目录路径，如 pages/cat
export type PageRoot = Branded<string, "PageRoot">;

// 页面的入口文件路径，不包含文件后缀名，如 pages/dog/index、pages/dog/beagle/beagle
export type PageEntryPath = Branded<string, "PageEntryPath">;

// 文件路径，包含文件后缀名，如 pages/dog/index.js
export type FilePath = Branded<string, "FilePath">;
