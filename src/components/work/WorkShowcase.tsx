'use client';

import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/content/projects';
import { gsap, MOTION_QUERY, ScrollTrigger } from '@/components/motion/gsap';
import { DeviceStage } from '@/components/devices/DeviceStage';
import { PhoneDemo } from '@/components/devices/PhoneDemo';
import styles from './WorkShowcase.module.css';

type Props = { projects: Project[]; heading: string; intro: string };

/**
 * Motion concept "One phone, many apps" (intake/bernersystems.direction.json).
 * Desktop with motion: one sticky stage (browser window + phone) swaps recordings as each case study
 * crosses the center. Reduced motion at 768px+: a static stage under each case study.
 * Mobile: a phone under each case study. In both static cases ScrollTrigger never runs.
 */
export function WorkShowcase({ projects, heading, intro }: Props) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      const cases = Array.from(list.querySelectorAll<HTMLElement>('[data-case]'));
      cases.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
      });
    });
    return () => mm.revert();
  }, []);

  const total = projects.length;

  return (
    <section id="work" className={styles.section} aria-labelledby="work-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="work-heading">{heading}</h2>
          <p className={styles.intro}>{intro}</p>
        </header>

        <div className={styles.grid}>
          <ol className={styles.list} ref={listRef}>
            {projects.map((p, i) => (
              <li key={p.slug} className={styles.case} data-case data-active={i === active}>
                <p className={styles.meta}>
                  <span className={styles.count}>
                    {i + 1} / {total}
                  </span>
                  <span>{p.kind}</span>
                </p>
                <h3 className={styles.name}>{p.name}</h3>
                <p className={styles.summary}>{p.summary}</p>
                <ul className={styles.details}>
                  {p.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <ul className={styles.stack} aria-label={`${p.name} is built with`}>
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                {p.note && <p className={styles.note}>{p.note}</p>}

                <div className={styles.inlinePhone}>
                  <PhoneDemo project={p} />
                </div>
                <div className={styles.inlineStage}>
                  <DeviceStage projects={[p]} />
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.stickyCol}>
            <div className={styles.sticky}>
              <DeviceStage projects={projects} activeIndex={active} autoplay />
              <p className={styles.nowShowing} aria-live="polite">
                {projects[active]?.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
