import { describe, expect, it } from 'vitest';
import { detectBookCoverExtension } from './book-cover.js';

describe('detectBookCoverExtension', () => {
  it('detects PNG files by signature', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(detectBookCoverExtension(png)).toBe('.png');
  });

  it('detects JPEG files by signature', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    expect(detectBookCoverExtension(jpeg)).toBe('.jpg');
  });

  it('rejects other content, even when it looks like an image by name', () => {
    expect(detectBookCoverExtension(Buffer.from('GIF89a'))).toBeNull();
    expect(detectBookCoverExtension(Buffer.from('<script>alert(1)</script>'))).toBeNull();
    expect(detectBookCoverExtension(Buffer.alloc(0))).toBeNull();
  });
});
