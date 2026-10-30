import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { blogPosts } from '@/data/blog';
import { blogTopicFor } from '@/data/blogTopics';
const publicPaths = new Set([...fs.readFileSync(path.join(process.cwd(), 'public/sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname));
describe('editorial blog-to-service navigation', () => {
  it('maps every article to public canonical targets without private, duplicate or self links', () => {
    for (const post of blogPosts) {
      const topic = blogTopicFor(post);
      expect(topic.id).not.toBe('general');
      expect(publicPaths.has(topic.pillar)).toBe(true);
      expect(new Set(topic.links.map(link => link.path)).size).toBe(topic.links.length);
      for (const link of topic.links) {
        expect(publicPaths.has(link.path), `${post.slug}: ${link.path}`).toBe(true);
        expect(link.path).not.toContain('checkout');
        expect(link.path).not.toBe('/blog/' + post.slug);
      }
    }
  });
  it('keeps US filing topics out of the UK compliance cluster', () => {
    expect(blogTopicFor({ category: 'Compliance', slug: 'boi-report-filing-guide-2026' }).id).toBe('us-formation');
    expect(blogTopicFor({ category: 'UK Compliance', slug: 'uk-vat-registration' }).id).toBe('uk-compliance');
  });
  it('does not fill an unknown topic with unrelated commercial links', () => {
    expect(blogTopicFor({ category: 'Unreviewed', slug: 'new-topic' }).links).toEqual([{ path: '/blog', label: 'Browse business guides' }]);
    expect(blogTopicFor({ category: 'constructor', slug: 'new-topic' }).id).toBe('general');
  });
});
