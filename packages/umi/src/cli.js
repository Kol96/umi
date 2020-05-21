import { dirname } from 'path';
import yParser from 'yargs-parser';
import signale from 'signale';
import semver from 'semver';
import buildDevOpts from './buildDevOpts';

// 获取umi命令
const script = process.argv[2];
const args = yParser(process.argv.slice(3));

// Node version check
const nodeVersion = process.versions.node;
if (semver.satisfies(nodeVersion, '<6.5')) {
  signale.error(`Node version must >= 6.5, but got ${nodeVersion}`);
  process.exit(1);
}

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('../package.json');
updater({ pkg }).notify({ defer: true });

process.env.UMI_DIR = dirname(require.resolve('../package'));
process.env.UMI_VERSION = pkg.version;

const aliasMap = {
  '-v': 'version',
  '--version': 'version',
  '-h': 'help',
  '--help': 'help',
};

switch (script) {
  case 'build':
  case 'dev': // development模式
  case 'test':
  case 'inspect':
  case 'ui':
    // eslint-disable-next-line import/no-dynamic-require
    require(`./scripts/${script}`);
    break;
  default: {
    // 查版本和命令
    const Service = require('umi-build-dev/lib/Service').default;
    new Service(buildDevOpts(args)).run(aliasMap[script] || script, args);
    break;
  }
}
