const fs = require('fs');
const content = fs.readFileSync('d:/Abel paginas/Zambaro Ecuador/zamvaro-ecuador/.next/static/chunks/3tgjuof-bt0u7.js', 'utf8');

let pos = 0;
while (true) {
  pos = content.indexOf('Array(', pos);
  if (pos === -1) break;
  console.log(`--- Match at ${pos} ---`);
  console.log(content.substring(Math.max(0, pos - 100), Math.min(content.length, pos + 150)));
  pos += 6;
}
