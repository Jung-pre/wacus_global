'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Mesh, Color, AdditiveBlending } from 'three';
import { PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PortfolioRing from './PortfolioRing';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const gsapVh = typeof window !== 'undefined' ? window.innerHeight / 100 : 0;

// 3D 지구본 컴포넌트
export const Globe = ({ 
  scrollTriggerRef,
  rotation,
  isScrolling,
  onRotationChange
}: { 
  scrollTriggerRef: React.RefObject<HTMLElement | null>;
  rotation: [number, number, number];
  isScrolling: boolean;
  onRotationChange?: (rotation: [number, number, number]) => void;
}) => {
  const meshRef = useRef<Mesh>(null);
  const lightsMeshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);

  // Load Earth Textures
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

  // rotation prop이 변경될 때 group rotation 업데이트
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

    // 스크롤 중이 아닐 때만 자동 회전
    if (!isScrolling) {
      meshRef.current.rotation.y += delta * 0.05;
      lightsMeshRef.current.rotation.y += delta * 0.05;
    }
    
    // 지구의 실제 회전값 전달 (매 5프레임마다만 업데이트하여 성능 최적화)
    if (onRotationChange) {
      frameCountRef.current++;
      if (frameCountRef.current % 5 === 0) {
        const newRotation: [number, number, number] = [
          groupRef.current.rotation.x,
          groupRef.current.rotation.y + meshRef.current.rotation.y,
          groupRef.current.rotation.z
        ];
        
        // 값이 실제로 변경되었을 때만 콜백 호출
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

  // 모바일에서 지구 크기 조정 (화면 기준 2/3 크기)
  const [globeScale, setGlobeScale] = useState(2.45);

  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth < 768) {
        setGlobeScale(1.33); // 모바일: 2.0 * 2/3
      } else if (window.innerWidth < 1024) {
        setGlobeScale(1.87); // 태블릿: 2.8 * 2/3
      } else {
        setGlobeScale(2.45); // 데스크톱: 3.67 * 2/3
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // 포트폴리오 띠에 전달할 지구 크기
  const [currentGlobeScale, setCurrentGlobeScale] = useState(globeScale);
  
  useEffect(() => {
    setCurrentGlobeScale(globeScale);
  }, [globeScale]);

  // 지구본 초기 애니메이션: 1/3 크기에서 현재 크기로 부드럽게 확대 (스크롤 0일 때만)
  const materialRef = useRef<any>(null);
  const lightsMaterialRef = useRef<any>(null);
  const initialScale = 1 / 3; // 초기 scale (현재 크기의 1/3)

  useEffect(() => {
    if (!groupRef.current || !materialRef.current || !lightsMaterialRef.current) return;

    // 스크롤 위치 확인 - 스크롤이 0일 때만 인트로 애니메이션 실행
    const scrollY = window.scrollY || window.pageYOffset;
    const isAtTop = scrollY === 0;

    if (isAtTop) {
      // 초기 상태 설정: 1/3 크기, 투명
      groupRef.current.scale.set(initialScale, initialScale, initialScale);
      materialRef.current.opacity = 0;
      materialRef.current.transparent = true;
      lightsMaterialRef.current.opacity = 0;
      lightsMaterialRef.current.transparent = true;

      // 지구본 애니메이션: scale과 opacity를 부드럽게 확대
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
      // 스크롤이 0이 아니면 바로 최종 상태로 설정
      groupRef.current.scale.set(1.0, 1.0, 1.0);
      materialRef.current.opacity = 1.0;
      materialRef.current.transparent = true;
      lightsMaterialRef.current.opacity = 0.7;
      lightsMaterialRef.current.transparent = true;
    }
  }, []);

  return (
    <group ref={groupRef} rotation={rotation}>
      {/* Actual Globe - Opaque and Solid */}
      {/* 실제 지구의 기울기: 약 23.5도 (0.41 라디안) */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={currentGlobeScale} receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.15}
          // 하이라이트를 더 넓은 영역으로 반사되도록 조정
          roughness={0.7} 
          metalness={0.1} 
          // emissive를 줄여서 어두운 부분이 더 어둡게 보이도록
          emissive={new Color("#111122")} 
          emissiveIntensity={0.1}
          transparent={true}
          opacity={0}
        />
      </mesh>
      {/* City Lights overlay - 더 밝게 */}
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

  useEffect(() => {
    if (!scrollTriggerRef.current) return;

    const handleScrollStart = () => setIsScrolling(true);
    const handleScrollEnd = () => setIsScrolling(false);

    // ScrollTrigger 이벤트 리스너
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
      />
      
      <PortfolioRing 
        globeScale={2.45} 
        globeRotation={globeActualRotation}
        ringRotation={ringRotation}
        isScrolling={isScrolling}
        radiusMultiplier={ringRadiusMultiplier}
        scrollTriggerRef={scrollTriggerRef}
      />

    </>
  );
}
