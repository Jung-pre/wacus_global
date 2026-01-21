'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitControlsWithGuideProps {
  initialPosition?: [number, number, number];
  initialTarget?: [number, number, number];
  onStateChange?: (state: {
    position: [number, number, number];
    target: [number, number, number];
    distance: number;
    azimuthAngle: number;
    polarAngle: number;
  }) => void;
}

// Canvas 내부에서 사용할 OrbitControls 컴포넌트
export function OrbitControlsInner({
  initialPosition = [0, 0, 5],
  initialTarget = [0, 0, 0],
  onStateChange
}: OrbitControlsWithGuideProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // 초기 카메라 설정
  useEffect(() => {
    camera.position.set(...initialPosition);
    if (controlsRef.current) {
      controlsRef.current.target.set(...initialTarget);
      controlsRef.current.update();
    }
  }, [camera, initialPosition, initialTarget]);

  // 카메라 상태 업데이트
  useFrame(() => {
    if (camera && controlsRef.current) {
      const pos = camera.position;
      const tgt = controlsRef.current.target || new THREE.Vector3(0, 0, 0);
      
      const dist = pos.distanceTo(tgt);
      const direction = new THREE.Vector3().subVectors(pos, tgt).normalize();
      const azimuth = Math.atan2(direction.x, direction.z);
      const polar = Math.acos(Math.max(-1, Math.min(1, direction.y)));
      
      const newState = {
        position: [pos.x, pos.y, pos.z] as [number, number, number],
        target: [tgt.x, tgt.y, tgt.z] as [number, number, number],
        distance: dist,
        azimuthAngle: azimuth,
        polarAngle: polar
      };
      
      if (onStateChange) {
        onStateChange(newState);
      }
      
      // CustomEvent로 외부에 상태 전달
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orbitControlsStateUpdate', { detail: newState }));
      }
    }
  });

  const handlePositionChange = (newPosition: [number, number, number]) => {
    camera.position.set(...newPosition);
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  };

  const handleTargetChange = (newTarget: [number, number, number]) => {
    if (controlsRef.current) {
      controlsRef.current.target.set(...newTarget);
      controlsRef.current.update();
    }
  };

  const handleDistanceChange = (distance: number, currentTarget: THREE.Vector3) => {
    const direction = new THREE.Vector3()
      .subVectors(camera.position, currentTarget)
      .normalize();
    const newPosition = direction.multiplyScalar(distance).add(currentTarget);
    camera.position.set(newPosition.x, newPosition.y, newPosition.z);
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  };

  // 외부에서 호출할 수 있도록 window에 함수 등록
  useEffect(() => {
    (window as any).__orbitControlsHandlers = {
      setPosition: handlePositionChange,
      setTarget: handleTargetChange,
      setDistance: handleDistanceChange,
      getControls: () => controlsRef.current
    };
    return () => {
      delete (window as any).__orbitControlsHandlers;
    };
  }, [camera]);

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={false}
      minDistance={3}
      maxDistance={10}
    />
  );
}
