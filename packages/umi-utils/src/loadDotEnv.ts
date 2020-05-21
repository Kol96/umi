import { readFileSync, existsSync } from 'fs';
import { parse } from 'dotenv';

/**
 * dotenv wrapper
 * @param envPath string
 */
export default function loadDotEnv(envPath: string): void {
  if (existsSync(envPath)) {
    const parsed = parse(readFileSync(envPath, 'utf-8')) || {};
    Object.keys(parsed).forEach(key => {
      // eslint-disable-next-line no-prototype-builtins
      if (!process.env.hasOwnProperty(key)) {
        // 已存在的环境变量不会重复赋值
        process.env[key] = parsed[key];
      }
    });
  }
}
