import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

const colorMap = [
  // Backgrounds
  { from: /bg-zinc-950/g, to: 'bg-white' },
  { from: /bg-zinc-900/g, to: 'bg-zinc-50' },
  { from: /bg-zinc-800/g, to: 'bg-zinc-100' },
  { from: /from-zinc-950/g, to: 'from-white' },
  { from: /to-zinc-950/g, to: 'to-white' },
  
  // Text
  { from: /text-zinc-50/g, to: 'text-zinc-950' },
  { from: /text-zinc-100/g, to: 'text-zinc-900' },
  { from: /text-zinc-200/g, to: 'text-zinc-800' },
  { from: /text-zinc-300/g, to: 'text-zinc-700' },
  { from: /text-zinc-400/g, to: 'text-zinc-600' },
  { from: /text-zinc-500/g, to: 'text-zinc-500' },
  { from: /text-zinc-600/g, to: 'text-zinc-400' },
  
  // Opacity / Borders
  { from: /border-white\/\[0\.08\]/g, to: 'border-zinc-200' },
  { from: /border-white\/\[0\.06\]/g, to: 'border-zinc-100' },
  { from: /border-white\/\[0\.15\]/g, to: 'border-zinc-300' },
  { from: /border-white\/\[0\.1\]/g, to: 'border-zinc-200' },
  { from: /bg-white\/\[0\.03\]/g, to: 'bg-zinc-50' },
  { from: /bg-white\/\[0\.02\]/g, to: 'bg-zinc-50/50' },
  { from: /bg-white\/\[0\.05\]/g, to: 'bg-zinc-100' },
  { from: /bg-white\/\[0\.06\]/g, to: 'bg-zinc-100' },
  
  // Specific Gradient Adjustments
  { from: /via-amber-500\/20/g, to: 'via-amber-500/40' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      if (file === 'index.css') continue; // Skip the main CSS which we already handled
      
      let content = fs.readFileSync(fullPath, 'utf-8');
      let original = content;
      
      for (const { from, to } of colorMap) {
        content = content.replace(from, to);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Conversion complete.');
