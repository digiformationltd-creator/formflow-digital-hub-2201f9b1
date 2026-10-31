import fs from 'fs';

async function bundle() {
  const articles = [];
  for (let i = 1; i <= 10; i++) {
    const mod = await import('./cornerstone_articles/article' + i + '.mjs');
    articles.push(mod['article' + i]);
  }
  
  const fileContent = `import type { BlogPost } from "./blog";\n\nexport const cornerstoneArticles: BlogPost[] = ${JSON.stringify(articles, null, 2)};\n`;
    
  fs.writeFileSync('src/data/cornerstoneArticles.ts', fileContent, 'utf8');
  console.log('Successfully wrote src/data/cornerstoneArticles.ts. Size:', fileContent.length);
}

bundle().catch(err => {
  console.error(err);
  process.exit(1);
});
