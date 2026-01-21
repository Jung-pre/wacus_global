'use client';

import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeScene from './ThreeScene';
import WacusCube from './WacusCube';
import styles from './FeatureSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// FeatureSection용 카메라 설정 컴포넌트 (PathAnimation과 동일)
function CameraSetupPath() {
  const { camera } = useThree();
  
  useEffect(() => {
    // 카메라 위치 설정 (거리 4, 각도 유지)
    // 수평 각도: -35.92°, 수직 각도: 66.79°
    const targetDistance = 5;
    const azimuth = -35.92 * Math.PI / 180; // 수평 각도
    const polar = 66.79 * Math.PI / 180; // 수직 각도
    
    // 구면 좌표계를 직교 좌표계로 변환
    const x = targetDistance * Math.sin(polar) * Math.sin(azimuth);
    const y = targetDistance * Math.cos(polar);
    const z = targetDistance * Math.sin(polar) * Math.cos(azimuth);
    
    // 거리가 정확히 6이 되도록 정규화
    const currentDistance = Math.sqrt(x * x + y * y + z * z);
    const scale = targetDistance / currentDistance;
    
    camera.position.set(x * scale, y * scale, z * scale);
    // 타겟을 바라보도록 설정
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  
  return null;
}

export default function FeatureSection() {
  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const section3Ref = useRef<HTMLElement>(null);
  const text1Ref = useRef<HTMLParagraphElement>(null);
  const text2Ref = useRef<HTMLParagraphElement>(null);
  const text3Ref = useRef<HTMLParagraphElement>(null);
  const graphicContainer1Ref = useRef<HTMLDivElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const [cubeScrollProgress, setCubeScrollProgress] = useState(0);
  const initialPosRef = useRef<{ topRem: number; rightRem: number } | null>(null);

  useEffect(() => {
    const texts = [text1Ref, text2Ref, text3Ref];
    const sections = [section1Ref, section2Ref, section3Ref];

    // 초기 상태 설정 - 시작 상태: rgb(88, 88, 88) 100%, rgb(255, 255, 255) 100%
    texts.forEach((textRef) => {
      if (textRef.current) {
        const text = textRef.current;
        // 초기 그라데이션 설정 (시작 상태)
        const gradient = `linear-gradient(90deg, rgb(88, 88, 88) 100%, rgb(255, 255, 255) 100%)`;
        text.style.background = gradient;
        text.style.backgroundClip = 'text';
        text.style.webkitBackgroundClip = 'text';
        text.style.webkitTextFillColor = 'transparent';
        text.style.color = 'transparent';
      }
    });

    texts.forEach((textRef, index) => {
      if (!textRef.current || !sections[index].current) {
        console.warn(`Text or section ${index} not found`);
        return;
      }

      const text = textRef.current;
      const section = sections[index].current!;

      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        end: 'top 20%',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // 그라데이션 애니메이션: 시작 -> 중간 -> 끝
          // 시작: linear-gradient(90deg, rgb(88, 88, 88) 100%, rgb(255, 255, 255) 100%)
          // 중간: linear-gradient(90deg, rgb(88, 88, 88) 0%, rgb(255, 255, 255) 100%)
          // 끝: linear-gradient(90deg, rgb(88, 88, 88) 0%, rgb(255, 255, 255) 0%)
          
          const startColor = 'rgb(88, 88, 88)';
          const whiteColor = 'rgb(255, 255, 255)';
          
          if (progress <= 0) {
            // 시작 상태: linear-gradient(90deg, rgb(88, 88, 88) 100%, rgb(255, 255, 255) 100%)
            const gradient = `linear-gradient(90deg, ${startColor} 100%, ${whiteColor} 100%)`;
            text.style.background = gradient;
            text.style.backgroundClip = 'text';
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.color = 'transparent';
          } else if (progress < 0.5) {
            // 시작 -> 중간: rgb(88, 88, 88)의 stop이 100%에서 0%로 이동
            const startStop = 100 - (progress / 0.5) * 100; // 100% -> 0%
            const gradient = `linear-gradient(90deg, ${startColor} ${startStop}%, ${whiteColor} 100%)`;
            
            text.style.background = gradient;
            text.style.backgroundClip = 'text';
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.color = 'transparent';
          } else if (progress < 1) {
            // 중간 -> 끝: rgb(255, 255, 255)의 stop이 100%에서 0%로 이동
            const midProgress = (progress - 0.5) / 0.5; // 0 -> 1
            const whiteStop = 100 - (midProgress * 100); // 100% -> 0%
            const gradient = `linear-gradient(90deg, ${startColor} 0%, ${whiteColor} ${whiteStop}%)`;
            
            text.style.background = gradient;
            text.style.backgroundClip = 'text';
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.color = 'transparent';
          } else {
            // 끝 상태: rgb(88, 88, 88) 0%, rgb(255, 255, 255) 0%
            const gradient = `linear-gradient(90deg, ${startColor} 0%, ${whiteColor} 0%)`;
            text.style.background = gradient;
            text.style.backgroundClip = 'text';
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.color = 'transparent';
          }
        },
        onEnter: () => {
          // 섹션이 뷰포트에 들어올 때 시작 그라데이션 설정
          const gradient = `linear-gradient(90deg, rgb(88, 88, 88) 100%, rgb(255, 255, 255) 100%)`;
          text.style.background = gradient;
          text.style.backgroundClip = 'text';
          text.style.webkitBackgroundClip = 'text';
          text.style.webkitTextFillColor = 'transparent';
          text.style.color = 'transparent';
        },
        onLeaveBack: () => {
          // 섹션이 뷰포트를 벗어날 때 시작 상태로 복귀
          const gradient = `linear-gradient(90deg, rgb(88, 88, 88) 100%, rgb(255, 255, 255) 100%)`;
          text.style.background = gradient;
          text.style.backgroundClip = 'text';
          text.style.webkitBackgroundClip = 'text';
          text.style.webkitTextFillColor = 'transparent';
          text.style.color = 'transparent';
        },
      });
    });

    // 첫 번째 graphicContainer 스크롤 애니메이션
    // PathAnimation의 pathTextTitle strong 요소를 트리거로 사용
    // CSS 모듈 클래스명을 고려하여 pathTextTitle 내부의 strong 요소를 찾음
    const pathTextTitle = document.querySelector('[class*="pathTextTitle"]') as HTMLElement;
    const pathTextTitleStrong = pathTextTitle?.querySelector('strong') as HTMLElement;
    
    if (graphicContainer1Ref.current && pathTextTitleStrong && text1Ref.current && section1Ref.current) {
      const graphicContainer = graphicContainer1Ref.current;
      const textContainer = text1Ref.current;
      const section = section1Ref.current;
      
      // 초기 위치를 pathTextTitle strong의 중심에 맞춤 (rem 단위)
      // 좌표를 같은 기준(섹션 기준)으로 맞춰 차이값 기반으로 계산
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
      const strongRect = pathTextTitleStrong.getBoundingClientRect();
      const gcRect = graphicContainer.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect(); // graphicContainer의 기준 좌표
      const strongCenterY = strongRect.top + strongRect.height / 2;
      const strongCenterX = strongRect.left + strongRect.width / 2;
      // 섹션 기준으로 위치 계산: (strong 중심) - (섹션 top/left) - (그래픽 컨테이너 절반)
      const topPx = strongCenterY - sectionRect.top - gcRect.height / 2;
      const rightPx = sectionRect.right - strongCenterX - gcRect.width / 2;
      const initialTopRem = topPx / rootFontSize;
      const initialRightRem = rightPx / rootFontSize;
      initialPosRef.current = { topRem: initialTopRem, rightRem: initialRightRem };
      gsap.set(graphicContainer, {
        top: `${initialTopRem}rem`,
        right: `${initialRightRem}rem`,
        opacity: 0.7,
      });

      ScrollTrigger.create({
        trigger: pathTextTitleStrong,
        start: 'top 25%', // 요소가 화면 중앙을 넘었을 때 시작
        endTrigger: section, // textContainer가 있는 section을 end 트리거로 사용
        end: 'top 50%', // textContainer가 화면 중앙에 도달할 때 애니메이션 완료
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // 큐브 회전 진행도 업데이트
          setCubeScrollProgress(progress);
          
          const startTop = initialPosRef.current?.topRem ?? -63;
          const startRight = initialPosRef.current?.rightRem ?? 27;
          // top: 시작 위치 -> 0
          const top = startTop + (0 - startTop) * progress;
          // right: 시작 위치 -> 4.5rem
          const right = startRight + (4.5 - startRight) * progress;
          // opacity: 0.7 -> 1
          const opacity = 0.7 + (1 - 0.7) * progress;
          
          gsap.set(graphicContainer, {
            top: `${top}rem`,
            right: `${right}rem`,
            opacity: opacity,
          });
        },
        onEnter: () => {
          // 애니메이션 시작
        },
        onLeaveBack: () => {
          // 초기 상태로 복귀
          if (graphicContainer1Ref.current) {
            const startTop = initialPosRef.current?.topRem ?? -63;
            const startRight = initialPosRef.current?.rightRem ?? 27;
            gsap.set(graphicContainer1Ref.current, {
              top: `${startTop}rem`,
              right: `${startRight}rem`,
              opacity: 0.7,
            });
          }
        },
      });
    }

    // Section 2 video: 진입 시 무음 루프 재생, 이탈 시 일시정지
    if (section2Ref.current && video2Ref.current) {
      const video = video2Ref.current;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      ScrollTrigger.create({
        trigger: section2Ref.current,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => void video.play().catch(() => {}),
        onEnterBack: () => void video.play().catch(() => {}),
        onLeave: () => video.pause(),
        onLeaveBack: () => video.pause(),
      });
    }

    // Section 3 video: 진입 시 무음 루프 재생, 이탈 시 일시정지
    if (section3Ref.current && video3Ref.current) {
      const video = video3Ref.current;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      ScrollTrigger.create({
        trigger: section3Ref.current,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => void video.play().catch(() => {}),
        onEnterBack: () => void video.play().catch(() => {}),
        onLeave: () => video.pause(),
        onLeaveBack: () => video.pause(),
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger && 
            (trigger.vars.trigger === section1Ref.current || 
             trigger.vars.trigger === section2Ref.current ||
             trigger.vars.trigger === section3Ref.current)) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div className={styles.featureSection}>
      {/* Section 1: 텍스트 왼쪽, WACUS 큐브 오른쪽 */}
      <section ref={section1Ref} className={styles.featureItem}>
        <div className={styles.textContainer}>
          <p ref={text1Ref} className={styles.featureText}>
            We design your brand through<br/>
            user-centric web development
          </p>
        </div>
        <div ref={graphicContainer1Ref} className={styles.graphicContainer} data-graphic-container="1">
          <ThreeScene className={styles.cubeScene}>
            <ambientLight intensity={0.35} />
            <directionalLight position={[6, 6, 6]} intensity={1.1} />
            <directionalLight position={[-4, 2, 5]} intensity={0.6} />
            <directionalLight position={[0, 4, -6]} intensity={0.4} />
            {/* 카메라 위치 조정 - 거리 6, 각도 유지 */}
            <CameraSetupPath />
            <WacusCube 
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              scale={1.2}
              scrollProgress={cubeScrollProgress}
            />
          </ThreeScene>
        </div>
      </section>

      {/* Section 2: 복잡한 3D 추상 객체 왼쪽, 텍스트 오른쪽 */}
      <section ref={section2Ref} className={styles.featureItem}>
        <div className={styles.graphicContainer}>
          <video
            ref={video2Ref}
            className={styles.graphicVideo}
            src="/main/object_2.mp4"
            poster="/main/img_object02.png"
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
        <div className={styles.textContainer}>
          <p ref={text2Ref} className={styles.featureText}>
            We analyze website visitor<br/>journeys to execute better strategies.
          </p>
        </div>
      </section>

      {/* Section 3: 텍스트 왼쪽, 3D 프리즘과 궤도 링 오른쪽 */}
      <section ref={section3Ref} className={styles.featureItem}>
        <div className={styles.textContainer}>
          <p ref={text3Ref} className={styles.featureText}>
            We Build Strategically Consistent Websites<br/>That Amplify Your Brand Authority.
          </p>
        </div>
        <div className={styles.graphicContainer}>
          <video
            ref={video3Ref}
            className={styles.graphicVideo}
            src="/main/object_3.mp4"
            poster="/main/img_object03.png"
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      </section>
    </div>
  );
}
