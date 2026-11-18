'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Project, ProjectMedia } from '@/content/projects';
import styles from './devices.module.css';

export const hasVideo = (m?: ProjectMedia) => !!(m?.mp4 || m?.webm);

/** Visible on screen (35% threshold). `onLeave` fires each time it scrolls out. */
export function useInView<T extends HTMLElement>(onLeave?: () => void) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const leave = useRef(onLeave);
  useEffect(() => {
    leave.current = onLeave;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (!entry.isIntersecting) leave.current?.();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/* ---------- Bezels ---------- */

export function PhoneBezel({ children, device = false }: { children: ReactNode; device?: boolean }) {
  return (
    <div className={styles.phone} data-device={device || undefined}>
      <div className={styles.phoneScreen}>{children}</div>
      <span className={styles.island} aria-hidden="true" />
    </div>
  );
}

export function BrowserBezel({ address, aspect, children }: { address?: string; aspect?: string; children: ReactNode }) {
  return (
    <div className={styles.browser}>
      <div className={styles.browserBar} aria-hidden="true">
        <span className={styles.browserAddress}>{address ?? ''}</span>
      </div>
      <div className={styles.browserScreen} style={aspect ? { aspectRatio: aspect } : undefined}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Stacked recordings: only the active one shows and plays ---------- */

type Item = { key: string; name: string; media?: ProjectMedia };

export function MediaLayers({
  items,
  activeIndex,
  playing,
  kind,
}: {
  items: Item[];
  activeIndex: number;
  playing: boolean;
  kind: 'phone' | 'desktop';
}) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    refs.current.forEach((v, i) => {
      if (!v) return;
      if (i === activeIndex && playing) {
        v.play().catch(() => {
          /* Autoplay can be refused (low-power mode); the play control still works. */
        });
      } else {
        v.pause();
      }
    });
  }, [playing, activeIndex]);

  return items.map((it, i) => {
    const isActive = i === activeIndex;
    const m = it.media;
    let content: ReactNode = null;
    if (m && hasVideo(m)) {
      content = (
        <video
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={styles.media}
          poster={m.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={`${it.name}: ${m.description}`}
        >
          {m.webm && <source src={m.webm} type="video/webm" />}
          {m.mp4 && <source src={m.mp4} type="video/mp4" />}
        </video>
      );
    } else if (m?.poster) {
      // eslint-disable-next-line @next/next/no-img-element -- fixed-size poster inside the device frame
      content = <img className={styles.media} src={m.poster} alt={`${it.name}: ${m.description}`} />;
    } else if (m) {
      content = (
        <div className={styles.placeholder} role="img" aria-label={`${it.name} ${kind === 'desktop' ? 'desktop image' : 'recording'} placeholder`}>
          <span className={styles.placeholderTag}>{kind === 'desktop' ? 'Desktop image placeholder' : 'Recording placeholder'}</span>
          <span className={styles.placeholderName}>{it.name}</span>
          <span className={styles.placeholderText}>{m.description}</span>
        </div>
      );
    }
    return (
      <div
        key={it.key}
        className={styles.layer}
        data-active={isActive}
        data-device={m?.deviceRecording || undefined}
        aria-hidden={!isActive}
        inert={!isActive}
      >
        {content}
      </div>
    );
  });
}

/* ---------- Live app inside the phone, scaled from 390px to the screen width ---------- */

export function LiveFrame({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 390));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={styles.layer} data-active="true">
      <iframe
        className={styles.iframe}
        src={project.liveUrl}
        title={`${project.name}, live`}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}

export function PlayOverlay({ label, onPlay }: { label: string; onPlay: () => void }) {
  return (
    <button type="button" className={styles.playOverlay} onClick={onPlay}>
      <span className={styles.playIcon} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </button>
  );
}

/* ---------- Controls row ---------- */

export function Controls({
  project,
  showPlay,
  playing,
  onTogglePlay,
  isLive,
  onLive,
}: {
  project: Project;
  showPlay: boolean;
  playing: boolean;
  onTogglePlay: () => void;
  isLive: boolean;
  onLive: (on: boolean) => void;
}) {
  return (
    <div className={styles.controls}>
      {showPlay && !isLive && (
        <button type="button" className={styles.control} onClick={onTogglePlay} aria-pressed={playing}>
          {playing ? 'Pause recording' : 'Play recording'}
        </button>
      )}
      {project.liveUrl &&
        project.embeddable &&
        (isLive ? (
          <button type="button" className={styles.control} onClick={() => onLive(false)}>
            Back to recording
          </button>
        ) : (
          <button type="button" className={`${styles.control} ${styles.controlPrimary}`} onClick={() => onLive(true)}>
            Try it live
          </button>
        ))}
      {project.liveUrl && (
        <a className={styles.link} href={project.liveUrl} target="_blank" rel="noopener noreferrer">
          Open in a new tab<span className="visually-hidden"> ({project.name})</span>
        </a>
      )}
    </div>
  );
}
