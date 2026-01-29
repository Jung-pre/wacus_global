'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Group, Mesh, TextureLoader, DoubleSide, CylinderGeometry, CanvasTexture, ClampToEdgeWrapping } from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const gsapVh = typeof window !== 'undefined' ? window.innerHeight / 100 : 0;

interface PortfolioRingProps {
  globeScale: number;
  globeRotation?: [number, number, number];
  ringRotation?: [number, number, number];
  isScrolling?: boolean;
  radiusMultiplier?: number;
  scrollTriggerRef?: React.RefObject<HTMLElement | null>;
  mobileMultiplier?: number;
}

export default function PortfolioRing({ 
  globeScale, 
  globeRotation = [0, 0, 0],
  ringRotation = [0, 0, 0],
  isScrolling = false,
  radiusMultiplier = 0.8,
  scrollTriggerRef,
  mobileMultiplier = 1
}: PortfolioRingProps) {
  const ringRef = useRef<Group>(null);
  const cylinderRef = useRef<Mesh>(null);
  const cardCount = 10;
  const baseCardHeight = 1.2;
  const baseGlobeScale = 2.45;
  const thinCardHeight = 0.72;
  
  const isMobile = mobileMultiplier > 1;
  const cardHeightValue = isMobile ? thinCardHeight : baseCardHeight;
  const cardHeight = (globeScale / baseGlobeScale) * cardHeightValue * mobileMultiplier;
  const radialSegments = 128;
  const radius = globeScale * radiusMultiplier;

  const textures = useLoader(
    TextureLoader,
    Array.from({ length: cardCount }, (_, i) => 
      `/main/img_works${String(i + 1).padStart(2, '0')}.jpg`
    )
  );

  const [combinedTexture, setCombinedTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    if (textures.length === 0 || !textures[0]?.image) return;

    const allLoaded = textures.every(t => t?.image);
    if (!allLoaded) return;

    const firstImage = textures[0].image;
    const singleImageWidth = firstImage.width;
    const singleImageHeight = firstImage.height;
    const gapWidth = singleImageWidth * 0.05;
    const combinedWidth = (singleImageWidth + gapWidth) * cardCount;
    const combinedHeight = singleImageHeight;

    const canvas = document.createElement('canvas');
    canvas.width = combinedWidth;
    canvas.height = combinedHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    textures.forEach((texture, index) => {
      if (texture?.image) {
        const x = index * (singleImageWidth + gapWidth);
        ctx.drawImage(texture.image, x, 0, singleImageWidth, singleImageHeight);
      }
    });

    const texture = new CanvasTexture(canvas);
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;
    
    setCombinedTexture(texture);

    return () => {
      texture.dispose();
    };
  }, [textures, cardCount]);

  const targetRotationRef = useRef({
    x: 0,
    y: 0,
    z: 0,
  });

  useEffect(() => {
    targetRotationRef.current = {
      x: globeRotation[0] + ringRotation[0],
      y: -globeRotation[1] + ringRotation[1],
      z: globeRotation[2] + ringRotation[2],
    };
  }, [globeRotation, ringRotation]);

  useFrame((state, delta) => {
    if (!ringRef.current) return;
    
    const lerpFactor = Math.min(1, delta * 8);
    
    ringRef.current.rotation.x = gsap.utils.interpolate(
      ringRef.current.rotation.x,
      targetRotationRef.current.x,
      lerpFactor
    );
    ringRef.current.rotation.z = gsap.utils.interpolate(
      ringRef.current.rotation.z,
      targetRotationRef.current.z,
      lerpFactor
    );
    ringRef.current.rotation.y = gsap.utils.interpolate(
      ringRef.current.rotation.y,
      targetRotationRef.current.y,
      lerpFactor
    );
  });

  const materialRef = useRef<any>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!materialRef.current || !combinedTexture) return;
    if (hasAnimatedRef.current) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const isAtTop = scrollY === 0;
    
    let initialOpacity = 0;
    if (!isAtTop) {
      const hasScrolledPast100vh = scrollY >= window.innerHeight;
      initialOpacity = hasScrolledPast100vh ? 0 : 1;
      hasAnimatedRef.current = true;
    }

    materialRef.current.opacity = initialOpacity;
    materialRef.current.transparent = true;

    if (isAtTop) {
      const timer = setTimeout(() => {
        if (materialRef.current) {
          hasAnimatedRef.current = true;
          gsap.to({ opacity: 0 }, {
            opacity: 1,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: function() {
              if (materialRef.current) {
                materialRef.current.opacity = this.targets()[0].opacity;
              }
            },
          });
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [combinedTexture]);

  useEffect(() => {
    if (!materialRef.current || !scrollTriggerRef?.current) return;

    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger === scrollTriggerRef.current && 
          trigger.vars.id === 'portfolioRingOpacity') {
        trigger.kill();
      }
    });

    if (hasAnimatedRef.current) {
      const scrollY = window.scrollY || window.pageYOffset;
      const hasScrolledPast100vh = scrollY >= window.innerHeight;
      if (materialRef.current) {
        materialRef.current.opacity = hasScrolledPast100vh ? 0 : 1;
      }
    }

    const scrollTrigger = ScrollTrigger.create({
      id: 'portfolioRingOpacity',
      trigger: scrollTriggerRef.current,
      start: 'top top',
      end: () => `+=${50 * gsapVh}`,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (materialRef.current) {
          const progress = self.progress;
          if (progress >= 1) {
            materialRef.current.opacity = 0;
          } else if (progress <= 0) {
            const scrollY = window.scrollY || window.pageYOffset;
            const hasScrolledPast100vh = scrollY >= window.innerHeight;
            materialRef.current.opacity = hasScrolledPast100vh ? 0 : 1;
          } else {
            materialRef.current.opacity = Math.max(0, 1 - progress);
          }
        }
      },
      onLeave: () => {
        if (materialRef.current) {
          materialRef.current.opacity = 0;
        }
      },
      onEnterBack: (self) => {
        if (materialRef.current) {
          const progress = self.progress;
          const scrollY = window.scrollY || window.pageYOffset;
          const hasScrolledPast100vh = scrollY >= window.innerHeight;
          if (progress <= 0 && !hasScrolledPast100vh) {
            materialRef.current.opacity = 1;
          }
        }
      },
    });

    return () => {
      if (scrollTrigger) {
        scrollTrigger.kill();
      }
    };
  }, [scrollTriggerRef, combinedTexture]);

  return (
    <group ref={ringRef}>
      {combinedTexture && (
        <mesh 
          ref={cylinderRef} 
          position={[0, 0, 0]}
        >
          <cylinderGeometry 
            args={[radius, radius, cardHeight, radialSegments, 1, true]} 
          />
          <meshStandardMaterial 
            ref={materialRef}
            map={combinedTexture}
            side={DoubleSide}
            transparent
            opacity={0}
          />
        </mesh>
      )}
    </group>
  );
}
