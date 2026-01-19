'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import styles from './ThreeScene.module.css';

interface ThreeSceneProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ThreeScene({ children, className }: ThreeSceneProps) {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        shadows
        className={styles.canvas}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
