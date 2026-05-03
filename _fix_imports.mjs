// Fix backslash imports in @/ paths
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

const SRC = resolve('src');

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules') continue;
      files.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(SRC);
let changed = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  const original = content;

  // Fix @/xxx\yyy\zzz → @/xxx/yyy/zzz
  content = content.replace(
    /from\s+'(@\/[^']+)'/g,
    (match, path) => {
      const fixed = path.replace(/\\/g, '/');
      return `from '${fixed}'`;
    }
  );

  if (content !== original) {
    writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file.replace(resolve('.') + '\\', ''));
    changed++;
  }
}

console.log(`\nDone. Fixed ${changed} files.`);
