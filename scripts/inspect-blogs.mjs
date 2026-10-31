import fs from 'fs';

const txt = fs.readFileSync('src/data/blog.ts', 'utf8');
const matches = [...txt.matchAll(/"slug":\s*"([^"]+)"/g)].map(m => m[1]);
console.log('Total blogs:', matches.length);
console.log('Existing slugs:', matches);
