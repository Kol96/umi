#!/usr/bin/env node

const resolveCwd = require('resolve-cwd');

// 如果执行命令目录下有umi就使用那个版本的umi
const localCLI = resolveCwd.silent('umi/bin/umi');
if (
  process.argv[2] !== 'ui' &&
  !process.env.USE_GLOBAL_UMI &&
  localCLI &&
  localCLI !== __filename
) {
  const debug = require('debug')('umi');
  debug('Using local install of umi');
  require(localCLI);
} else {
  require('../lib/cli');
}
