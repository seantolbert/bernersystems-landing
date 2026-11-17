'use client';

import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/content/projects';
import styles from './PhoneDemo.module.css';

const DEVICE_W = 390;

type Props = {
  /** One project for an inline phone, or several stacked for the pinned showcase. */
  projects: Project[];
  activeIndex?: number;
  /** Play the active recording automatically while the phone is on screen. Off on mobile and reduced motion. */
  autoplay?: boolean;
  /** Hide the controls row (used by the hero, which is a still). */
  still?: boolean;
  tone?: 'light' | 'dark';
  className?: string;
};

export function PhoneDemo({ projects, activeIndex = 0, autoplay = false, still = false, tone = 'dark', className }: Props) {
  const active = projects[activeIndex] ?? projects[0];
  const frameRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [inView, setInView] = useState(false);
  // Autoplay mode: the visitor can pause. Tap mode: the visitor has to press play.
  const [userPaused, setUserPaused] = useState(false);
  const [tapPlaying, setTapPlaying] = useState(false);
  const [liveSlug, setLiveSlug] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const isLive = liveSlug === active.slug && !!active.liveUrl;
  const hasVideo = !!(active.media.mp4 || active.media.webm);
  const playing = hasVideo && !isLive && inView && (autoplay ? !userPaused : tapPlaying);
  const togglePlay = () => (autoplay ? setUserPaused(playing) : setTapPlaying(!playing));

  // Track whether the phone is on screen. Scrolling away stops a tapped recording.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (!entry.isIntersecting) setTapPlaying(false);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scale the 390px-wide live iframe to the rendered screen width.
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / DEVICE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Only the active recording plays.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === activeIndex && playing) {
        v.play().catch(() => {
          /* Autoplay can be refused (low-power mode); the play button still works. */
        });
      } else {
        v.pause();
      }
    });
  }, [playing, activeIndex]);

  return (
    <figure className={`${styles.figure} ${tone === 'light' ? styles.light : ''} ${className ?? ''}`}>
      <div className={styles.device} ref={frameRef}>
        <div className={styles.screen} ref={screenRef}>
          {projects.map((p, i) => {
            const isActive = i === activeIndex;
            const video = !!(p.media.mp4 || p.media.webm);
            return (
              <div
                key={p.slug}
                className={styles.layer}
                data-active={isActive}
                aria-hidden={!isActive}
                inert={!isActive}
              >
                {video ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    className={styles.video}
                    poster={p.media.poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-label={`${p.name}: ${p.media.description}`}
                  >
                    {p.media.webm && <source src={p.media.webm} type="video/webm" />}
                    {p.media.mp4 && <source src={p.media.mp4} type="video/mp4" />}
                  </video>
                ) : p.media.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element -- fixed-size poster inside the device frame
                  <img className={styles.video} src={p.media.poster} alt={`${p.name}: ${p.media.description}`} />
                ) : (
                  <div className={styles.placeholder} role="img" aria-label={`${p.name} recording placeholder`}>
                    <span className={styles.placeholderTag}>Recording placeholder</span>
                    <span className={styles.placeholderName}>{p.name}</span>
                    <span className={styles.placeholderText}>{p.media.description}</span>
                  </div>
                )}
              </div>
            );
          })}

          {isLive && active.liveUrl && (
            <div className={styles.layer} data-active="true">
              <iframe
                className={styles.iframe}
                src={active.liveUrl}
                title={`${active.name}, live`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ transform: `scale(${scale})` }}
              />
            </div>
          )}

          {!still && hasVideo && !autoplay && !isLive && !playing && (
            <button type="button" className={styles.playOverlay} onClick={() => setTapPlaying(true)}>
              <span className={styles.playIcon} aria-hidden="true" />
              <span className="visually-hidden">Play the {active.name} recording</span>
            </button>
          )}
        </div>
        <span className={styles.island} aria-hidden="true" />
      </div>

      {!still && (
        <div className={styles.controls}>
          {hasVideo && !isLive && (
            <button
              type="button"
              className={styles.control}
              onClick={togglePlay}
              aria-pressed={playing}
            >
              {playing ? 'Pause recording' : 'Play recording'}
            </button>
          )}
          {active.liveUrl &&
            (active.embeddable ? (
              isLive ? (
                <button type="button" className={styles.control} onClick={() => setLiveSlug(null)}>
                  Back to recording
                </button>
              ) : (
                <button type="button" className={`${styles.control} ${styles.controlPrimary}`} onClick={() => setLiveSlug(active.slug)}>
                  Try it live
                </button>
              )
            ) : null)}
          {active.liveUrl && (
            <a className={styles.link} href={active.liveUrl} target="_blank" rel="noopener noreferrer">
              Open in a new tab<span className="visually-hidden"> ({active.name})</span>
            </a>
          )}
        </div>
      )}
      <figcaption className="visually-hidden">{active.media.description}</figcaption>
    </figure>
  );
}
