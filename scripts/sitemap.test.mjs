import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBlogPosts } from './sync-sitemap.mjs';
test('reads quoted and unquoted properties without dropping existing blog routes', () => {
  const posts = getBlogPosts(`export const blogPosts = [
    { slug: 'first', date: '2026-01-01', content: [{ h: 'Nested', body: 'text' }] },
    { "slug": "second", "date": "2026-02-01", "dateModified": "2026-10-24" }
  ];`);
  assert.equal(posts.length, 2); assert.equal(posts[1].modified, '2026-10-24');
  assert.equal(posts[0].modified, undefined); // Never invent today's lastmod.
});
test('rejects duplicate slugs rather than silently truncating the sitemap', () => {
  assert.throws(() => getBlogPosts(`const blogPosts = [{slug:'same',date:'2026-01-01'},{slug:'same',date:'2026-02-01'}];`), /duplicate/);
});
test('rejects a future or chronologically invalid modification date', () => {
  assert.throws(() => getBlogPosts(`const blogPosts = [{slug:'test',date:'2026-01-01',dateModified:'2099-01-01'}];`), /future/);
  assert.throws(() => getBlogPosts(`const blogPosts = [{slug:'test',date:'2026-01-02',dateModified:'2026-01-01'}];`), /modification/);
});
test('current source has 51 distinct literal blog records including the four quoted records', () => {
  const posts = getBlogPosts();
  assert.equal(posts.length, 51); assert.equal(new Set(posts.map(post => post.slug)).size, posts.length);
  assert.ok(posts.some(post => post.slug === 'free-open-source-office-suite-microsoft-365-copilot-alternative-2026'));
});
