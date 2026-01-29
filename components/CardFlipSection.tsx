'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './CardFlipSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CardPair {
  front: number;
  back: number;
}

export default function CardFlipSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const cardPairs: CardPair[] = [
    { front: 1, back: 2 },
    { front: 3, back: 4 },
    { front: 5, back: 6 },
    { front: 7, back: 8 },
    { front: 9, back: 10 },
  ];
  
  const cardZValues = [150, 45, 38, 15, 10];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 769);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getImageSrc = (cardNumber: number) => {
    if (isMobile && (cardNumber === 1 || cardNumber === 2)) {
      return `/main/img_works${String(cardNumber).padStart(2, '0')}_m.jpg`;
    }
    return `/main/img_works${String(cardNumber).padStart(2, '0')}.jpg`;
  };

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
      const currentIsMobile = window.innerWidth < 769;
      const initialScale = currentIsMobile ? 1.6 : 1.5;
      const finalScale = currentIsMobile ? 1.6 : 2.5;

      ScrollTrigger.create({
        id: 'cardFlipPin',
        trigger: sectionRef.current,
        start: () => `top ${10 * gsapVh}px`,
        end: () => `+=${150 * gsapVh}px`,
        pin: container,
      });

      gsap.set(container, {
        opacity: 1,
      });

      gsap.set(cardsContainer, {
        rotationX: 0,
        scale: initialScale,
        transformOrigin: 'center center',
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${150 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(cardsContainer, {
        rotationX: 180,
        duration: 1,
        ease: 'none',
      });

      gsap.set(card1, {
        x: '-50%',
        y: '-50%',
        z: 150,
        transformOrigin: 'center center',
      });

      timeline.to(card1, {
        z: 0,
        scale: finalScale,
        x: '-50%',
        y: '-50%',
        duration: 0.1,
        ease: 'none',
      }, 0.9);

      timeline.to(container, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, 1.0);

      cards2to5.forEach((card, index) => {
        const currentZ = cardZValues[index + 1];
        const targetZ = currentZ + 200;
        
        let spreadX = 0;
        let spreadY = 0;
        
        switch(index) {
          case 0:
            spreadX = -700;
            spreadY = -400;
            break;
          case 1:
            spreadX = 700;
            spreadY = 400;
            break;
          case 2:
            spreadX = -600;
            spreadY = 500;
            break;
          case 3:
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
        }, 0.4);
      });

      const targetScale = currentIsMobile ? 2.2 : 1.0;
      gsap.to(cardsContainer, {
        scale: targetScale,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top ${50 * gsapVh}px`,
          end: `+=${75 * gsapVh}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      allCards.forEach((card, index) => {
        if (!card) return;
        
        const cardInner = card.querySelector(`.${styles.cardInner}`) as HTMLElement;
        const firstImage = card.querySelector(`.${styles.cardImage}`) as HTMLImageElement;
        
        const setupCard = () => {
          const currentIsMobile = window.innerWidth < 769;
          
          if (firstImage && firstImage.complete && firstImage.naturalWidth > 0) {
            const imgWidth = firstImage.naturalWidth;
            const imgHeight = firstImage.naturalHeight;
            
            if (cardInner) {
              if (index === 0 && currentIsMobile) {
                const mobileWidth = 17.5 * 16;
                const mobileHeight = 37.875 * 16;
                
                gsap.set(cardInner, {
                  width: mobileWidth,
                  height: mobileHeight,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                });
              } else if (index > 0) {
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
                gsap.set(cardInner, {
                  width: imgWidth,
                  height: imgHeight,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                });
              }
            }
            
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
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.id === 'cardFlipPin') {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.cardFlipSection}>
      <div ref={containerRef} className={styles.container}>
        <div className={styles.cardsWrapper}>
          <div className={styles.cardsContainer}>
            <div className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.cardFace}>
                  <img
                    src={getImageSrc(cardPairs[0].front)}
                    alt={`Card ${cardPairs[0].front} front`}
                    className={styles.cardImage}
                  />
                </div>
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <img
                    src={getImageSrc(cardPairs[0].back)}
                    alt={`Card ${cardPairs[0].back} back`}
                    className={styles.cardImage}
                  />
                </div>
              </div>
            </div>
            <div className={styles.cardsGroup}>
              {cardPairs.slice(1).map((pair, index) => (
                <div key={index + 1} className={styles.card}>
                  <div className={styles.cardInner}>
                    <div className={styles.cardFace}>
                      <img
                        src={`/main/img_works${String(pair.front).padStart(2, '0')}.jpg`}
                        alt={`Card ${pair.front} front`}
                        className={styles.cardImage}
                      />
                    </div>
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
