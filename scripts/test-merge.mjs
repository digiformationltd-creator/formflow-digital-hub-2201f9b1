import fs from 'fs';
import path from 'path';
import { part1Articles } from './cornerstone_articles/part1.mjs';
import { part2Articles } from './cornerstone_articles/part2.mjs';
import { part3Articles } from './cornerstone_articles/part3.mjs';

const allNewArticles = [...part1Articles, ...part2Articles, ...part3Articles];
console.log(`Loaded ${allNewArticles.length} cornerstone articles.`);

for (const [idx, post] of allNewArticles.entries()) {
  let text = post.title + ' ' + post.excerpt + ' ';
  if (post.content) {
    for (const c of post.content) {
      text += c.h + ' ' + c.body.replace(/<[^>]*>/g, ' ') + ' ';
    }
  }
  const words = text.trim().split(/\s+/).length;
  console.log(`[${idx + 1}/10] ${post.slug} -> Words: ${words}`);
}
