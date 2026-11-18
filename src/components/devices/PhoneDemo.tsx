'use client';

import { useState } from 'react';
import type { Project } from '@/content/projects';
import { Controls, hasVideo, LiveFrame, MediaLayers, PhoneBezel, PlayOverlay, useInView } from './parts';
import styles from './devices.module.css';

type Props = {
  project: Project;
  /** Hide controls and never play (the hero is a still). */
  still?: boolean;
  tone?: 'light' | 'dark';
};

/** A single phone. Used on mobile, in the hero, and anywhere motion is off: recordings play only when tapped. */
export function PhoneDemo({ project, still = false, tone = 'dark' }: Props) {
  const [tapPlaying, setTapPlaying] = useState(false);
  const [live, setLive] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>(() => setTapPlaying(false));

  const isLive = live && !!project.liveUrl && project.embeddable;
  const video = hasVideo(project.media);
  const playing = !still && video && inView && tapPlaying && !isLive;

  return (
    <figure className={`${styles.figure} ${tone === 'light' ? styles.light : ''}`}>
      <div ref={ref} className={styles.phoneSolo}>
        <PhoneBezel device={!!project.media.deviceRecording && !isLive}>
          <MediaLayers
            kind="phone"
            items={[{ key: project.slug, name: project.name, media: project.media }]}
            activeIndex={0}
            playing={playing}
          />
          {isLive && <LiveFrame project={project} />}
          {!still && video && !isLive && !playing && (
            <PlayOverlay label={`Play the ${project.name} recording`} onPlay={() => setTapPlaying(true)} />
          )}
        </PhoneBezel>
      </div>
      {!still && (
        <Controls
          project={project}
          showPlay={video}
          playing={playing}
          onTogglePlay={() => setTapPlaying(!playing)}
          isLive={isLive}
          onLive={setLive}
        />
      )}
      <figcaption className="visually-hidden">{project.media.description}</figcaption>
    </figure>
  );
}
