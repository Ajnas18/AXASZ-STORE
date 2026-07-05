import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productsPath = join(__dirname, 'src', 'data', 'products.js');

let content = fs.readFileSync(productsPath, 'utf8');

let counter = 11;
content = content.replace(/\{ id: \d+,/g, (match) => {
  const code = `AXS00${counter}`;
  counter++;
  return `${match} productCode: "${code}",`;
});

fs.writeFileSync(productsPath, content, 'utf8');
console.log('Products updated successfully!');
