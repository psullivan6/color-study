const fs = require('fs');
const path = require('path');
const pug = require('pug');

const colorCombinations = require('../src/colors');
const templatePath = path.join(__dirname, '../src', 'index.pug');

// Compile the source code
const compiledFunction = pug.compileFile(templatePath);

fs.writeFileSync(
  path.resolve(__dirname, '..', 'public/index.html'),
  compiledFunction({ colorCombinations }),
  'utf8'
);
