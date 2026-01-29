'use client';

import Image from 'next/image';
import { useRef, useEffect, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import ThreeScene from '@/components/ThreeScene';
import PathAnimation from '@/components/PathAnimation';
import Hero3D from '@/components/Hero3D';
import FloatingCards from '@/components/FloatingCards';
import CardFlipSection from '@/components/CardFlipSection';
import FeatureSection from '@/components/FeatureSection';
import ExperienceSection from '@/components/ExperienceSection';
import FAQSection from '@/components/FAQSection';
import SlotSection from '@/components/SlotSection';
import ContactSection from '@/components/ContactSection';
import CookiePolicyModal from '@/components/CookiePolicyModal';
import styles from './page.module.css';
import { useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const gsapVh = useMemo(() => (typeof window !== 'undefined' ? window.innerHeight / 100 : 0), []);
  const mainRef = useRef<HTMLElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const threeSceneRef = useRef<HTMLDivElement>(null);
  const backgroundImageRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const [globeRotation, setGlobeRotation] = useState<[number, number, number]>([0.13, 0, 0]);
  const [ringRotation, setRingRotation] = useState<[number, number, number]>([0.06, 0, 0]);
  const [ringRadiusMultiplier, setRingRadiusMultiplier] = useState(1.27);
  const lightPosition: [number, number, number] = [5, 5, 5];
  const lightIntensity = 4.5;
  const cameraPosition: [number, number, number] = [0, 2, 8.5];
  const cameraRotation: [number, number, number] = [-0.15, 0, -0.2];
  
  useEffect(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const isAtTop = scrollY === 0;

    if (isAtTop && backgroundImageRef.current) {
      const backgroundImage = backgroundImageRef.current;

      gsap.set(backgroundImage, { opacity: 0 });

      const introTimeline = gsap.timeline();

      introTimeline.to(backgroundImage, {
        opacity: 1,
        duration: 2,
        ease: 'power2.out',
      });
    } else {
      if (backgroundImageRef.current) {
        gsap.set(backgroundImageRef.current, { opacity: 1 });
      }
    }
  }, []);

  useEffect(() => {
    if (!backgroundImageRef.current || !heroSectionRef.current) return;

    const backgroundImage = backgroundImageRef.current;
    const heroSection = heroSectionRef.current;

    if (threeSceneRef.current) {
      ScrollTrigger.create({
        id: 'threeScenePin',
        trigger: heroSection,
        start: 'top top',
        end: () => `+=${200 * gsapVh}px`,
        pin: threeSceneRef.current,
        pinSpacing: true,
      });
    }

    const st = ScrollTrigger.create({
      trigger: heroSection,
      start: () => `top -${160 * gsapVh}px`,
      end: () => `+=${40 * gsapVh}px`,
      scrub: true,
      onUpdate: (self) => {
        const opacity = 1 - self.progress;
        gsap.set(backgroundImage, { opacity });
      },
    });

    return () => {
      st?.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.id === 'threeScenePin') {
          trigger.kill();
        }
      });
    };
  }, [gsapVh]);
  
  return (
    <main ref={mainRef} className={styles.main}>
      <div ref={backgroundImageRef} className={styles.backgroundImage}>
        <Image
          src="/main/bg_main.jpg"
          alt="Background"
          fill
          priority
        />
        <div className={styles.backgroundOverlay} />
      </div>
      
      <Navigation ref={navigationRef} />
      
      <section ref={heroSectionRef} className={styles.heroSection}>
        <ThreeScene ref={threeSceneRef}>
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
        
        <FloatingCards scrollTriggerRef={heroSectionRef} />
      </section>

      <CardFlipSection />

      <PathAnimation />

      <FeatureSection />

      <ExperienceSection />

      <FAQSection />

      <SlotSection />
      
      <ContactSection />

      <CookiePolicyModal />
    </main>
  );
}
