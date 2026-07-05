const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceColorsInFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.js', '.jsx', '.css'].includes(ext)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace MODERN CHAROCA
  content = content.replace(/#111111/gi, '#1A1A1A');
  content = content.replace(/#111\b/gi, '#1A1A1A');
  content = content.replace(/#222222/gi, '#1A1A1A');
  content = content.replace(/#222\b/gi, '#1A1A1A');
  content = content.replace(/#333333/gi, '#1A1A1A');
  content = content.replace(/#333\b/gi, '#1A1A1A');

  // Replace PURE WHITE
  content = content.replace(/#ffffff/gi, '#FFFFFF');
  content = content.replace(/#fff\b/gi, '#FFFFFF');

  // Replace SOFT LIGHT GREY
  content = content.replace(/#fafafa/gi, '#E5E5E5');
  content = content.replace(/#f0f0f0/gi, '#E5E5E5');
  content = content.replace(/#f5f5f5/gi, '#E5E5E5');

  // Replace NEUTRAL MEDIUM GREY
  content = content.replace(/#555555/gi, '#7A7A7A');
  content = content.replace(/#555\b/gi, '#7A7A7A');
  content = content.replace(/#666666/gi, '#7A7A7A');
  content = content.replace(/#666\b/gi, '#7A7A7A');
  content = content.replace(/#888888/gi, '#7A7A7A');
  content = content.replace(/#888\b/gi, '#7A7A7A');
  content = content.replace(/#999999/gi, '#7A7A7A');
  content = content.replace(/#999\b/gi, '#7A7A7A');

  fs.writeFileSync(filePath, content, 'utf8');
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else {
      replaceColorsInFile(fullPath);
    }
  }
}

traverse(srcDir);
console.log('Colors replaced successfully!');
