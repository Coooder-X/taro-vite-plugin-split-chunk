declare const __brand: unique symbol;
type Brand<B> = {
    [__brand]: B;
};
export type Branded<T, B> = T & Brand<B>;
export type ModuleId = Branded<string, "ModuleId">;
export type ChunkName = Branded<string, "ChunkName">;
export type PageId = Branded<string, "PageId">;
export type PageRoot = Branded<string, "PageRoot">;
export type pageEntryPath = Branded<string, "pageEntryPath">;
export type FilePath = Branded<string, "FilePath">;
export {};
