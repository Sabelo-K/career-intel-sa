const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
function walk(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : [path.join(dir,entry.name)]); }
const files = [...walk('app'),...walk('components')].filter(file => file.endsWith('.tsx') && !file.includes(`api${path.sep}`) && !file.includes('opengraph'));
const violations=[];
for (const file of files) {
  const source=fs.readFileSync(file,'utf8');
  for(const pattern of [/journey-existing-tool/, /bg-\[#(?:12152a|050B1A|0d1526|070912|141833|0e1224|0d1117)\]/i, /text-white\/\d+/, /border-white\/\d+/, /bg-(?:slate|gray|zinc)-9\d\d/, /careerintel-theme/]) {
    if(pattern.test(source)) violations.push(`${file}: ${pattern}`);
  }
}
assert.deepEqual(violations,[], 'Legacy interface styles must not return');
const css=fs.readFileSync('app/globals.css','utf8');
assert(!css.includes('body::before'), 'No global dark backdrop');
assert(!fs.readFileSync('app/layout.tsx','utf8').includes('className="dark"'));
console.log(`Interface audit passed: ${files.length} page/component files; no legacy dark surfaces or saved-theme overrides.`);
