const fs = require('fs');
const path = require('path');

const srcSvg = path.join(__dirname, '..', 'nodes', 'repliz.svg');
const nodesDir = path.join(__dirname, '..', 'nodes');
const nodesDirs = fs.readdirSync(nodesDir).filter(f => {
  const full = path.join(nodesDir, f);
  return fs.statSync(full).isDirectory();
});

for (const dir of nodesDirs) {
  const destDir = path.join(__dirname, '..', 'dist', 'nodes', dir);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(srcSvg, path.join(destDir, 'repliz.svg'));
  console.log(`Copied repliz.svg → dist/nodes/${dir}/repliz.svg`);
}
