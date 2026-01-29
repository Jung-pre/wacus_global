'use client';

import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SlotSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const slotSVGs = [
  {
    id: 'left',
    viewBox: '0 0 278 283',
    path: 'M180.307 282.486L236.049 121.014L277.645 0H189.936L140.816 181.754L90.6426 0H0L94.4789 282.486H180.307Z',
    width: 278,
    height: 283,
  },
  {
    id: 'right',
    viewBox: '0 0 227 283',
    path: 'M132.424 282.486L226.903 0H141.601L91.4278 182.732L41.7812 0L0 123.014L46.1441 282.486H132.424Z',
    width: 227,
    height: 283,
  },
];

export default function SlotSection() {
  const gsapVh = useMemo(() => (typeof window !== 'undefined' ? window.innerHeight / 100 : 0), []);

  const sectionRef = useRef<HTMLElement>(null);
  const slotContainerRef = useRef<HTMLDivElement>(null);
  const slot1_1Ref = useRef<HTMLDivElement>(null);
  const slot1_2Ref = useRef<HTMLDivElement>(null);
  const slot2_1Ref = useRef<HTMLDivElement>(null);
  const slot2_2Ref = useRef<HTMLDivElement>(null);
  const slot3_1Ref = useRef<HTMLDivElement>(null);
  const slot3_2Ref = useRef<HTMLDivElement>(null);
  const column1Ref = useRef<HTMLDivElement>(null);
  const column2Ref = useRef<HTMLDivElement>(null);
  const column3Ref = useRef<HTMLDivElement>(null);
  const finalSVGRef = useRef<HTMLDivElement>(null);
  const finalPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !slot1_1Ref.current || !slot1_2Ref.current ||
        !slot2_1Ref.current || !slot2_2Ref.current || !slot3_1Ref.current ||
        !slot3_2Ref.current || !finalSVGRef.current || !finalPathRef.current) return;

    if (typeof window === 'undefined' || !gsapVh) return;

    const updatePaddingBottom = () => {
      const contactSection = document.querySelector('[class*="contactSection"]') as HTMLElement;
      if (contactSection && sectionRef.current) {
        const contactHeight = contactSection.offsetHeight;
        sectionRef.current.style.paddingBottom = `${contactHeight}px`;
      }
    };

    updatePaddingBottom();
    setTimeout(updatePaddingBottom, 100);
    setTimeout(updatePaddingBottom, 500);

    const contactResizeObserver = new ResizeObserver(() => {
      updatePaddingBottom();
    });

    const observeContactSection = () => {
      const contactSection = document.querySelector('[class*="contactSection"]') as HTMLElement;
      if (contactSection) {
        contactResizeObserver.observe(contactSection);
        updatePaddingBottom();
      } else {
        setTimeout(observeContactSection, 100);
      }
    };

    observeContactSection();
    
    const handleResizeForPadding = () => {
      updatePaddingBottom();
    };
    window.addEventListener('resize', handleResizeForPadding);

    const checkColumnVisibility = () => {
      if (!slotContainerRef.current || !column1Ref.current || !column2Ref.current || !column3Ref.current) return;
      
      const remValue = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const columnWidth = 31.6 * remValue;
      const gap = 2 * remValue;
      const minWidthForThreeColumns = (columnWidth * 3) + (gap * 2);
      const containerWidth = slotContainerRef.current.offsetWidth;
      
      if (containerWidth < minWidthForThreeColumns) {
        column1Ref.current.style.display = 'none';
        column2Ref.current.style.display = 'flex';
        column3Ref.current.style.display = 'none';
        slotContainerRef.current.style.gridTemplateColumns = '1fr';
        slotContainerRef.current.style.justifyItems = 'center';
      } else {
        column1Ref.current.style.display = 'flex';
        column2Ref.current.style.display = 'flex';
        column3Ref.current.style.display = 'flex';
        slotContainerRef.current.style.gridTemplateColumns = 'repeat(3, 1fr)';
        slotContainerRef.current.style.justifyItems = 'center';
      }
    };

    checkColumnVisibility();

    const remValue = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const initialY = -100 * remValue;
    
    const calculateTargetY = () => {
      if (typeof window === 'undefined' || !slotContainerRef.current) return 0;
      
      const remValue = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const slotItemHeight = 17.7 * remValue;
      const slotGap = 4.4 * remValue;
      const browserCenterY = window.innerHeight / 2;
      const targetY = browserCenterY - (slotItemHeight + (slotItemHeight / 2) + slotGap);
      
      return targetY;
    };
    
    let targetY = calculateTargetY();
    
    gsap.set([slot1_1Ref.current, slot1_2Ref.current, slot2_1Ref.current, slot2_2Ref.current, slot3_1Ref.current, slot3_2Ref.current], {
      y: initialY,
      opacity: 0.4,
    });

    const createSlotAnimations = (targetYValue: number) => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars?.trigger === sectionRef.current && 
            ['slot1_1', 'slot1_2', 'slot2_1', 'slot2_2', 'slot3_1', 'slot3_2'].includes(trigger.vars.id as string)) {
          trigger.kill();
        }
      });
      gsap.to(slot1_1Ref.current, {
        y: targetYValue,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          id: 'slot1_1',
          trigger: sectionRef.current,
          start: `top+=${10 * gsapVh}px top`,
          end: `+=${120 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      gsap.to(slot1_2Ref.current, {
        y: targetYValue,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          id: 'slot1_2',
          trigger: sectionRef.current,
          start: `top+=${15 * gsapVh}px top`,
          end: `+=${120 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      gsap.to(slot2_1Ref.current, {
        y: targetYValue,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          id: 'slot2_1',
          trigger: sectionRef.current,
          start: `top+=${50 * gsapVh}px top`,
          end: `+=${120 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      gsap.to(slot2_2Ref.current, {
        y: targetYValue,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          id: 'slot2_2',
          trigger: sectionRef.current,
          start: `top+=${80 * gsapVh}px top`,
          end: `+=${120 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      gsap.to(slot3_1Ref.current, {
        y: targetYValue,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          id: 'slot3_1',
          trigger: sectionRef.current,
          start: `top+=${10 * gsapVh}px top`,
          end: `+=${120 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      gsap.to(slot3_2Ref.current, {
        y: targetYValue,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          id: 'slot3_2',
          trigger: sectionRef.current,
          start: `top+=${50 * gsapVh}px top`,
          end: `+=${120 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    };
    
    createSlotAnimations(targetY);
    
    const slotSectionInnerElement = sectionRef.current?.querySelector(`.${styles.slotSectionInner}`) as HTMLElement;
    if (slotSectionInnerElement && sectionRef.current) {
      ScrollTrigger.create({
        id: 'slotSectionInnerPin',
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${600 * gsapVh}px`,
        pin: slotSectionInnerElement,
        pinSpacing: true,
      });
    }
    
    let currentTargetY = targetY;
    const handleResize = () => {
      checkColumnVisibility();
      const newTargetY = calculateTargetY();
      if (Math.abs(newTargetY - currentTargetY) > 1) {
        currentTargetY = newTargetY;
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.vars?.trigger === sectionRef.current && 
              ['slot1_1', 'slot1_2', 'slot2_1', 'slot2_2', 'slot3_1', 'slot3_2'].includes(trigger.vars.id as string)) {
            trigger.kill();
          }
        });
        createSlotAnimations(currentTargetY);
      }
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars?.id === 'mainOnBody') {
          trigger.kill();
        }
      });
      createMainOnBodyTrigger();
      updatePaddingBottom();
      ScrollTrigger.refresh();
    };
    
    window.addEventListener('resize', handleResize);
    
    const resizeObserver = new ResizeObserver(() => {
      checkColumnVisibility();
    });
    
    if (slotContainerRef.current) {
      resizeObserver.observe(slotContainerRef.current);
    }

    const path = finalPathRef.current;
    if (path && finalSVGRef.current) {
      const pathLength = path.getTotalLength();
      
      gsap.set(finalSVGRef.current, {
        opacity: 0,
      });
      
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      const pathDrawStart = 220;
      const pathDrawDuration = 100;
      const pathFillDuration = 80;
      const totalAnimationVh = pathDrawStart + pathDrawDuration + pathFillDuration;
      gsap.to(finalSVGRef.current, {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${pathDrawStart * gsapVh}px top`,
          end: `+=${10 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${pathDrawStart * gsapVh}px top`,
          end: `+=${pathDrawDuration * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const pathFillStart = pathDrawStart + pathDrawDuration;
      let fillCompleted = false;
      gsap.to(path, {
        attr: {
          fill: '#8840F4',
        },
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${pathFillStart * gsapVh}px top`,
          end: () => {
            const sectionHeight = sectionRef.current?.offsetHeight || 0;
            const calculatedEnd = pathFillStart * gsapVh + pathFillDuration * gsapVh;
            return sectionHeight > calculatedEnd ? `+=${pathFillDuration * gsapVh}px` : `bottom bottom`;
          },
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress >= 1 && !fillCompleted) {
              fillCompleted = true;
            }
          },
        },
      });
      if (column2Ref.current) {
        gsap.to(column2Ref.current, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `top+=${pathFillStart * gsapVh}px top`,
            end: `+=${50 * gsapVh}px`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }
    }

    if (column1Ref.current) {
      gsap.to(column1Ref.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${160 * gsapVh}px top`,
          end: `+=${80 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }
    if (slot2_2Ref.current && slot2_2Ref.current.children.length > 0) {
      const slot2_2FirstItem = slot2_2Ref.current.children[0] as HTMLElement;
      if (slot2_2FirstItem) {
        gsap.to(slot2_2FirstItem, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `top+=${160 * gsapVh}px top`,
            end: `+=${80 * gsapVh}px`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }
    }
    if (column3Ref.current) {
      gsap.to(column3Ref.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${160 * gsapVh}px top`,
          end: `+=${80 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }

    const createMainOnBodyTrigger = () => {
      const currentGsapVh = window.innerHeight / 100;
      ScrollTrigger.create({
        id: 'mainOnBody',
        trigger: sectionRef.current,
        start: `top+=${500 * currentGsapVh}px top`,
        onEnter: () => {
          const mainElement = document.querySelector('main');
          if (mainElement) {
            mainElement.classList.add('onBody');
          }
        },
        onLeaveBack: () => {
          const mainElement = document.querySelector('main');
          if (mainElement) {
            mainElement.classList.remove('onBody');
          }
        },
        invalidateOnRefresh: true,
      });
    };

    createMainOnBodyTrigger();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResizeForPadding);
      if (slotContainerRef.current) {
        resizeObserver.unobserve(slotContainerRef.current);
      }
      const contactSection = document.querySelector('[class*="contactSection"]') as HTMLElement;
      if (contactSection) {
        contactResizeObserver.unobserve(contactSection);
      }
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.trigger === sectionRef.current || 
            trigger.vars?.id === 'slotSectionInnerPin' || 
            trigger.vars?.id === 'mainOnBody') {
          trigger.kill();
        }
      });
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.id === 'mainOnBody') {
          trigger.kill();
        }
      });
    };
  }, [gsapVh]);

  return (
    <section ref={sectionRef} className={styles.slotSection}>
      <div className={styles.slotSectionInner}>
        <div ref={slotContainerRef} className={styles.slotContainer}>
          <div ref={column1Ref} className={styles.slotColumn}>
            <div ref={slot1_1Ref} className={`${styles.singleSlot} ${styles.slot1_1}`}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[0].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[0].path} />
                  </svg>
                </div>
              ))}
            </div>
            <div ref={slot1_2Ref} className={`${styles.singleSlot} ${styles.slot1_2}`}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[1].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[1].path} />
                  </svg>
                </div>
              ))}
            </div>
          </div>
          <div ref={column2Ref} className={styles.slotColumn}>
            <div ref={slot2_1Ref} className={`${styles.singleSlot} ${styles.slot2_1}`}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[0].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[0].path} />
                  </svg>
                </div>
              ))}
            </div>
            <div ref={slot2_2Ref} className={`${styles.singleSlot} ${styles.slot2_2}`}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[1].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[1].path} />
                  </svg>
                </div>
              ))}
            </div>
          </div>
          <div ref={column3Ref} className={styles.slotColumn}>
            <div ref={slot3_1Ref} className={`${styles.singleSlot} ${styles.slot3_1}`}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[0].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[0].path} />
                  </svg>
                </div>
              ))}
            </div>
            <div ref={slot3_2Ref} className={`${styles.singleSlot} ${styles.slot3_2}`}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[1].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[1].path} />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div ref={finalSVGRef} className={styles.finalSVG}>
          <svg xmlns="http://www.w3.org/2000/svg" width="978" height="597" viewBox="0 0 978 597" fill="none">
            <path 
              ref={finalPathRef}
              d="M1.38867 1H190.801L296.633 384.381L297.607 387.91L298.562 384.376L402.171 1H586.003L690.726 386.444L691.685 389.978L692.654 386.446L798.487 1H976.611L777.61 596H596.722L489 255.352L488.042 252.322L487.092 255.354L380.323 596H200.39Z" 
              fill="none" 
              stroke="#8840F4" 
              strokeWidth="4"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
