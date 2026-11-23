const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.join(projectRoot, 'dist');

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });
fs.cpSync(path.join(projectRoot, 'frontend'), outputDirectory, { recursive: true });
fs.cpSync(path.join(projectRoot, 'admin'), path.join(outputDirectory, 'admin'), { recursive: true });

console.log('Vercel static site built in dist/.');
