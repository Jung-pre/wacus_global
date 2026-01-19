'use client';

import Image from 'next/image';
import { useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ThreeScene from '@/components/ThreeScene';
import PathAnimation from '@/components/PathAnimation';
import Hero3D from '@/components/Hero3D';
import RotationControls from '@/components/RotationControls';
import FloatingCards from '@/components/FloatingCards';
import styles from './page.module.css';
import { useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const [globeRotation, setGlobeRotation] = useState<[number, number, number]>([0.13, 0, 0]);
  const [ringRotation, setRingRotation] = useState<[number, number, number]>([0.06, 0, 0]);
  const [ringRadiusMultiplier, setRingRadiusMultiplier] = useState(1.27);
  const lightPosition: [number, number, number] = [5, 5, 5];
  const lightIntensity = 4.5;
  const cameraPosition: [number, number, number] = [0, 2, 8.5];
  const cameraRotation: [number, number, number] = [-0.15, 0, -0.2];
  
  return (
    <main ref={mainRef} className={styles.main}>
      {/* 배경 이미지 */}
      <div className={styles.backgroundImage}>
        <Image
          src="/main/bg_main.jpg"
          alt="Background"
          fill
          priority
        />
        <div className={styles.backgroundOverlay} />
      </div>
      
      <Navigation />
      
      {/* 3D 오브젝트 설정 컨트롤 */}
      <RotationControls
        globeRotation={globeRotation}
        ringRotation={ringRotation}
        ringRadiusMultiplier={ringRadiusMultiplier}
        onGlobeRotationChange={setGlobeRotation}
        onRingRotationChange={setRingRotation}
        onRingRadiusMultiplierChange={setRingRadiusMultiplier}
      />
      
      {/* Hero Section with 3D Earth */}
      <section ref={heroSectionRef} className={styles.heroSection}>
        <ThreeScene>
          <Hero3D 
            scrollTriggerRef={heroSectionRef} 
            rotation={globeRotation}
            lightPosition={lightPosition}
            lightIntensity={lightIntensity}
            cameraPosition={cameraPosition}
            cameraRotation={cameraRotation}
            ringRadiusMultiplier={ringRadiusMultiplier}
            ringRotation={ringRotation}
          />
        </ThreeScene>
        
        {/* 플로팅 카드들 */}
        <FloatingCards scrollTriggerRef={heroSectionRef} />
      </section>

      {/* Path Animation Section */}
      <section className={styles.pathSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.pathTitle}>
            Path 그리기 애니메이션
          </h2>
          <div className={styles.pathContainer}>
            <PathAnimation pathId="main-path" />
          </div>
        </div>
      </section>
    </main>
  );
}
