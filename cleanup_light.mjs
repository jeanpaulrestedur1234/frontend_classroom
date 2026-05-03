import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

const cleanupMap = [
  { from: /zinc-9500/g, to: 'zinc-500' },
  { from: /zinc-4000/g, to: 'zinc-400' }, // Just in case
  // Any other artifacts?
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let original = content;
      
      for (const { from, to } of cleanupMap) {
        content = content.replace(from, to);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Cleaned: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Cleanup complete.');
