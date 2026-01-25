'use client';

import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SlotSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// W를 만들기 위한 SVG 데이터
const slotSVGs = [
  // 첫 번째 컬럼: 왼쪽 부분
  {
    id: 'left',
    viewBox: '0 0 278 283',
    path: 'M180.307 282.486L236.049 121.014L277.645 0H189.936L140.816 181.754L90.6426 0H0L94.4789 282.486H180.307Z',
    width: 278,
    height: 283,
  },
  // 두 번째 컬럼: 오른쪽 부분
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

    // 초기 상태 설정: 모든 슬롯을 translateY(-100rem)로 설정
    const remValue = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const initialY = -100 * remValue; // -100rem을 px로 변환
    
    // 2번째 슬롯 아이템의 세로 중앙이 브라우저 세로 중앙과 일치하도록 targetY 계산
    const calculateTargetY = () => {
      if (typeof window === 'undefined' || !slotContainerRef.current) return 0;
      
      const remValue = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const slotItemHeight = 17.7 * remValue; // 17.7rem을 px로
      const slotGap = 4.4 * remValue; // 4.4rem을 px로
      
      // 브라우저 세로 중앙 (viewport 중앙)
      const browserCenterY = window.innerHeight / 2;
      
      // singleSlot 내에서 2번째 아이템의 중앙 위치 (singleSlot의 top 기준)
      // 첫 번째 아이템 높이 + gap + 두 번째 아이템 높이의 절반
      const secondItemCenterInSlot = slotItemHeight + slotGap + (slotItemHeight / 2);
      
      // 사용자 제안 방식: browserCenterY - (slotItemHeight + (slotItemHeight/2) + slotGap)
      // slotContainer가 viewport 중앙에 위치한다고 가정하고 직접 계산
      const targetY = browserCenterY - (slotItemHeight + (slotItemHeight / 2) + slotGap);
      
      console.log('2번째 아이템 중앙 계산 (브라우저 기준):', {
        innerHeight: window.innerHeight,
        browserCenterY,
        slotItemHeight,
        slotGap,
        secondItemCenterInSlot: slotItemHeight + slotGap + (slotItemHeight / 2),
        계산결과: browserCenterY - (slotItemHeight + (slotItemHeight / 2) + slotGap),
        targetY,
        계산식: `browserCenterY - (slotItemHeight + (slotItemHeight/2) + slotGap) = ${browserCenterY} - (${slotItemHeight} + ${slotItemHeight / 2} + ${slotGap}) = ${targetY}`
      });
      
      return targetY;
    };
    
    let targetY = calculateTargetY();
    
    gsap.set([slot1_1Ref.current, slot1_2Ref.current, slot2_1Ref.current, slot2_2Ref.current, slot3_1Ref.current, slot3_2Ref.current], {
      y: initialY,
      opacity: 0.4,
    });

    // 슬롯 애니메이션 함수
    const createSlotAnimations = (targetYValue: number) => {
      // 기존 ScrollTrigger 제거
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars?.trigger === sectionRef.current && 
            ['slot1_1', 'slot1_2', 'slot2_1', 'slot2_2', 'slot3_1', 'slot3_2'].includes(trigger.vars.id as string)) {
          trigger.kill();
        }
      });

      // slot1_1
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
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });

      // slot1_2
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
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });

      // slot2_1
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
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });

      // slot2_2
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
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });

      // slot3_1
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
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });

      // slot3_2
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
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });
    };
    
    // 초기 애니메이션 생성
    createSlotAnimations(targetY);
    
    // slotSectionInner를 pin으로 고정
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
    
    // 디버깅용 가이드라인 생성
    const createDebugLines = () => {
      // 기존 디버깅 라인 제거
      const existingRedLine = document.getElementById('debug-red-line');
      const existingWhiteLines = document.querySelectorAll('.debug-white-line');
      const existingBlueLine = document.getElementById('debug-blue-line');
      if (existingRedLine) existingRedLine.remove();
      existingWhiteLines.forEach(line => line.remove());
      if (existingBlueLine) existingBlueLine.remove();

      // 브라우저 중심부 빨간선
      const redLine = document.createElement('div');
      redLine.id = 'debug-red-line';
      redLine.style.position = 'fixed';
      redLine.style.top = '50%';
      redLine.style.left = '0';
      redLine.style.width = '100%';
      redLine.style.height = '2px';
      redLine.style.backgroundColor = 'red';
      redLine.style.zIndex = '9999';
      redLine.style.pointerEvents = 'none';
      document.body.appendChild(redLine);

      // 각 singleSlot의 2번째 아이템 중앙에 흰색선 생성
      const slots = [slot1_1Ref.current, slot1_2Ref.current, slot2_1Ref.current, slot2_2Ref.current, slot3_1Ref.current, slot3_2Ref.current];
      slots.forEach((slot, index) => {
        if (!slot || slot.children.length < 2) return;
        
        const secondItem = slot.children[1] as HTMLElement;
        if (!secondItem) return;

        const secondItemRect = secondItem.getBoundingClientRect();
        const secondItemCenterY = secondItemRect.top + (secondItemRect.height / 2);

        const whiteLine = document.createElement('div');
        whiteLine.className = 'debug-white-line';
        whiteLine.style.position = 'fixed';
        whiteLine.style.top = `${secondItemCenterY}px`;
        whiteLine.style.left = '0';
        whiteLine.style.width = '100%';
        whiteLine.style.height = '2px';
        whiteLine.style.backgroundColor = 'white';
        whiteLine.style.zIndex = '9998';
        whiteLine.style.pointerEvents = 'none';
        whiteLine.style.opacity = '0.8';
        document.body.appendChild(whiteLine);
      });

      // finalSVG의 세로 중앙에 파란선 생성
      if (finalSVGRef.current) {
        const finalSVGRect = finalSVGRef.current.getBoundingClientRect();
        const finalSVGCenterY = finalSVGRect.top + (finalSVGRect.height / 2);

        const blueLine = document.createElement('div');
        blueLine.id = 'debug-blue-line';
        blueLine.style.position = 'fixed';
        blueLine.style.top = `${finalSVGCenterY}px`;
        blueLine.style.left = '0';
        blueLine.style.width = '100%';
        blueLine.style.height = '2px';
        blueLine.style.backgroundColor = 'blue';
        blueLine.style.zIndex = '9997';
        blueLine.style.pointerEvents = 'none';
        blueLine.style.opacity = '0.8';
        document.body.appendChild(blueLine);
      }
    };

    // 리사이즈 이벤트 처리
    let currentTargetY = targetY;
    const handleResize = () => {
      const newTargetY = calculateTargetY();
      if (Math.abs(newTargetY - currentTargetY) > 1) { // 1px 이상 차이날 때만 업데이트
        currentTargetY = newTargetY;
        // 기존 ScrollTrigger 제거 후 재생성
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.vars?.trigger === sectionRef.current && 
              ['slot1_1', 'slot1_2', 'slot2_1', 'slot2_2', 'slot3_1', 'slot3_2'].includes(trigger.vars.id as string)) {
            trigger.kill();
          }
        });
        // 애니메이션 재생성
        createSlotAnimations(currentTargetY);
        ScrollTrigger.refresh();
      }
      // 디버깅 라인 업데이트 (약간의 지연 후)
      setTimeout(createDebugLines, 100);
    };
    
    window.addEventListener('resize', handleResize);

    // 초기 라인 생성
    createDebugLines();

    // 스크롤 시에도 라인 업데이트 (애니메이션으로 위치가 변하므로)
    const updateDebugLinesOnScroll = () => {
      requestAnimationFrame(createDebugLines);
    };
    window.addEventListener('scroll', updateDebugLinesOnScroll, { passive: true });

    // finalSVG path 그리기 애니메이션
    const path = finalPathRef.current;
    if (path && finalSVGRef.current) {
      const pathLength = path.getTotalLength();
      
      // 초기 상태 설정: finalSVG는 opacity 0, path는 보이지 않도록
      gsap.set(finalSVGRef.current, {
        opacity: 0,
      });
      
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      // path 그리기 애니메이션 설정
      const pathDrawStart = 220; // 시작 지점 (vh 단위) - 20vh 앞당김
      const pathDrawDuration = 100; // 그리기 지속 시간 (vh 단위)
      const pathFillDuration = 80; // 색상 채우기 지속 시간 (vh 단위)
      const totalAnimationVh = pathDrawStart + pathDrawDuration + pathFillDuration; // 400vh

      // finalSVG가 나타나는 애니메이션 (path 그리기 시작과 동시에)
      gsap.to(finalSVGRef.current, {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${pathDrawStart * gsapVh}px top`,
          end: `+=${10 * gsapVh}px`, // 10vh 동안 나타남
          scrub: true,
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });

      // 스크롤에 따라 path 그리기
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${pathDrawStart * gsapVh}px top`, // 시작 지점 조정 가능
          end: `+=${pathDrawDuration * gsapVh}px`, // 지속 시간 조정 가능
          scrub: true,
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });

      // path 그리기가 끝난 후 색상 채우기 애니메이션
      const pathFillStart = pathDrawStart + pathDrawDuration; // path 그리기가 끝나는 시점
      let fillCompleted = false;
      gsap.to(path, {
        attr: {
          fill: '#8840F4',
        },
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${pathFillStart * gsapVh}px top`, // path 그리기 완료 후 시작
          end: () => {
            // section의 실제 높이를 확인하여 end 지점 보장
            const sectionHeight = sectionRef.current?.offsetHeight || 0;
            const calculatedEnd = pathFillStart * gsapVh + pathFillDuration * gsapVh;
            // section 높이가 충분하지 않으면 section 끝까지 사용
            return sectionHeight > calculatedEnd ? `+=${pathFillDuration * gsapVh}px` : `bottom bottom`;
          },
          scrub: true,
          invalidateOnRefresh: true, // 리사이즈 시 재계산
          onUpdate: (self) => {
            if (self.progress >= 1 && !fillCompleted) {
              fillCompleted = true;
              console.log('색상 채우기 완료');
            }
          },
        },
      });


      // 색상이 다 채워진 후 column2Ref opacity 0으로
      if (column2Ref.current) {
        gsap.to(column2Ref.current, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `top+=${pathFillStart * gsapVh}px top`, // 색상 채우기 완료 후 시작
            end: `+=${50 * gsapVh}px`, // 10vh 동안
            scrub: true,
            invalidateOnRefresh: true, // 리사이즈 시 재계산
          },
        });
      }
    }

    // column1Ref opacity 애니메이션: 100vh 이후부터 40vh 동안 opacity 0으로
    if (column1Ref.current) {
      gsap.to(column1Ref.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${160 * gsapVh}px top`, // -20vh
          end: `+=${80 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });
    }

    // slot2_2의 첫 번째 아이템도 같은 타이밍에 opacity 0으로
    if (slot2_2Ref.current && slot2_2Ref.current.children.length > 0) {
      const slot2_2FirstItem = slot2_2Ref.current.children[0] as HTMLElement;
      if (slot2_2FirstItem) {
        gsap.to(slot2_2FirstItem, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `top+=${160 * gsapVh}px top`, // -20vh
            end: `+=${80 * gsapVh}px`,
            scrub: true,
            invalidateOnRefresh: true, // 리사이즈 시 재계산
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
          start: `top+=${160 * gsapVh}px top`, // -20vh
          end: `+=${80 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true, // 리사이즈 시 재계산
        },
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateDebugLinesOnScroll);
      // 디버깅 라인 제거
      const existingRedLine = document.getElementById('debug-red-line');
      const existingWhiteLines = document.querySelectorAll('.debug-white-line');
      const existingBlueLine = document.getElementById('debug-blue-line');
      if (existingRedLine) existingRedLine.remove();
      existingWhiteLines.forEach(line => line.remove());
      if (existingBlueLine) existingBlueLine.remove();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.trigger === sectionRef.current || trigger.vars?.id === 'slotSectionInnerPin') {
          trigger.kill();
        }
      });
    };
  }, [gsapVh]);

  return (
    <section ref={sectionRef} className={styles.slotSection}>
      <div className={styles.slotSectionInner}>
        <div ref={slotContainerRef} className={styles.slotContainer}>
          {/* 1번 컬럼: 1번 SVG 슬롯과 2번 SVG 슬롯이 가로로 나란히 */}
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
          {/* 2번 컬럼 */}
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
          {/* 3번 컬럼 */}
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
        {/* 최종 SVG */}
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
