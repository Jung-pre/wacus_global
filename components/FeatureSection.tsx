'use client';

import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeScene from '@/components/ThreeScene';
import WacusCube from '@/components/WacusCube';
import styles from './FeatureSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function CameraSetupPath() {
  const { camera } = useThree();
  
  useEffect(() => {
    const targetDistance = 13;
    const azimuth = -35.92 * Math.PI / 180;
    const polar = 66.79 * Math.PI / 180;
    
    const x = targetDistance * Math.sin(polar) * Math.sin(azimuth);
    const y = targetDistance * Math.cos(polar);
    const z = targetDistance * Math.sin(polar) * Math.cos(azimuth);
    
    const currentDistance = Math.sqrt(x * x + y * y + z * z);
    const scale = targetDistance / currentDistance;
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 35;
      camera.near = 0.1;
      camera.far = 1000;
    }
    
    camera.position.set(x * scale, y * scale, z * scale);
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

    texts.forEach((textRef) => {
      if (textRef.current) {
        const text = textRef.current;
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
          
          const startColor = 'rgb(88, 88, 88)';
          const whiteColor = 'rgb(255, 255, 255)';
          
          if (progress <= 0) {
            const gradient = `linear-gradient(90deg, ${startColor} 100%, ${whiteColor} 100%)`;
            text.style.background = gradient;
            text.style.backgroundClip = 'text';
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.color = 'transparent';
          } else if (progress < 0.5) {
            const startStop = 100 - (progress / 0.5) * 100;
            const gradient = `linear-gradient(90deg, ${startColor} ${startStop}%, ${whiteColor} 100%)`;
            
            text.style.background = gradient;
            text.style.backgroundClip = 'text';
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.color = 'transparent';
          } else if (progress < 1) {
            const midProgress = (progress - 0.5) / 0.5;
            const whiteStop = 100 - (midProgress * 100);
            const gradient = `linear-gradient(90deg, ${startColor} 0%, ${whiteColor} ${whiteStop}%)`;
            
            text.style.background = gradient;
            text.style.backgroundClip = 'text';
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.color = 'transparent';
          } else {
            const gradient = `linear-gradient(90deg, ${startColor} 0%, ${whiteColor} 0%)`;
            text.style.background = gradient;
            text.style.backgroundClip = 'text';
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.color = 'transparent';
          }
        },
        onEnter: () => {
          const gradient = `linear-gradient(90deg, rgb(88, 88, 88) 100%, rgb(255, 255, 255) 100%)`;
          text.style.background = gradient;
          text.style.backgroundClip = 'text';
          text.style.webkitBackgroundClip = 'text';
          text.style.webkitTextFillColor = 'transparent';
          text.style.color = 'transparent';
        },
        onLeaveBack: () => {
          const gradient = `linear-gradient(90deg, rgb(88, 88, 88) 100%, rgb(255, 255, 255) 100%)`;
          text.style.background = gradient;
          text.style.backgroundClip = 'text';
          text.style.webkitBackgroundClip = 'text';
          text.style.webkitTextFillColor = 'transparent';
          text.style.color = 'transparent';
        },
      });
    });

    const pathTextTitle = document.querySelector('[class*="pathTextTitle"]') as HTMLElement;
    const pathTextTitleStrong = pathTextTitle?.querySelector('strong') as HTMLElement;
    
    if (graphicContainer1Ref.current && pathTextTitleStrong && text1Ref.current && section1Ref.current) {
      const graphicContainer = graphicContainer1Ref.current;
      const textContainer = text1Ref.current;
      const section = section1Ref.current;
      
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
      const strongRect = pathTextTitleStrong.getBoundingClientRect();
      const gcRect = graphicContainer.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const strongCenterY = strongRect.top + strongRect.height / 2;
      const strongCenterX = strongRect.left + strongRect.width / 2;
      const topPx = strongCenterY - sectionRect.top - gcRect.height / 2;
      const rightPx = sectionRect.right - strongCenterX - gcRect.width / 2;
      const initialTopRem = topPx / rootFontSize;
      const initialRightRem = rightPx / rootFontSize;
      initialPosRef.current = { topRem: initialTopRem, rightRem: initialRightRem };
      gsap.set(graphicContainer, {
        top: `${initialTopRem}rem`,
        right: `${initialRightRem}rem`,
        opacity: 0.1,
      });

      ScrollTrigger.create({
        trigger: pathTextTitleStrong,
        start: 'top 25%',
        endTrigger: section,
        end: 'top 50%',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const isMobile = window.innerWidth < 769;
          
          setCubeScrollProgress(progress);
          
          const startTop = initialPosRef.current?.topRem ?? -63;
          const startRight = initialPosRef.current?.rightRem ?? 27;
          const top = startTop + (0 - startTop) * progress;
          const targetRight = isMobile ? startRight : 4.5;
          const right = startRight + (targetRight - startRight) * progress;
          const opacity = 0.1 + (1 - 0.1) * progress;
          
          gsap.set(graphicContainer, {
            top: `${top}rem`,
            right: `${right}rem`,
            opacity: opacity,
          });
        },
        onEnter: () => {
        },
        onLeaveBack: () => {
          if (graphicContainer1Ref.current) {
            const startTop = initialPosRef.current?.topRem ?? -63;
            const startRight = initialPosRef.current?.rightRem ?? 27;
            gsap.set(graphicContainer1Ref.current, {
              top: `${startTop}rem`,
              right: `${startRight}rem`,
              opacity: 0.1,
            });
          }
        },
      });
    }

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
      <section ref={section1Ref} className={styles.featureItem}>
        <div className={styles.textContainer}>
          <p ref={text1Ref} className={styles.featureText}>
            We design your brand through<br/>
            user-centric web development
          </p>
        </div>
        <div ref={graphicContainer1Ref} className={styles.graphicContainer} data-graphic-container="1">
          <ThreeScene className={styles.cubeScene}>
            <ambientLight intensity={0.95} />
            <directionalLight position={[6, 6, 6]} intensity={1.4} />
            <directionalLight position={[-4, 2, 5]} intensity={1.4} />
            <directionalLight position={[0, 4, -6]} intensity={1.4} />
            <CameraSetupPath />
            
            <WacusCube 
              position={[0, 0, 0]}
              scrollProgress={cubeScrollProgress}
            />
          </ThreeScene>
        </div>
      </section>

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
