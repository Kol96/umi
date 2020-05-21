import { join, isAbsolute } from 'path';
import { existsSync } from 'fs';
import registerBabel from 'af-webpack/registerBabel';
import { winPath } from 'umi-utils';
import { getConfigPaths } from 'umi-core/lib/getUserConfig';
import { uniq } from 'lodash';

let files = [];

function initFiles(cwd) {
  files = uniq(files.concat(getConfigPaths(cwd)));
}

export function addBabelRegisterFiles(extraFiles, { cwd }) {
  initFiles(cwd);
  files = uniq(files.concat(extraFiles));
}

export default function({ cwd }) {
  // 获取umi用户配置文件
  initFiles(cwd);
  const only = files.map(f => {
    const fullPath = isAbsolute(f) ? f : join(cwd, f);
    return winPath(fullPath);
  });

  let absSrcPath = join(cwd, 'src');
  if (!existsSync(absSrcPath)) {
    absSrcPath = cwd;
  }

  // 调用af-webpack的registerBabel 与umi-core的方法类似
  registerBabel({
    // only suport glob
    // ref: https://babeljs.io/docs/en/next/babel-core.html#configitem-type
    only,
    babelPreset: [
      require.resolve('babel-preset-umi'),
      {
        env: { targets: { node: 8 } },
        transformRuntime: false,
      },
    ],
    babelPlugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            '@': absSrcPath,
          },
        },
      ],
    ],
  });
}
