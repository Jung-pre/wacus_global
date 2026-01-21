'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './CardFlipSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CardPair {
  front: number; // 홀수 (앞면)
  back: number;  // 짝수 (뒷면)
}

export default function CardFlipSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 카드 쌍 정의: 홀수가 앞, 짝수가 뒤 (5장)
  const cardPairs: CardPair[] = [
    { front: 1, back: 2 },
    { front: 3, back: 4 },
    { front: 5, back: 6 },
    { front: 7, back: 8 },
    { front: 9, back: 10 },
  ];
  
  // 각 카드의 z값 정의
  const cardZValues = [150, 45, 38, 15, 10];

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;
    const gsapVh = window.innerHeight / 100;
    const container = containerRef.current;
    const cardsContainer = container.querySelector(`.${styles.cardsContainer}`) as HTMLElement;
    const cardsGroup = container.querySelector(`.${styles.cardsGroup}`) as HTMLElement;
    
    if (!cardsContainer || !cardsGroup) return;

    const card1 = cardsContainer.querySelector(`.${styles.card}:first-child`) as HTMLElement;
    const cards2to5 = Array.from(cardsGroup.querySelectorAll(`.${styles.card}`)) as HTMLElement[];
    const allCards = [card1, ...cards2to5].filter(Boolean);

    const ctx = gsap.context(() => {
      // 초기 상태 설정
      gsap.set(container, {
        opacity: 1,
      });

      // cardsContainer 초기 상태 설정
      gsap.set(cardsContainer, {
        rotationX: 0,
        scale: 1.5, // 초기 스케일
        transformOrigin: 'center center',
      });

      // 스크롤에 따라 cardsContainer 회전 애니메이션
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${100 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(cardsContainer, {
        rotationX: 180,
        duration: 1,
        ease: 'none',
      });

      // 1번 카드 초기 상태 설정: translate(-50%, -50%) translate3d(0px, 0px, 150px)
      gsap.set(card1, {
        x: '-50%',
        y: '-50%',
        z: 150,
        transformOrigin: 'center center',
      });

      // 1번 카드: z값을 0으로, scale 확대 (회전이 90% 진행된 후 시작)
      timeline.to(card1, {
        z: 0,
        scale: 2.5,
        x: '-50%',
        y: '-50%',
        duration: 0.1,
        ease: 'none',
      }, 0.9); // 회전이 90% 진행된 후 시작

      // 확대가 완료된 후 플립섹션 opacity를 0으로
      timeline.to(container, {
        opacity: 0,
        duration: 0.1,
        ease: 'none',
      }, 1.0); // 확대 완료(1.0) 후 시작

      // 2-5번 카드: 입체적으로 산개 (회전이 40%부터 90%까지)
      cards2to5.forEach((card, index) => {
        const currentZ = cardZValues[index + 1]; // 2번: 45, 3번: 38, 4번: 15, 5번: 10
        const targetZ = currentZ + 200; // z값 증가
        
        // 각 카드마다 다른 방향으로 입체적으로 산개
        let spreadX = 0;
        let spreadY = 0;
        
        switch(index) {
          case 0: // 2번 카드: 왼쪽 위로
            spreadX = -700;
            spreadY = -400;
            break;
          case 1: // 3번 카드: 오른쪽 아래로
            spreadX = 700;
            spreadY = 400;
            break;
          case 2: // 4번 카드: 왼쪽 아래로
            spreadX = -600;
            spreadY = 500;
            break;
          case 3: // 5번 카드: 오른쪽 위로
            spreadX = 600;
            spreadY = -500;
            break;
        }
        
        timeline.to(card, {
          z: targetZ,
          x: `+=${spreadX}`,
          y: `+=${spreadY}`,
          filter: 'blur(10px)',
          duration: 0.5,
          ease: 'power2.out',
        }, 0.4); // 회전이 40%부터 90%까지 진행
      });

      // top 50vh부터 50vh 이동하는 동안 cardsContainer 스케일을 1로 줄이는 애니메이션
      
      gsap.to(cardsContainer, {
        scale: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top ${50 * gsapVh}px`,
          end: `+=${50 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // 각 카드 처리 - 크기만 설정
      allCards.forEach((card, index) => {
        if (!card) return;
        
        const cardInner = card.querySelector(`.${styles.cardInner}`) as HTMLElement;
        const firstImage = card.querySelector(`.${styles.cardImage}`) as HTMLImageElement;
        
        // 이미지가 로드된 후 크기만 설정
        const setupCard = () => {
          if (firstImage && firstImage.complete && firstImage.naturalWidth > 0) {
            const imgWidth = firstImage.naturalWidth;
            const imgHeight = firstImage.naturalHeight;
            
            if (cardInner) {
              // 2-5번 카드는 너비 480px로 고정
              if (index > 0) {
                const fixedWidth = 480;
                const aspectRatio = imgWidth / imgHeight;
                const fixedHeight = fixedWidth / aspectRatio;
                
                gsap.set(cardInner, {
                  width: fixedWidth,
                  height: fixedHeight,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                });
              } else {
                // 1번 카드는 원본 크기
                gsap.set(cardInner, {
                  width: imgWidth,
                  height: imgHeight,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                });
              }
            }
            
            // opacity만 설정
            gsap.set(card, {
              opacity: 1,
            });
          } else if (firstImage) {
            firstImage.onload = setupCard;
          }
        };
        
        setupCard();
      });
    }, container);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.cardFlipSection}>
      <div ref={containerRef} className={styles.container}>
        <div className={styles.cardsWrapper}>
          <div className={styles.cardsContainer}>
            {/* 1번 카드 */}
            <div className={styles.card}>
              <div className={styles.cardInner}>
                {/* 카드 앞면 (홀수) */}
                <div className={styles.cardFace}>
                  <img
                    src={`/main/img_works${String(cardPairs[0].front).padStart(2, '0')}.jpg`}
                    alt={`Card ${cardPairs[0].front} front`}
                    className={styles.cardImage}
                  />
                </div>
                {/* 카드 뒷면 (짝수) */}
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <img
                    src={`/main/img_works${String(cardPairs[0].back).padStart(2, '0')}.jpg`}
                    alt={`Card ${cardPairs[0].back} back`}
                    className={styles.cardImage}
                  />
                </div>
              </div>
            </div>
            {/* 2,3,4,5번 카드를 감싸는 div */}
            <div className={styles.cardsGroup}>
              {cardPairs.slice(1).map((pair, index) => (
                <div key={index + 1} className={styles.card}>
                  <div className={styles.cardInner}>
                    {/* 카드 앞면 (홀수) */}
                    <div className={styles.cardFace}>
                      <img
                        src={`/main/img_works${String(pair.front).padStart(2, '0')}.jpg`}
                        alt={`Card ${pair.front} front`}
                        className={styles.cardImage}
                      />
                    </div>
                    {/* 카드 뒷면 (짝수) */}
                    <div className={`${styles.cardFace} ${styles.cardBack}`}>
                      <img
                        src={`/main/img_works${String(pair.back).padStart(2, '0')}.jpg`}
                        alt={`Card ${pair.back} back`}
                        className={styles.cardImage}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
