// metrics-collector.js
const fs = require('fs');
const path = require('path');

function analyzeComplexity(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return {
    lines: content.split('\n').length,
    functions: (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length,
    imports: (content.match(/^import/gm) || []).length,
    exports: (content.match(/^export/gm) || []).length,
    conditionals: (content.match(/if\s*\(|switch\s*\(/g) || []).length,
    loops: (content.match(/for\s*\(|while\s*\(|\.map\(|\.forEach\(/g) || []).length
  };
}