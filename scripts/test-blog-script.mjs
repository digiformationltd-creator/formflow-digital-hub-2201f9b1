import fs from 'fs';

// Helper to calculate word count of an article
function getWordCount(post) {
  let text = post.title + ' ' + post.excerpt + ' ';
  if (post.content) {
    for (const c of post.content) {
      text += c.h + ' ' + c.body.replace(/<[^>]*>/g, ' ') + ' ';
    }
  }
  return text.trim().split(/\s+/).length;
}

console.log('Cornerstone Blog Generator initialized.');
