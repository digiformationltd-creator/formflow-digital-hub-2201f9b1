// Mechanical type-only cleanup of Lucide component references.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../src/', import.meta.url));
let changed = 0;
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (entry.name.endsWith('.tsx')) {
      const before = fs.readFileSync(file, 'utf8');
      const after = before.replace(/icon: any(?=[; }])/g, 'icon: import("lucide-react").LucideIcon');
      if (after !== before) { fs.writeFileSync(file, after); changed++; }
    }
  }
}
visit(root);
console.log(`Typed icon props in ${changed} files`);
