import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FEED_POSTS } from './feedPosts';
import { COMMUNITY_FEED_IMAGES, communityFeedImage } from './communityFeedImages';

const feedCardPath = path.join(process.cwd(), 'src/components/community/FeedPostCard.tsx');

function publicAssetPath(src: string) {
  return path.join(process.cwd(), 'public', src.replace(/^\//, ''));
}

function pngSize(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

describe('community feed images', () => {
  it('maps every simulated post to a local generated image', () => {
    const missing = FEED_POSTS.filter((post) => !COMMUNITY_FEED_IMAGES[post.imageKey as keyof typeof COMMUNITY_FEED_IMAGES])
      .map((post) => post.id);

    expect(missing).toEqual([]);
  });

  it('keeps every referenced asset present and square', () => {
    for (const post of FEED_POSTS) {
      const image = communityFeedImage(post.imageKey);
      const filePath = publicAssetPath(image.src);
      expect(fs.existsSync(filePath), image.src).toBe(true);
      const size = pngSize(filePath);
      expect(size.width, image.src).toBe(size.height);
    }
  });

  it('uses local assets for the feed card instead of Unsplash', () => {
    const source = fs.readFileSync(feedCardPath, 'utf8');
    expect(source).not.toContain('unsplashUrl');
    expect(source).not.toContain('@/lib/unsplash');
    expect(source).toContain('aspect-square');
  });

  it('keeps the first post aligned with the milk-carton organizer caption', () => {
    const first = FEED_POSTS[0];
    const image = communityFeedImage(first.imageKey);

    expect(first.caption).toContain('Caixa de leite');
    expect(image.src).toContain('milk-carton-organizer');
    expect(image.alt).toContain('caixa de leite');
  });
});
