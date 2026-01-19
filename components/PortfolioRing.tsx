'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Group, Mesh, TextureLoader, DoubleSide, CylinderGeometry, CanvasTexture, ClampToEdgeWrapping } from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface PortfolioRingProps {
  globeScale: number;
  globeRotation?: [number, number, number];
  ringRotation?: [number, number, number];
  isScrolling?: boolean;
  radiusMultiplier?: number;
  scrollTriggerRef?: React.RefObject<HTMLElement | null>;
}

export default function PortfolioRing({ 
  globeScale, 
  globeRotation = [0, 0, 0],
  ringRotation = [0, 0, 0],
  isScrolling = false,
  radiusMultiplier = 0.8,
  scrollTriggerRef
}: PortfolioRingProps) {
  const ringRef = useRef<Group>(null);
  const cylinderRef = useRef<Mesh>(null);
  const cardCount = 10;
  const radius = globeScale * radiusMultiplier; // 지구 크기에 비례한 반지름 (조절 가능)
  const cardHeight = 1.2; // 카드 높이 (세로) - 더 넓은 띠로 조정하여 왜곡 최소화
  const radialSegments = 128; // 원통의 세그먼트 수 (높을수록 부드러움)

  // 모든 이미지 텍스처 로드
  const textures = useLoader(
    TextureLoader,
    Array.from({ length: cardCount }, (_, i) => 
      `/main/img_works${String(i + 1).padStart(2, '0')}.jpg`
    )
  );

  // 10개 이미지를 하나의 긴 텍스처로 합치기
  const [combinedTexture, setCombinedTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    if (textures.length === 0 || !textures[0]?.image) return;

    // 모든 이미지가 로드될 때까지 대기
    const allLoaded = textures.every(t => t?.image);
    if (!allLoaded) return;

    // 첫 번째 이미지의 크기를 기준으로 설정
    const firstImage = textures[0].image;
    const singleImageWidth = firstImage.width;
    const singleImageHeight = firstImage.height;
    
    // 이미지 사이 간격 설정 (이미지 너비의 5% 정도)
    const gapWidth = singleImageWidth * 0.05;
    
    // 합친 텍스처의 크기 계산 (간격 포함, 마지막 이미지 뒤에도 간격 포함)
    const combinedWidth = (singleImageWidth + gapWidth) * cardCount;
    const combinedHeight = singleImageHeight;

    // Canvas 생성
    const canvas = document.createElement('canvas');
    canvas.width = combinedWidth;
    canvas.height = combinedHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 각 이미지를 가로로 배치하여 그리기 (간격 포함, 배경 없음)
    textures.forEach((texture, index) => {
      if (texture?.image) {
        const x = index * (singleImageWidth + gapWidth);
        ctx.drawImage(texture.image, x, 0, singleImageWidth, singleImageHeight);
      }
    });

    // CanvasTexture 생성
    const texture = new CanvasTexture(canvas);
    texture.wrapS = ClampToEdgeWrapping; // 반복 없이 한 번만 표시
    texture.wrapT = ClampToEdgeWrapping; // 반복 없이 한 번만 표시
    
    // 텍스처 설정: 원통의 둘레에 맞게 한 번만 표시
    texture.repeat.set(1, 1); // 기본적으로 1:1 비율
    texture.offset.set(0, 0); // 오프셋 없음
    
    texture.needsUpdate = true;
    
    setCombinedTexture(texture);

    // Cleanup
    return () => {
      texture.dispose();
    };
  }, [textures, cardCount]);

  useFrame((state, delta) => {
    if (!ringRef.current) return;
    
    // X, Z 회전은 지구의 실제 회전값과 동일하게 설정 (같은 중심축 공유)
    ringRef.current.rotation.x = globeRotation[0] + ringRotation[0];
    ringRef.current.rotation.z = globeRotation[2] + ringRotation[2];
    
    // Y축은 지구의 실제 Y 회전값의 반대로 설정 (지구의 Y 회전을 추적)
    ringRef.current.rotation.y = -globeRotation[1] + ringRotation[1];
  });

  // 원통 geometry 참조
  const geometryRef = useRef<CylinderGeometry | null>(null);
  const materialRef = useRef<any>(null);
  const hasAnimatedRef = useRef(false); // 초기 애니메이션이 완료되었는지 추적

  // 띠 애니메이션: 지구가 원래 크기로 나온 후 부드럽게 나타남
  useEffect(() => {
    if (!materialRef.current || !combinedTexture) return;
    if (hasAnimatedRef.current) return; // 이미 애니메이션이 실행되었으면 스킵

    // 초기 opacity 설정 - 완전히 투명
    materialRef.current.opacity = 0;
    materialRef.current.transparent = true;

    // 지구 애니메이션이 끝난 후 (1.5초 후) 띠가 부드럽게 나타나도록
    const timer = setTimeout(() => {
      if (materialRef.current) {
        hasAnimatedRef.current = true;
        gsap.to({ opacity: 0 }, {
          opacity: 1, // 1로 변경
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: function() {
            if (materialRef.current) {
              materialRef.current.opacity = this.targets()[0].opacity;
            }
          },
        });
      }
    }, 1500); // 지구 애니메이션 시간 (1.5초) 후 시작

    return () => clearTimeout(timer);
  }, [combinedTexture]);

  // 스크롤에 따라 띠가 100vh 스크롤에 따라 사라지고 다시 나타나게
  useEffect(() => {
    if (!materialRef.current || !scrollTriggerRef?.current) return;

    let ctx: gsap.Context | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // 초기 애니메이션이 완료될 때까지 대기
    const checkAndSetupScroll = () => {
      if (!hasAnimatedRef.current) {
        timeoutId = setTimeout(checkAndSetupScroll, 100);
        return;
      }

      ctx = gsap.context(() => {
        // 0부터 100vh까지 스크롤에 따라 띠의 opacity가 1에서 0으로 부드럽게 감소
        gsap.fromTo(materialRef.current, 
          {
            opacity: 1, // 초기 애니메이션 완료 후의 opacity (1로 변경)
          },
          {
            opacity: 0,
            scrollTrigger: {
              trigger: scrollTriggerRef.current,
              start: 'top top',
              end: '+=100vh', // pin과 동일한 설정
              scrub: true,
              invalidateOnRefresh: true, // 리사이즈 시 재계산
              onEnterBack: () => { // Fade in when scrolling back up
                if (materialRef.current) {
                  gsap.to(materialRef.current, { opacity: 1, duration: 0.5 });
                }
              },
            },
          }
        );
      }, materialRef);
    };

    checkAndSetupScroll();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (ctx) ctx.revert();
    };
  }, [scrollTriggerRef, combinedTexture]);

  return (
    <group ref={ringRef}>
      {combinedTexture && (
        <mesh 
          ref={cylinderRef} 
          position={[0, 0, 0]}
        >
          {/* 원통형 geometry: radiusTop, radiusBottom, height, radialSegments, heightSegments */}
          <cylinderGeometry 
            ref={geometryRef}
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
