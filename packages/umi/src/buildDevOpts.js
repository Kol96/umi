import { join, isAbsolute } from 'path';
import isWindows from 'is-windows';
import { winPath, loadDotEnv } from 'umi-utils';

export default function(opts = {}) {
  loadEnv(); // 加载环境变量

  // cwd设置方式 命令参数--cwd=xx  环境变量APP_ROOT=xx 默认cwd
  let cwd = opts.cwd || process.env.APP_ROOT || process.cwd();
  if (cwd) {
    if (!isAbsolute(cwd)) {
      cwd = join(process.cwd(), cwd);
    }
    cwd = winPath(cwd);
    // 原因：webpack 的 include 规则得是 \ 才能判断出是绝对路径
    if (isWindows()) {
      cwd = cwd.replace(/\//g, '\\');
    }
  }

  return {
    cwd,
  };
}

function loadEnv() {
  const basePath = join(process.cwd(), '.env');
  const localPath = `${basePath}.local`;
  // 先加载的优先级高
  loadDotEnv(localPath); // .env.local
  loadDotEnv(basePath); // .env
}
