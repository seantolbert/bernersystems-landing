import 'server-only';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Project } from '@/content/projects';

const exists = (publicPath?: string) =>
  !!publicPath && existsSync(path.join(process.cwd(), 'public', publicPath.replace(/^\//, '')));

/**
 * Drops media paths whose files aren't in public/ yet, so a project without a capture
 * shows a labeled placeholder instead of a broken video.
 */
export function withAvailableMedia(list: Project[]): Project[] {
  return list.map((p) => ({
    ...p,
    media: {
      description: p.media.description,
      poster: exists(p.media.poster) ? p.media.poster : undefined,
      mp4: exists(p.media.mp4) ? p.media.mp4 : undefined,
      webm: exists(p.media.webm) ? p.media.webm : undefined,
    },
  }));
}
