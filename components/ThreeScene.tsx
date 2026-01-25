'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, forwardRef } from 'react';
import styles from './ThreeScene.module.css';

interface ThreeSceneProps {
  children?: React.ReactNode;
  className?: string;
}

const ThreeScene = forwardRef<HTMLDivElement, ThreeSceneProps>(({ children, className }, ref) => {
  return (
    <div ref={ref} className={`${styles.container} ${className || ''}`}>
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
});

ThreeScene.displayName = 'ThreeScene';

export default ThreeScene;
