import { spawnSync } from 'node:child_process';

if (process.env.HUSKY === '0') {
  process.exit(0);
}

const result = spawnSync('husky', { stdio: 'inherit' });

process.exit(result.status ?? 0);
