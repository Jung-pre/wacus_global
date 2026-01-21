'use client';

import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SlotSection.module.css';

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
  // 각 컬럼의 1번 슬롯과 2번 슬롯 ref
  const slot1_1Ref = useRef<HTMLDivElement>(null); // 1번 컬럼의 1번 SVG 슬롯
  const slot1_2Ref = useRef<HTMLDivElement>(null); // 1번 컬럼의 2번 SVG 슬롯
  const slot2_1Ref = useRef<HTMLDivElement>(null); // 2번 컬럼의 1번 SVG 슬롯
  const slot2_2Ref = useRef<HTMLDivElement>(null); // 2번 컬럼의 2번 SVG 슬롯
  const slot3_1Ref = useRef<HTMLDivElement>(null); // 3번 컬럼의 1번 SVG 슬롯
  const slot3_2Ref = useRef<HTMLDivElement>(null); // 3번 컬럼의 2번 SVG 슬롯
  // 컬럼 ref
  const column1Ref = useRef<HTMLDivElement>(null);
  const column2Ref = useRef<HTMLDivElement>(null);
  const column3Ref = useRef<HTMLDivElement>(null);
  // 최종 SVG ref
  const finalSVGRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slot1_1Ref.current || !slot1_2Ref.current || 
        !slot2_1Ref.current || !slot2_2Ref.current ||
        !slot3_1Ref.current || !slot3_2Ref.current ||
        !sectionRef.current || !column1Ref.current ||
        !column2Ref.current || !column3Ref.current ||
        !slotContainerRef.current ||
        !finalSVGRef.current) return;

    // 실제 렌더링된 아이템의 높이를 가져옴
    const firstItem1 = slot1_1Ref.current.querySelector(`.${styles.slotItem}`) as HTMLElement;
    const firstItem2 = slot1_2Ref.current.querySelector(`.${styles.slotItem}`) as HTMLElement;
    
    if (!firstItem1 || !firstItem2) return;

    const itemHeight = firstItem1.offsetHeight; // 실제 렌더링된 높이
    const totalItems1 = 15; // 1번 컬럼 아이템 수
    const totalItems2 = 15; // 2번, 3번 컬럼 아이템 수
    
    // 컨테이너 높이 가져오기 (빈 화면 계산용)
    const container = sectionRef.current.querySelector(`.${styles.slotContainer}`) as HTMLElement;
    const containerHeight = container ? container.offsetHeight : 0;
    
    // 1번 컬럼 설정
    const totalHeight1 = itemHeight * totalItems1;
    slot1_1Ref.current.style.height = `${totalHeight1}px`;
    slot1_2Ref.current.style.height = `${totalHeight1}px`;

    // 2번 컬럼 설정
    const totalHeight2 = itemHeight * totalItems2;
    slot2_1Ref.current.style.height = `${totalHeight2}px`;
    slot2_2Ref.current.style.height = `${totalHeight2}px`;

    // 3번 컬럼 설정
    slot3_1Ref.current.style.height = `${totalHeight2}px`;
    slot3_2Ref.current.style.height = `${totalHeight2}px`;

    // 모든 슬롯을 0까지 당기기 (첫 번째 아이템이 보이도록)
    const targetOffset = 0; // 최종 위치는 0
    // 여러 바퀴를 돌기 위해 시작 위치를 더 위로 설정 (10바퀴 정도)
    const spinRounds1 = 10; // 1번 컬럼 회전 횟수
    const spinRounds2 = 12; // 2번, 3번 컬럼 회전 횟수
    const startOffset1 = -itemHeight * spinRounds1; // 여러 바퀴를 돌기 위한 시작 위치
    const startOffset2 = -itemHeight * spinRounds2; // 여러 바퀴를 돌기 위한 시작 위치

    // 초기 위치 설정
    gsap.set(slot1_1Ref.current, { y: startOffset1 });
    gsap.set(slot1_2Ref.current, { y: startOffset1 });
    gsap.set(slot2_1Ref.current, { y: startOffset2 });
    gsap.set(slot2_2Ref.current, { y: startOffset2 });
    gsap.set(slot3_1Ref.current, { y: startOffset2 });
    gsap.set(slot3_2Ref.current, { y: startOffset2 });
    gsap.set(finalSVGRef.current, { opacity: 0, scale: 1, transformOrigin: '50% 24%' });

    // 2번째 아이템을 제외한 모든 아이템 수집
    const allSlots = [
      slot1_1Ref.current,
      slot1_2Ref.current,
      slot2_1Ref.current,
      slot2_2Ref.current,
      slot3_1Ref.current,
      slot3_2Ref.current,
    ];

    const nonSecondItems: HTMLElement[] = [];
    allSlots.forEach((slot) => {
      if (!slot) return;
      const items = slot.querySelectorAll(`.${styles.slotItem}`);
      items.forEach((item, index) => {
        // 2번째 아이템이 아니고, 화면에 보이는 아이템(0, 1, 2번)만 opacity 적용
        if (index !== 1 && index < 3) {
          nonSecondItems.push(item as HTMLElement);
        }
      });
    });

    // ScrollTrigger 설정
    gsap.registerPlugin(ScrollTrigger);
    const finalPath = finalSVGRef.current.querySelector('path');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${250 * gsapVh}`,
        scrub: 2, // 성능 최적화: 업데이트 빈도 감소 (1 -> 2)
        invalidateOnRefresh: true,
      },
    });

    // 모든 모션을 타임라인에 추가 (기존 순서 유지)
    // 1. 슬롯들이 위로 올라갔다가 0으로 내려옴 (각각 다른 delay)
    // force3D: true로 하드웨어 가속 강제
    tl.to(slot1_1Ref.current, { y: startOffset1, duration: 0.1, ease: 'none', force3D: true }, 0)
      .to(slot1_1Ref.current, { y: targetOffset, duration: 3.5, ease: 'power2.out', force3D: true }, 0.1)
      .to(slot1_2Ref.current, { y: startOffset1, duration: 0.1, ease: 'none', force3D: true }, 0.15)
      .to(slot1_2Ref.current, { y: targetOffset, duration: 3.7, ease: 'power2.out', force3D: true }, 0.25)
      .to(slot2_1Ref.current, { y: startOffset2, duration: 0.1, ease: 'none', force3D: true }, 0.3)
      .to(slot2_1Ref.current, { y: targetOffset, duration: 3.5, ease: 'power2.out', force3D: true }, 0.4)
      .to(slot2_2Ref.current, { y: startOffset2, duration: 0.1, ease: 'none', force3D: true }, 0.45)
      .to(slot2_2Ref.current, { y: targetOffset, duration: 3.7, ease: 'power2.out', force3D: true }, 0.55)
      .to(slot3_1Ref.current, { y: startOffset2, duration: 0.1, ease: 'none', force3D: true }, 0.6)
      .to(slot3_1Ref.current, { y: targetOffset, duration: 3.5, ease: 'power2.out', force3D: true }, 0.7)
      .to(slot3_2Ref.current, { y: startOffset2, duration: 0.1, ease: 'none', force3D: true }, 0.75)
      .to(slot3_2Ref.current, { y: targetOffset, duration: 3.7, ease: 'power2.out', force3D: true }, 0.85)
      // 2. nonSecondItems opacity 0 (슬롯 애니메이션 완료 후)
      .to(nonSecondItems, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.02,
        force3D: true, // 하드웨어 가속
      }, 4.6)
      // 3. column1, column3 opacity 0 (delay 0.5)
      .to(column1Ref.current, { opacity: 0, duration: 0.5, ease: 'power2.out', force3D: true }, 5.1)
      .to(column3Ref.current, { opacity: 0, duration: 0.5, ease: 'power2.out', force3D: true }, 5.1)
      // 4. column2 transform-origin 설정 및 확대
      .set(column2Ref.current, { transformOrigin: '50% 9.5%' }, 5.1)
      .to(column2Ref.current, {
        scaleX: 2.16,
        scaleY: 2.17,
        duration: 1,
        ease: 'power2.out',
        force3D: true, // 하드웨어 가속
      }, 5.6)
      // 5. finalSVG opacity 1 + slotContainer opacity 0
      .to(finalSVGRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out', force3D: true }, 6.6)
      .to(slotContainerRef.current, { opacity: 0, duration: 0.5, ease: 'power2.out', force3D: true }, 6.6)
      // 6. finalPath fill 변경
      .to(finalPath, {
        attr: { fill: '#8840F4' },
        duration: 0.6,
        ease: 'power2.out',
      }, 7.1)
      // 7. finalSVG transform-origin 변경 및 scale 10
      .set(finalSVGRef.current, { transformOrigin: '50% 24%' }, 7.1)
      .to(finalSVGRef.current, { scale: 10, duration: 0.8, ease: 'power2.inOut', force3D: true }, 7.1)
      // 8. column2 opacity 0
      .to(column2Ref.current, { opacity: 0, duration: 0.3, ease: 'power2.out', force3D: true }, 7.9);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [gsapVh]);

  return (
    <section ref={sectionRef} className={styles.slotSection}>
      <div className={styles.slotSectionInner}>
        <div ref={slotContainerRef} className={styles.slotContainer}>
          {/* 1번 컬럼: 1번 SVG 슬롯과 2번 SVG 슬롯이 가로로 나란히 */}
          <div ref={column1Ref} className={styles.slotColumn}>
          <div ref={slot1_1Ref} className={styles.singleSlot}>
            {Array.from({ length: 15 }, (_, i) => {
              // 기본 색상: #141414
              // 정답(2번째, i === 1)만: #2C2C2C
              // 중간중간에 #0B0B0B (빠진 것처럼)
              let fillColor = '#141414'; // 기본 색상
              if (i === 1) {
                fillColor = '#2C2C2C'; // 정답만
              } else if (i > 2 && (i % 2 === 0 || i % 5 === 0)) {
                fillColor = '#0B0B0B'; // 중간중간 빠진 것처럼 (4번부터)
              }
              return (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[0].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[0].path} fill={fillColor} />
                  </svg>
                </div>
              );
            })}
          </div>
          <div ref={slot1_2Ref} className={styles.singleSlot}>
            {Array.from({ length: 15 }, (_, i) => {
              // 기본 색상: #141414
              // 정답(2번째, i === 1)만: #2C2C2C
              // 중간중간에 #0B0B0B (빠진 것처럼)
              let fillColor = '#141414'; // 기본 색상
              if (i === 1) {
                fillColor = '#2C2C2C'; // 정답만
              } else if (i > 2 && (i % 2 === 0 || i % 5 === 0)) {
                fillColor = '#0B0B0B'; // 중간중간 빠진 것처럼 (4번부터)
              }
              return (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[1].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[1].path} fill={fillColor} />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
        {/* 2번 컬럼 */}
        <div ref={column2Ref} className={styles.slotColumn}>
          <div ref={slot2_1Ref} className={styles.singleSlot}>
            {Array.from({ length: 15 }, (_, i) => {
              // 기본 색상: #141414
              // 정답(2번째, i === 1)만: #2C2C2C
              // 중간중간에 #0B0B0B (빠진 것처럼)
              let fillColor = '#141414'; // 기본 색상
              if (i === 1) {
                fillColor = '#2C2C2C'; // 정답만
              } else if (i > 2 && (i % 2 === 0 || i % 5 === 0)) {
                fillColor = '#0B0B0B'; // 중간중간 빠진 것처럼 (4번부터)
              }
              return (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[0].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[0].path} fill={fillColor} />
                  </svg>
                </div>
              );
            })}
          </div>
          <div ref={slot2_2Ref} className={styles.singleSlot}>
            {Array.from({ length: 15 }, (_, i) => {
              // 기본 색상: #141414
              // 정답(2번째, i === 1)만: #2C2C2C
              // 중간중간에 #0B0B0B (빠진 것처럼)
              let fillColor = '#141414'; // 기본 색상
              if (i === 1) {
                fillColor = '#2C2C2C'; // 정답만
              } else if (i > 2 && (i % 2 === 0 || i % 5 === 0)) {
                fillColor = '#0B0B0B'; // 중간중간 빠진 것처럼 (4번부터)
              }
              return (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[1].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[1].path} fill={fillColor} />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
        {/* 3번 컬럼 */}
        <div ref={column3Ref} className={styles.slotColumn}>
          <div ref={slot3_1Ref} className={styles.singleSlot}>
            {Array.from({ length: 15 }, (_, i) => {
              // 기본 색상: #141414
              // 정답(2번째, i === 1)만: #2C2C2C
              // 중간중간에 #0B0B0B (빠진 것처럼)
              let fillColor = '#141414'; // 기본 색상
              if (i === 1) {
                fillColor = '#2C2C2C'; // 정답만
              } else if (i > 2 && (i % 2 === 0 || i % 5 === 0)) {
                fillColor = '#0B0B0B'; // 중간중간 빠진 것처럼 (4번부터)
              }
              return (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[0].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[0].path} fill={fillColor} />
                  </svg>
                </div>
              );
            })}
          </div>
          <div ref={slot3_2Ref} className={styles.singleSlot}>
            {Array.from({ length: 15 }, (_, i) => {
              // 기본 색상: #141414
              // 정답(2번째, i === 1)만: #2C2C2C
              // 중간중간에 #0B0B0B (빠진 것처럼)
              let fillColor = '#141414'; // 기본 색상
              if (i === 1) {
                fillColor = '#2C2C2C'; // 정답만
              } else if (i > 2 && (i % 2 === 0 || i % 5 === 0)) {
                fillColor = '#0B0B0B'; // 중간중간 빠진 것처럼 (4번부터)
              }
              return (
                <div key={i} className={styles.slotItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={slotSVGs[1].viewBox}
                    fill="none"
                    className={styles.slotSVG}
                    shapeRendering="optimizeSpeed"
                  >
                    <path d={slotSVGs[1].path} fill={fillColor} />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
        </div>
        {/* 최종 SVG */}
        <div ref={finalSVGRef} className={styles.finalSVG}>
          <svg xmlns="http://www.w3.org/2000/svg" width="978" height="597" viewBox="0 0 978 597" fill="none">
            <path d="M190.801 1L296.633 384.381L297.607 387.91L298.562 384.376L402.171 1H586.003L690.726 386.444L691.685 389.978L692.654 386.446L798.487 1H976.611L777.61 596H596.722L489 255.352L488.042 252.322L487.092 255.354L380.323 596H200.39L1.38867 1H190.801Z" fill="#0B0B0B" stroke="#8840F4" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
