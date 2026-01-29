'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PathAnimation.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PathAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bold1Ref = useRef<HTMLElement>(null);
  const bold2Ref = useRef<HTMLElement>(null);
  const bold3Ref = useRef<HTMLElement>(null);
  const boldTitleRef = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const gradientAnimationStartedRef = useRef(false);
  const pointDistancesRef = useRef<{ point1: number; point2: number; point3: number } | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !pathRef.current || !svgRef.current) return;
    if (!bold1Ref.current || !bold2Ref.current || !bold3Ref.current) return;
    if (!boldTitleRef.current || !subtitleRef.current) return;

    const section = sectionRef.current;
    const path = pathRef.current;
    const svg = svgRef.current;
    
    const getElementCenter = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - sectionRect.left,
        y: rect.top + rect.height / 2 - sectionRect.top,
      };
    };

    const getElementTopLeft = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      return {
        x: rect.left - sectionRect.left,
        y: rect.top - sectionRect.top,
      };
    };

    const getDTopPoint = (el: HTMLElement) => {
      const range = document.createRange();
      const textNode = el.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        const rect = el.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        return {
          x: rect.left + rect.width * 0.12 - sectionRect.left,
          y: rect.top + 50 - sectionRect.top,
        };
      }
      
      range.setStart(textNode, 0);
      range.setEnd(textNode, 1);
      const rect = range.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      
      return {
        x: rect.left + rect.width * 0.12 - sectionRect.left,
        y: rect.top + 50 - sectionRect.top,
      };
    };

    const updatePath = () => {
      const sectionRect = section.getBoundingClientRect();
      svg.setAttribute('width', `${sectionRect.width}`);
      svg.setAttribute('height', `${sectionRect.height}`);
      svg.setAttribute('viewBox', `0 0 ${sectionRect.width} ${sectionRect.height}`);

      const point1 = getElementCenter(bold1Ref.current!);
      const point2 = getElementCenter(bold2Ref.current!);
      const point3 = getElementCenter(bold3Ref.current!);
      const point4 = getDTopPoint(boldTitleRef.current!);

      const rect1 = bold1Ref.current!.getBoundingClientRect();
      const rect2 = bold2Ref.current!.getBoundingClientRect();
      const rect3 = bold3Ref.current!.getBoundingClientRect();

      const startX = sectionRect.width - 50;
      const startY = Math.min(50, point1.y - 100);

      const dir1X = point1.x - startX;
      const dir1Y = point1.y - startY;
      const dir2X = point2.x - point1.x;
      const dir2Y = point2.y - point1.y;
      const dir3X = point3.x - point2.x;
      const dir3Y = point3.y - point2.y;
      const dir4X = point4.x - point3.x;
      const dir4Y = point4.y - point3.y;

      const len1 = Math.sqrt(dir1X * dir1X + dir1Y * dir1Y);
      const len2 = Math.sqrt(dir2X * dir2X + dir2Y * dir2Y);
      const len3 = Math.sqrt(dir3X * dir3X + dir3Y * dir3Y);
      const len4 = Math.sqrt(dir4X * dir4X + dir4Y * dir4Y);

      const getDist = (x1: number, y1: number, x2: number, y2: number) => 
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

      const getControlPoints = (
        prev: { x: number; y: number },
        curr: { x: number; y: number },
        next: { x: number; y: number },
        tension: number = 0.2
      ) => {
        const d1 = getDist(prev.x, prev.y, curr.x, curr.y);
        const d2 = getDist(curr.x, curr.y, next.x, next.y);
        
        if (d1 + d2 === 0) {
          return { in: { x: curr.x, y: curr.y }, out: { x: curr.x, y: curr.y } };
        }
        
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;

        const c1x = curr.x - dx * tension * (d1 / (d1 + d2));
        const c1y = curr.y - dy * tension * (d1 / (d1 + d2));
        const c2x = curr.x + dx * tension * (d2 / (d1 + d2));
        const c2y = curr.y + dy * tension * (d2 / (d1 + d2));

        return { in: { x: c1x, y: c1y }, out: { x: c2x, y: c2y } };
      };

      const waveDist = 150;
      const waveProgress = 0.7;

      const getPerpendicular = (dx: number, dy: number, len: number) => {
        if (len === 0) return { x: 0, y: 1 };
        const perpX = -dy / len;
        const perpY = dx / len;
        return { x: perpX, y: perpY };
      };

      const createWavePoints = (
        fromX: number, fromY: number,
        toX: number, toY: number,
        dirX: number, dirY: number,
        len: number
      ) => {
        const waveX = fromX + (toX - fromX) * waveProgress;
        const waveY = fromY + (toY - fromY) * waveProgress;

        const perp = getPerpendicular(dirX, dirY, len);

        const wavePointX = waveX + perp.x * waveDist;
        const wavePointY = waveY + perp.y * waveDist;

        return { wavePointX, wavePointY };
      };

      const waves1 = createWavePoints(startX, startY, point1.x, point1.y, dir1X, dir1Y, len1);
      const waves2 = createWavePoints(point1.x, point1.y, point2.x, point2.y, dir2X, dir2Y, len2);
      const waves3 = createWavePoints(point2.x, point2.y, point3.x, point3.y, dir3X, dir3Y, len3);
      const waves4 = createWavePoints(point3.x, point3.y, point4.x, point4.y, dir4X, dir4Y, len4);

      const sectionTop = section.getBoundingClientRect().top;
      
      if (waves1.wavePointY > rect1.top - sectionTop - 30) {
        waves1.wavePointY = rect1.top - sectionTop - 30;
      }
      
      if (waves2.wavePointY < rect1.bottom - sectionTop + 20 || waves2.wavePointY > rect2.top - sectionTop - 20) {
        const midY = (rect1.bottom - sectionTop + rect2.top - sectionTop) / 2;
        waves2.wavePointY = midY;
      }
      
      if (waves3.wavePointY < rect2.bottom - sectionTop + 20 || waves3.wavePointY > rect3.top - sectionTop - 20) {
        const midY = (rect2.bottom - sectionTop + rect3.top - sectionTop) / 2;
        waves3.wavePointY = midY;
      }

      const points = [
        { x: startX, y: startY },
        { x: waves1.wavePointX, y: waves1.wavePointY },
        { x: point1.x, y: point1.y },
        { x: waves2.wavePointX, y: waves2.wavePointY },
        { x: point2.x, y: point2.y },
        { x: waves3.wavePointX, y: waves3.wavePointY },
        { x: point3.x, y: point3.y },
        { x: waves4.wavePointX, y: waves4.wavePointY },
        { x: point4.x, y: point4.y },
      ];

      const controlPoints: Array<{ in: { x: number; y: number }; out: { x: number; y: number } }> = [];
      for (let i = 0; i < points.length; i++) {
        const prev = i === 0 ? points[i] : points[i - 1];
        const curr = points[i];
        const next = i === points.length - 1 ? points[i] : points[i + 1];
        const isWavePoint = i === 1 || i === 3 || i === 5 || i === 7;
        const tension = isWavePoint ? 0.4 : 0.35;
        controlPoints.push(getControlPoints(prev, curr, next, tension));
      }

      let pathData = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const cp = controlPoints[i];
        const nextCp = controlPoints[i + 1];
        pathData += ` C ${cp.out.x} ${cp.out.y}, ${nextCp.in.x} ${nextCp.in.y}, ${points[i + 1].x} ${points[i + 1].y}`;
      }

      path.setAttribute('d', pathData);

      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = `${pathLength}`;
      path.style.strokeDashoffset = `${pathLength}`;
      
      if (pathLength > 0) {
        const findClosestPathLength = (targetX: number, targetY: number) => {
          let closestLength = 0;
          let minDistance = Infinity;
          
          const sampleStep = Math.max(10, pathLength / 100);
          for (let len = 0; len <= pathLength; len += sampleStep) {
            try {
              const point = path.getPointAtLength(len);
              const distance = Math.sqrt((point.x - targetX) ** 2 + (point.y - targetY) ** 2);
              if (distance < minDistance) {
                minDistance = distance;
                closestLength = len;
              }
            } catch (e) {
              continue;
            }
          }
          return closestLength;
        };
        
        pointDistancesRef.current = {
          point1: findClosestPathLength(point1.x, point1.y),
          point2: findClosestPathLength(point2.x, point2.y),
          point3: findClosestPathLength(point3.x, point3.y),
        };
      }
    };

    updatePath();

    const handleResize = () => {
      updatePath();
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    const ctx = gsap.context(() => {
      const pathCompleteProgress = 0.98;
      
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const pathLength = path.getTotalLength();
          
          if (progress <= pathCompleteProgress) {
            const pathProgress = progress / pathCompleteProgress;
            const currentPathLength = pathLength * pathProgress;
            path.style.strokeDashoffset = `${pathLength * (1 - pathProgress)}`;
            
            if (pointDistancesRef.current) {
              const { point1, point2, point3 } = pointDistancesRef.current;
              const tolerance = pathLength * 0.03;
              
              if (bold1Ref.current && bold1Ref.current.parentElement) {
                const pathText1 = bold1Ref.current.parentElement as HTMLElement;
                if (currentPathLength >= point1 - tolerance) {
                  pathText1.classList.add(styles.closePath);
                } else {
                  pathText1.classList.remove(styles.closePath);
                }
              }
              
              if (bold2Ref.current && bold2Ref.current.parentElement) {
                const pathText2 = bold2Ref.current.parentElement as HTMLElement;
                if (currentPathLength >= point2 - tolerance) {
                  pathText2.classList.add(styles.closePath);
                } else {
                  pathText2.classList.remove(styles.closePath);
                }
              }
              
              if (bold3Ref.current && bold3Ref.current.parentElement) {
                const pathText3 = bold3Ref.current.parentElement as HTMLElement;
                if (currentPathLength >= point3 - tolerance) {
                  pathText3.classList.add(styles.closePath);
                } else {
                  pathText3.classList.remove(styles.closePath);
                }
              }
            }
          } else {
            path.style.strokeDashoffset = '0';
            
            if (bold1Ref.current && bold1Ref.current.parentElement) {
              bold1Ref.current.parentElement.classList.add(styles.closePath);
            }
            if (bold2Ref.current && bold2Ref.current.parentElement) {
              bold2Ref.current.parentElement.classList.add(styles.closePath);
            }
            if (bold3Ref.current && bold3Ref.current.parentElement) {
              bold3Ref.current.parentElement.classList.add(styles.closePath);
            }
          }

          if (boldTitleRef.current && subtitleRef.current) {
            if (progress >= pathCompleteProgress && !gradientAnimationStartedRef.current) {
              gradientAnimationStartedRef.current = true;
              
              const whiteColor = `rgba(255, 255, 255, 0.2)`;
              const orangeColor = `rgb(232, 67, 12)`;
              const subtitleWhiteColor = `rgb(255, 255, 255)`;
              const subtitleGrayColor = `rgb(88, 88, 88)`;
              
              const titleElement = boldTitleRef.current;
              const subtitleElement = subtitleRef.current;
              
              titleElement.style.backgroundClip = 'text';
              titleElement.style.webkitBackgroundClip = 'text';
              titleElement.style.webkitTextFillColor = 'transparent';
              titleElement.style.color = 'transparent';
              
              subtitleElement.style.backgroundClip = 'text';
              subtitleElement.style.webkitBackgroundClip = 'text';
              subtitleElement.style.webkitTextFillColor = 'transparent';
              subtitleElement.style.color = 'transparent';
              
              const titleAnimationData = { whiteStop: 0, orangeStop: 0 };
              const subtitleAnimationData = { grayStop: 0, whiteStop: 0 };
              const tl = gsap.timeline({ smoothChildTiming: true });
              
              tl.set(titleElement, {
                backgroundImage: `linear-gradient(90deg, ${orangeColor} 0%, ${orangeColor} 0%, ${whiteColor} 0%)`,
              });
              
              tl.set(subtitleElement, {
                backgroundImage: `linear-gradient(90deg, ${subtitleWhiteColor} 0%, ${subtitleGrayColor} 0%)`,
              }, '<');
              
              tl.to(titleAnimationData, {
                whiteStop: 100,
                duration: 0.5,
                ease: 'sine.out',
                onUpdate: function() {
                  const whiteStop = titleAnimationData.whiteStop;
                  titleElement.style.backgroundImage = `linear-gradient(90deg, ${orangeColor} 0%, ${orangeColor} 0%, ${whiteColor} ${whiteStop}%)`;
                },
              });
              tl.to(subtitleAnimationData, {
                grayStop: 100,
                duration: 0.5,
                ease: 'sine.out',
                onUpdate: function() {
                  const grayStop = subtitleAnimationData.grayStop;
                  subtitleElement.style.backgroundImage = `linear-gradient(90deg, ${subtitleWhiteColor} 0%, ${subtitleGrayColor} ${grayStop}%)`;
                },
              }, '<');
              
              tl.to(titleAnimationData, {
                orangeStop: 100,
                duration: 1.0,
                ease: 'sine.inOut',
                onUpdate: function() {
                  const orangeStop = titleAnimationData.orangeStop;
                  titleElement.style.backgroundImage = `linear-gradient(90deg, ${orangeColor} 0%, ${orangeColor} ${orangeStop}%, ${whiteColor} 100%)`;
                },
              });
              tl.to(subtitleAnimationData, {
                whiteStop: 100,
                duration: 1.0,
                ease: 'sine.inOut',
                onUpdate: function() {
                  const whiteStop = subtitleAnimationData.whiteStop;
                  subtitleElement.style.backgroundImage = `linear-gradient(90deg, ${subtitleWhiteColor} ${whiteStop}%, ${subtitleGrayColor} 100%)`;
                },
              }, '<');
            } else if (progress < pathCompleteProgress) {
              if (boldTitleRef.current) {
                boldTitleRef.current.style.backgroundImage = '';
                boldTitleRef.current.style.backgroundClip = '';
                boldTitleRef.current.style.webkitBackgroundClip = '';
                boldTitleRef.current.style.webkitTextFillColor = '';
                boldTitleRef.current.style.color = '';
              }
              if (subtitleRef.current) {
                subtitleRef.current.style.color = `rgba(237, 237, 237, 0.20)`;
              }
              gradientAnimationStartedRef.current = false;
            }
          }
        },
      });
    }, section);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={sectionRef} className={styles.pathAnimationSection}>
      <div className={styles.pathTextContainer}>
        <p className={styles.pathText}>
          WACUS builds high-performance, responsive<br />
          platforms and <strong ref={bold1Ref} className={styles.pathTextBold}>custom-engineered</strong> systems.
        </p>
        <p className={styles.pathText}>
          We leverage cutting-edge technology to deliver robust,<br />
          <strong ref={bold2Ref} className={styles.pathTextBold2}>future-proof</strong> digital infrastructure.
        </p>
        <p className={styles.pathText}>
          Through continuous maintenance and advanced security<br />
          protocols, we ensure stable uptime and peak<br />
          performance for your <strong ref={bold3Ref} className={styles.pathTextBold3}>guaranteed business continuity.</strong>
        </p>
      </div>
      <svg 
        ref={svgRef}
        className={styles.svgPath}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <path
          ref={pathRef}
          className={styles.path}
        />
      </svg>
      <div className={styles.pathTitleContainer}>
        <h2 className={styles.pathTextTitle}>
          WACUS is a
          <strong ref={boldTitleRef} className={styles.pathTextBoldTitle}>digital growth</strong>
          agency.
        </h2>
        <p ref={subtitleRef} className={styles.pathTextSubtitle}>We bridge the gap between Korean innovation and U.S. market needs.</p>
      </div>
    </div>
  );
}
