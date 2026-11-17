'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';
import { gsap, MOTION_QUERY, ScrollTrigger } from './gsap';

/** Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync. Off on mobile and reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      const lenis = new Lenis({ autoRaf: false, anchors: { offset: -72 } });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      };
    });
    return () => mm.revert();
  }, []);

  return null;
}
