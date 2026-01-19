'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PathAnimation.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface PathAnimationProps {
  pathId: string;
  className?: string;
  duration?: number;
}

export default function PathAnimation({ 
  pathId, 
  className = '', 
  duration = 2 
}: PathAnimationProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const path = pathRef.current;
    const pathLength = path.getTotalLength();

    // 초기 상태 설정
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: duration,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: path,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: true,
        },
      });
    }, path);

    return () => ctx.revert();
  }, [duration]);

  return (
    <svg className={`${styles.svg} ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        ref={pathRef}
        id={pathId}
        className={styles.path}
        d="M 10,50 Q 50,10 90,50 T 170,50"
      />
    </svg>
  );
}
