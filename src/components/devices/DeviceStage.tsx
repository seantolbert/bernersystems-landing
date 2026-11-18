'use client';

import { useState } from 'react';
import type { Project } from '@/content/projects';
import { BrowserBezel, Controls, hasVideo, LiveFrame, MediaLayers, PhoneBezel, PlayOverlay, useInView } from './parts';
import styles from './devices.module.css';

type Props = {
  /** One project (static, reduced motion) or all of them stacked (pinned showcase). */
  projects: Project[];
  activeIndex?: number;
  /** Play while on screen. Only the pinned showcase autoplays; everything else is tap to play. */
  autoplay?: boolean;
};

/**
 * Laptop browser window with the phone overlapping its corner ("pair" mode).
 * Projects without desktop media, and live mode, switch to the phone alone ("phone" mode).
 * Geometry for the two modes lives in devices.module.css (.stage).
 */
export function DeviceStage({ projects, activeIndex = 0, autoplay = false }: Props) {
  const active = projects[activeIndex] ?? projects[0];
  const [userPaused, setUserPaused] = useState(false);
  const [tapPlaying, setTapPlaying] = useState(false);
  const [liveSlug, setLiveSlug] = useState<string | null>(null);
  const [ref, inView] = useInView<HTMLDivElement>(() => setTapPlaying(false));

  const isLive = liveSlug === active.slug && !!active.liveUrl && active.embeddable;
  const hasDesktop = !!active.desktopMedia;
  const mode = hasDesktop && !isLive ? 'pair' : 'phone';
  const anyVideo = hasVideo(active.media) || (mode === 'pair' && hasVideo(active.desktopMedia));
  const playing = anyVideo && inView && !isLive && (autoplay ? !userPaused : tapPlaying);
  const togglePlay = () => (autoplay ? setUserPaused(playing) : setTapPlaying(!playing));

  return (
    <figure className={styles.figure}>
      <div ref={ref} className={styles.stage} data-mode={mode} data-side={active.desktopMedia?.phoneSide ?? 'right'}>
        <div className={styles.stageBrowser} aria-hidden={mode !== 'pair'} inert={mode !== 'pair'}>
          <BrowserBezel address={active.desktopMedia?.address} aspect={active.desktopMedia?.aspect}>
            <MediaLayers
              kind="desktop"
              items={projects.map((p) => ({ key: p.slug, name: p.name, media: p.desktopMedia }))}
              activeIndex={activeIndex}
              playing={playing && mode === 'pair'}
            />
          </BrowserBezel>
        </div>
        <div className={styles.stagePhone}>
          <PhoneBezel device={!!active.media.deviceRecording && !isLive}>
            <MediaLayers
              kind="phone"
              items={projects.map((p) => ({ key: p.slug, name: p.name, media: p.media }))}
              activeIndex={activeIndex}
              playing={playing}
            />
            {isLive && <LiveFrame project={active} />}
          </PhoneBezel>
        </div>
        {!autoplay && anyVideo && !isLive && !playing && (
          <PlayOverlay label={`Play the ${active.name} recordings`} onPlay={() => setTapPlaying(true)} />
        )}
      </div>
      <Controls
        project={active}
        showPlay={anyVideo}
        playing={playing}
        onTogglePlay={togglePlay}
        isLive={isLive}
        onLive={(on) => setLiveSlug(on ? active.slug : null)}
      />
      <figcaption className="visually-hidden">
        {mode === 'pair' && active.desktopMedia ? `${active.desktopMedia.description} ` : ''}
        {active.media.description}
      </figcaption>
    </figure>
  );
}
