// Tool: strip-jsx-comments.js
// Purpose: Find all .jsx files under src and remove all comments (single-line, block, and JSX comments)
// This script creates a .bak backup for each file before writing the comment-stripped output.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob';
import { parse } from '@babel/parser';
import generate from '@babel/generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');

  // Parse with babel parser (enable jsx and common syntax plugins)
  const ast = parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'classProperties',
      'objectRestSpread',
      'optionalChaining',
      'nullishCoalescingOperator',
      'decorators-legacy',
    ],
    attachComments: false,
  });

  // Generate code without comments
  const output = generate(ast, { comments: false, retainLines: true }, code).code;

  // Backup original
  const backupPath = `${filePath}.bak`;
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, code, 'utf8');
  }

  fs.writeFileSync(filePath, output, 'utf8');
  console.log(`Stripped comments: ${filePath}`);
}

function run() {
  const root = path.resolve(__dirname, '..');
  const pattern = path.join(root, 'src', '**', '*.jsx');
  const files = glob.sync(pattern, { nodir: true });

  if (files.length === 0) {
    console.log('No .jsx files found under src');
    return;
  }

  for (const file of files) {
    try {
      processFile(file);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
}

run();

