'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// The one place ScrollTrigger is registered. Import gsap and ScrollTrigger from here.
gsap.registerPlugin(ScrollTrigger);

/** Motion is on only at 768px and up, and only when the visitor hasn't asked for reduced motion. */
export const MOTION_QUERY = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';

export { gsap, ScrollTrigger };
