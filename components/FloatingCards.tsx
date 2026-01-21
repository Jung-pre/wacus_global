'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './FloatingCards.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FloatingCardsProps {
  scrollTriggerRef?: React.RefObject<HTMLElement | null>;
}

export default function FloatingCards({ scrollTriggerRef }: FloatingCardsProps) {
  const gsapVh = useMemo(() => (typeof window !== 'undefined' ? window.innerHeight / 100 : 0), []);
  const router = useRouter();
  const cardCount = 8;
  const containerRef = useRef<HTMLDivElement>(null);
  const cardListRef = useRef<HTMLUListElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const lastAnimationCompleteRef = useRef(false);
  
  const radius = 35; // 원의 반지름 (vw 단위) - 분침의 길이

  useEffect(() => {
    if (!containerRef.current || !cardListRef.current || !scrollTriggerRef?.current) return;

    const container = containerRef.current;
    const cardList = cardListRef.current;
    const cardItems = cardList.querySelectorAll(`.${styles.cardItem}`);

    gsap.set(container, {
      opacity: 0,
      visibility: 'hidden',
      scale: 0.3,
      left: 0,
      top: 0,
      clearProps: 'transform',
    });

    cardItems.forEach((card, index) => {
      gsap.set(card, {
        opacity: index === 0 ? 1 : 0,
        scale: 1,
        transformOrigin: '50% 50%',
      });
      
      const cardDiv = card.firstElementChild as HTMLElement;
      if (cardDiv) {
        gsap.set(cardDiv, {
          top: '50%',
          scale: 0.3,
        });
      }
    });

    const textContainer = container.querySelector(`.${styles.textContainer}`) as HTMLElement;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scrollTriggerRef.current,
          start: () => `top -${55 * gsapVh}px`,
          end: () => `+=${100 * gsapVh}`,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self: any) => {
            const shouldBeComplete = self.progress >= 0.95;
            if (shouldBeComplete !== lastAnimationCompleteRef.current) {
              lastAnimationCompleteRef.current = shouldBeComplete;
              setIsAnimationComplete(shouldBeComplete);
            }
          },
        },
      });

      if (timeline.scrollTrigger?.progress >= 0.95) {
        setIsAnimationComplete(true);
      }

      timeline.to(container, {
        opacity: 1,
        visibility: 'visible',
        scale: 1,
        duration: 100,
        ease: 'power2.out',
      });
      
      cardItems.forEach((card) => {
        const cardDiv = card.firstElementChild as HTMLElement;
        if (cardDiv) {
          timeline.to(cardDiv, {
            top: '3vh',
            scale: 1,
            duration: 100,
            ease: 'power2.out',
          }, '<');
        }
      });

      const targetAngles = [0, -45, -90, -135, -180, -225, -270, -315];
      const rotationDuration = 800;

      timeline.to(cardItems, {
        rotation: (index) => targetAngles[index],
        opacity: 1,
        duration: (index) => {
          const angleProgress = Math.abs(targetAngles[index]) / 360;
          return rotationDuration * angleProgress;
        },
        ease: 'power2.inOut',
      }, '>');

      if (textContainer) {
        timeline.to(textContainer, {
          opacity: 1,
          duration: 100,
          ease: 'power2.out',
        }, '>');
      }

      ScrollTrigger.create({
        trigger: scrollTriggerRef.current,
        start: 'bottom bottom',
        end: 'bottom top',
        onEnter: () => {
          gsap.set(container, {
            position: 'absolute',
            top: 'auto',
            bottom: 0,
            left: 0,
          });
        },
        onEnterBack: () => {
          gsap.set(container, {
            position: 'absolute',
            top: 'auto',
            bottom: 0,
            left: 0,
          });
        },
        onLeaveBack: () => {
          gsap.set(container, {
            position: 'fixed',
            top: 0,
            bottom: 'auto',
            left: 0,
          });
        },
      });
    }, container);

    return () => {
      ctx.revert();
    };
  }, [scrollTriggerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const isInside = 
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isInside && isAnimationComplete) {
        setMousePosition({ x: e.clientX, y: e.clientY });
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isAnimationComplete]);

  const renderText = (text: string) => {
    return text.split('').map((char, index) => {
      const isUppercase = /[A-Z]/.test(char);
      return (
        <span key={index} className={isUppercase ? styles.uppercase : ''}>
          {char}
        </span>
      );
    });
  };

  const handleCardClick = (index: number) => {
    console.log(`Card ${index + 1} clicked`);
  };

  const handleCursorClick = () => {
    router.push('/work');
  };

  return (
    <>
      {isHovering && isAnimationComplete && (
        <span
          ref={cursorRef}
          className={styles.customCursor}
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
          }}
          onClick={handleCursorClick}
        />
      )}
      <div 
        ref={containerRef} 
        className={styles.container}
        style={{
          cursor: isHovering && isAnimationComplete ? 'none' : undefined,
        }}
      >
        <ul ref={cardListRef} className={styles.cardList}>
        {Array.from({ length: cardCount }, (_, index) => {
          return (
            <li 
              key={index} 
              className={styles.cardItem}
            >
              <div 
                className={styles.cardWrapper}
                onClick={() => handleCardClick(index)}
              >
                <Image
                  src={`/main/img_grob_card${String(index + 1).padStart(2, '0')}.png`}
                  alt={`Card ${index + 1}`}
                  width={300}
                  height={300}
                  className={styles.cardImage}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <div className={styles.textContainer}>
        <div className={styles.textContent}>
          <div className={styles.textLine}>
            {renderText('Web Action Clear')}
          </div>
          <div className={styles.textLine}>
            {renderText('User Success')}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
