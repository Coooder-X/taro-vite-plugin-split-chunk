export default function viteSplitChunkPlugin(appConfig: any): {
  name: string;
  build(): Promise<void>;
  options(options: any): Promise<any>;
  outputOptions(outputOptions: any): any;
  renderChunk(code: any, chunk: any): any;
  generateBundle(options: any, bundle: any): void;
};
