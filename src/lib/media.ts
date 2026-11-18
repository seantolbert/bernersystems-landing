import 'server-only';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Project, ProjectMedia } from '@/content/projects';

const exists = (publicPath?: string) =>
  !!publicPath && existsSync(path.join(process.cwd(), 'public', publicPath.replace(/^\//, '')));

const check = (m: ProjectMedia): ProjectMedia => ({
  ...m,
  poster: exists(m.poster) ? m.poster : undefined,
  mp4: exists(m.mp4) ? m.mp4 : undefined,
  webm: exists(m.webm) ? m.webm : undefined,
});

/**
 * Drops media paths whose files aren't in public/ yet, so a project without a capture
 * shows a labeled placeholder instead of a broken video.
 */
export function withAvailableMedia(list: Project[]): Project[] {
  return list.map((p) => ({
    ...p,
    media: check(p.media),
    desktopMedia: p.desktopMedia ? check(p.desktopMedia) : undefined,
  }));
}
