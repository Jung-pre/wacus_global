'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Mesh, Color, AdditiveBlending } from 'three';
import { PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PortfolioRing from '@/components/PortfolioRing';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const gsapVh = typeof window !== 'undefined' ? window.innerHeight / 100 : 0;

export const Globe = ({ 
  scrollTriggerRef,
  rotation,
  isScrolling,
  onRotationChange,
  globeScale
}: { 
  scrollTriggerRef: React.RefObject<HTMLElement | null>;
  rotation: [number, number, number];
  isScrolling: boolean;
  onRotationChange?: (rotation: [number, number, number]) => void;
  globeScale?: number;
}) => {
  const meshRef = useRef<Mesh>(null);
  const lightsMeshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);

  const [colorMap, bumpMap, specularMap, lightsMap] = useLoader(TextureLoader, [
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-water.png',
    'https://unpkg.com/three-globe/example/img/earth-night.jpg' 
  ], undefined, (error) => {
    console.error('Texture loading error:', error);
  });

  useEffect(() => {
    if (!groupRef.current || !scrollTriggerRef.current) return;

    const trigger = scrollTriggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / window.innerHeight));
    const hasScrolledPast100vh = progress >= 1;

    const ctx = gsap.context(() => {
      const targetScale = 1.2;
      const targetYPosition = -2;

      if (hasScrolledPast100vh) {
        groupRef.current.position.y = targetYPosition;
        groupRef.current.scale.set(targetScale, targetScale, targetScale);
      }

      const scrollTriggerConfig = {
        trigger: scrollTriggerRef.current,
        start: 'top top',
        end: () => `+=${50 * gsapVh}`,
        scrub: true,
        invalidateOnRefresh: true,
      };

      gsap.fromTo(groupRef.current.position, 
        { y: 0 },
        { y: targetYPosition, scrollTrigger: scrollTriggerConfig }
      );

      gsap.fromTo(groupRef.current.scale, 
        { x: 1.0, y: 1.0, z: 1.0 },
        { x: targetScale, y: targetScale, z: targetScale, scrollTrigger: scrollTriggerConfig }
      );
    }, groupRef);

    return () => ctx.revert();
  }, [scrollTriggerRef]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = rotation[0];
    groupRef.current.rotation.y = rotation[1];
    groupRef.current.rotation.z = rotation[2];
  }, [rotation]);

  const lastRotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const frameCountRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !lightsMeshRef.current || !groupRef.current) return;

    if (!isScrolling) {
      meshRef.current.rotation.y += delta * 0.05;
      lightsMeshRef.current.rotation.y += delta * 0.05;
    }
    
    if (onRotationChange) {
      frameCountRef.current++;
      if (frameCountRef.current % 5 === 0) {
        const newRotation: [number, number, number] = [
          groupRef.current.rotation.x,
          groupRef.current.rotation.y + meshRef.current.rotation.y,
          groupRef.current.rotation.z
        ];
        
        const hasChanged = 
          Math.abs(newRotation[0] - lastRotationRef.current[0]) > 0.01 ||
          Math.abs(newRotation[1] - lastRotationRef.current[1]) > 0.01 ||
          Math.abs(newRotation[2] - lastRotationRef.current[2]) > 0.01;
        
        if (hasChanged) {
          lastRotationRef.current = newRotation;
          onRotationChange(newRotation);
        }
      }
    }
  });

  const currentGlobeScale = globeScale || 2.45;

  const materialRef = useRef<any>(null);
  const lightsMaterialRef = useRef<any>(null);
  const initialScale = 1 / 3;

  useEffect(() => {
    if (!groupRef.current || !materialRef.current || !lightsMaterialRef.current) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const isAtTop = scrollY === 0;

    if (isAtTop) {
      groupRef.current.scale.set(initialScale, initialScale, initialScale);
      materialRef.current.opacity = 0;
      materialRef.current.transparent = true;
      lightsMaterialRef.current.opacity = 0;
      lightsMaterialRef.current.transparent = true;

      gsap.to(groupRef.current.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 1.5,
        ease: 'power2.out',
      });

      gsap.to({ opacity: 0 }, {
        opacity: 1.0,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: function() {
          if (materialRef.current) {
            materialRef.current.opacity = this.targets()[0].opacity;
          }
          if (lightsMaterialRef.current) {
            lightsMaterialRef.current.opacity = this.targets()[0].opacity * 0.7;
          }
        },
      });
    } else {
      groupRef.current.scale.set(1.0, 1.0, 1.0);
      materialRef.current.opacity = 1.0;
      materialRef.current.transparent = true;
      lightsMaterialRef.current.opacity = 0.7;
      lightsMaterialRef.current.transparent = true;
    }
  }, []);

  return (
    <group ref={groupRef} rotation={rotation}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={currentGlobeScale} receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.15}
          roughness={0.7} 
          metalness={0.1} 
          emissive={new Color("#111122")} 
          emissiveIntensity={0.1}
          transparent={true}
          opacity={0}
        />
      </mesh>
      <mesh ref={lightsMeshRef} position={[0, 0, 0]} scale={currentGlobeScale}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial 
          ref={lightsMaterialRef}
          map={lightsMap} 
          blending={AdditiveBlending} 
          transparent 
          opacity={0} 
        />
      </mesh>
    </group>
  );
};

export default function Hero3D({ 
  scrollTriggerRef,
  rotation,
  lightPosition = [0, 15, 5],
  lightIntensity = 2.5,
  cameraPosition = [0, 0, 8],
  cameraRotation = [0, 0, 0],
  ringRadiusMultiplier = 1.3,
  ringRotation = [0, 0, 0]
}: { 
  scrollTriggerRef: React.RefObject<HTMLElement | null>;
  rotation: [number, number, number];
  lightPosition?: [number, number, number];
  lightIntensity?: number;
  cameraPosition?: [number, number, number];
  cameraRotation?: [number, number, number];
  ringRadiusMultiplier?: number;
  ringRotation?: [number, number, number];
}) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [globeActualRotation, setGlobeActualRotation] = useState<[number, number, number]>(rotation);
  const [globeScale, setGlobeScale] = useState(2.45);
  const [mobileMultiplier, setMobileMultiplier] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      const maxWidth = 1920;
      const minWidth = 880;
      const baseScale = 2.45;
      const resizeStartWidth = 1400;
      
      if (width >= resizeStartWidth) {
        setMobileMultiplier(1);
        setGlobeScale(baseScale);
      } else if (width <= minWidth) {
        const minScale = (minWidth / resizeStartWidth) * baseScale;
        const scaleRange = baseScale - minScale;
        const fixedScale = baseScale - scaleRange * 0.5;
        setMobileMultiplier(1);
        setGlobeScale(fixedScale);
      } else {
        const minScale = (minWidth / resizeStartWidth) * baseScale;
        const scaleRange = baseScale - minScale;
        const progress = (resizeStartWidth - width) / (resizeStartWidth - minWidth);
        const scale = baseScale - scaleRange * progress * 0.5;
        setMobileMultiplier(1);
        setGlobeScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (!scrollTriggerRef.current) return;

    const handleScrollStart = () => setIsScrolling(true);
    const handleScrollEnd = () => setIsScrolling(false);

    ScrollTrigger.addEventListener('scrollStart', handleScrollStart);
    ScrollTrigger.addEventListener('scrollEnd', handleScrollEnd);

    return () => {
      ScrollTrigger.removeEventListener('scrollStart', handleScrollStart);
      ScrollTrigger.removeEventListener('scrollEnd', handleScrollEnd);
    };
  }, [scrollTriggerRef]);
  const [fov, setFov] = useState(50);
  const cameraRef = useRef<any>(null);
  const directionalLightRef = useRef<any>(null);
  const ambientLightRef = useRef<any>(null);

  useEffect(() => {
    const updateFov = () => {
      if (window.innerWidth < 768) {
        setFov(60);
      } else if (window.innerWidth < 1024) {
        setFov(55);
      } else {
        setFov(50);
      }
    };

    updateFov();
    window.addEventListener('resize', updateFov);
    return () => window.removeEventListener('resize', updateFov);
  }, []);

  useEffect(() => {
    if (!scrollTriggerRef.current || !directionalLightRef.current || !ambientLightRef.current) return;

    const trigger = scrollTriggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / window.innerHeight));
    const hasScrolledPast100vh = progress >= 1;

    if (hasScrolledPast100vh) {
      directionalLightRef.current.intensity = lightIntensity * 0.05;
      ambientLightRef.current.intensity = 0.1;
    }

    const ctx = gsap.context(() => {
      const lightData = { 
        directionalIntensity: lightIntensity, 
        ambientIntensity: 0.1 
      };

      gsap.fromTo(lightData, 
        {
          directionalIntensity: lightIntensity,
          ambientIntensity: 0.1,
        },
        {
          directionalIntensity: lightIntensity * 0.05,
          ambientIntensity: 0.1,
          scrollTrigger: {
            trigger: scrollTriggerRef.current,
            start: 'top top',
            end: () => `+=${100 * gsapVh}`,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: function() {
              if (directionalLightRef.current) {
                directionalLightRef.current.intensity = lightData.directionalIntensity;
              }
              if (ambientLightRef.current) {
                ambientLightRef.current.intensity = lightData.ambientIntensity;
              }
            },
          },
        }
      );
    });

    return () => ctx.revert();
  }, [scrollTriggerRef, lightIntensity]);

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={cameraPosition} 
        rotation={cameraRotation} 
        fov={fov} 
      />
      <ambientLight ref={ambientLightRef} intensity={0.1} />
      <directionalLight 
        ref={directionalLightRef}
        position={lightPosition} 
        intensity={lightIntensity} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <Globe 
        scrollTriggerRef={scrollTriggerRef} 
        rotation={rotation} 
        isScrolling={isScrolling}
        onRotationChange={setGlobeActualRotation}
        globeScale={globeScale * 0.9}
      />
      
      <PortfolioRing 
        globeScale={globeScale * 0.9} 
        globeRotation={globeActualRotation}
        ringRotation={ringRotation}
        isScrolling={isScrolling}
        radiusMultiplier={ringRadiusMultiplier}
        scrollTriggerRef={scrollTriggerRef}
        mobileMultiplier={mobileMultiplier}
      />

    </>
  );
}
