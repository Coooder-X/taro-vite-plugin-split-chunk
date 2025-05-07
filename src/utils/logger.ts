import { blue, red, bold, green, yellow } from 'colorette';

const tag = 'ViteSplitChunkPlugin';

export const logger = {
  info: (msg: string, key: string) => {
    console.log(bold(blue(`[info] [${tag}.${key}]`)), bold(msg));
  },

  success: (msg: string, key: string) => {
    console.log(bold(green(`[success] [${tag}.${key}]`)), bold(msg));
  },

  error: (msg: string, key: string) => {
    console.log(bold(red(`[error] [${tag}.${key}]`)), bold(msg));
  },

  warning: (msg: string, key: string) => {
    console.log(bold(yellow(`[warning] [${tag}.${key}]`)), bold(msg));
  },
};

export const inspectOptions = {
  depth: null,
  colors: true,
  compact: false,
};
