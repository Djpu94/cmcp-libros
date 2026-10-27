import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const BOOK_COVER_MAX_BYTES = 5 * 1024 * 1024;

/** Public path prefix under which uploaded covers are served. */
export const UPLOADS_URL_PREFIX = '/uploads';

/** Directory on disk that backs {@link UPLOADS_URL_PREFIX}. */
export const UPLOADS_ROOT_DIR = join(process.cwd(), 'uploads');

const BOOK_COVERS_DIR = join(UPLOADS_ROOT_DIR, 'books');

export type BookCoverExtension = '.png' | '.jpg';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

/** Detects the image type from its leading bytes, ignoring client-provided MIME types. */
export function detectBookCoverExtension(
  content: Buffer,
): BookCoverExtension | null {
  if (content.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return '.png';
  }
  if (content.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE)) {
    return '.jpg';
  }
  return null;
}

/** Stores the cover under a random name and returns the file name. */
export async function saveBookCover(
  content: Buffer,
  extension: BookCoverExtension,
): Promise<string> {
  await mkdir(BOOK_COVERS_DIR, { recursive: true });
  const fileName = `${randomUUID()}${extension}`;
  await writeFile(join(BOOK_COVERS_DIR, fileName), content);
  return fileName;
}
