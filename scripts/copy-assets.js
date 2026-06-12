const fs = require('fs');
const path = require('path');

const srcSvg = path.join(__dirname, '..', 'nodes', 'repliz.svg');
const nodesDirs = [
  'ReplizAccount',
  'ReplizAccountFacebook',
  'ReplizAccountInstagram',
  'ReplizAccountThreads',
  'ReplizAccountYoutube',
  'ReplizAccountLinkedIn',
  'ReplizAccountTikTok',
  'ReplizAccountShopee',
  'ReplizComment',
  'ReplizChat',
  'ReplizContent',
  'ReplizSchedule',
  'ReplizAddon',
];

for (const dir of nodesDirs) {
  const destDir = path.join(__dirname, '..', 'dist', 'nodes', dir);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(srcSvg, path.join(destDir, 'repliz.svg'));
  console.log(`Copied repliz.svg → dist/nodes/${dir}/repliz.svg`);
}
