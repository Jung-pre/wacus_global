'use client';

import Image from 'next/image';
import styles from './FloatingCards.module.css';

interface FloatingCardsProps {
  scrollTriggerRef?: React.RefObject<HTMLElement | null>;
}

export default function FloatingCards({ scrollTriggerRef }: FloatingCardsProps) {
  const cardCount = 8;
  
  // 시계 방향 배치: 12시부터 시작
  // CSS 좌표계 기준: 0도=오른쪽(3시), 90도=아래(6시), 180도=왼쪽(9시), 270도=위(12시)
  // 시계 방향 각도: 12시=270도, 10시30분=315도, 9시=180도, 7시30분=225도, 6시=90도, 4시30분=135도, 3시=0도, 1시30분=30도
  const positions = [
    { angle: 270 },  // 1번: 12시 (위쪽)
    { angle: 315 }, // 2번: 10시30분 (오른쪽 위)
    { angle: 180 }, // 3번: 9시 (왼쪽)
    { angle: 225 }, // 4번: 7시30분 (왼쪽 아래)
    { angle: 90 },  // 5번: 6시 (아래)
    { angle: 135 }, // 6번: 4시30분 (오른쪽 아래)
    { angle: 0 },   // 7번: 3시 (오른쪽)
    { angle: 30 },  // 8번: 1시30분 (오른쪽 위)
  ];
  
  const radius = 35; // 원의 반지름 (vw 단위)

  return (
    <div className={styles.container}>
      <ul className={styles.cardList}>
        {Array.from({ length: cardCount }, (_, index) => {
          const pos = positions[index];
          const angleRad = pos.angle * (Math.PI / 180);
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;
          
          return (
            <li 
              key={index} 
              className={styles.cardItem}
              style={{
                left: `${50 + x}%`,
                top: `${50 + y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className={styles.cardWrapper}>
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
    </div>
  );
}
