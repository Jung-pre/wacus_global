'use client';

import { useEffect, useState } from 'react';
import styles from './RotationControls.module.css';

interface RotationControlsProps {
  globeRotation: [number, number, number];
  ringRotation: [number, number, number];
  ringRadiusMultiplier: number;
  onGlobeRotationChange: (rotation: [number, number, number]) => void;
  onRingRotationChange: (rotation: [number, number, number]) => void;
  onRingRadiusMultiplierChange: (value: number) => void;
}

export default function RotationControls({
  globeRotation,
  ringRotation,
  ringRadiusMultiplier,
  onGlobeRotationChange,
  onRingRotationChange,
  onRingRadiusMultiplierChange
}: RotationControlsProps) {
  const [globeX, setGlobeX] = useState(globeRotation[0].toString());
  const [globeY, setGlobeY] = useState(globeRotation[1].toString());
  const [globeZ, setGlobeZ] = useState(globeRotation[2].toString());
  
  const [ringX, setRingX] = useState(ringRotation[0].toString());
  const [ringY, setRingY] = useState(ringRotation[1].toString());
  const [ringZ, setRingZ] = useState(ringRotation[2].toString());
  
  const [radius, setRadius] = useState(ringRadiusMultiplier.toString());

  useEffect(() => {
    setGlobeX(globeRotation[0].toString());
    setGlobeY(globeRotation[1].toString());
    setGlobeZ(globeRotation[2].toString());
  }, [globeRotation]);

  useEffect(() => {
    setRingX(ringRotation[0].toString());
    setRingY(ringRotation[1].toString());
    setRingZ(ringRotation[2].toString());
  }, [ringRotation]);

  useEffect(() => {
    setRadius(ringRadiusMultiplier.toString());
  }, [ringRadiusMultiplier]);

  const handleGlobeChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    if (axis === 'x') {
      setGlobeX(value);
      onGlobeRotationChange([numValue, globeRotation[1], globeRotation[2]]);
    } else if (axis === 'y') {
      setGlobeY(value);
      onGlobeRotationChange([globeRotation[0], numValue, globeRotation[2]]);
    } else {
      setGlobeZ(value);
      onGlobeRotationChange([globeRotation[0], globeRotation[1], numValue]);
    }
  };

  const handleRingChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    if (axis === 'x') {
      setRingX(value);
      onRingRotationChange([numValue, ringRotation[1], ringRotation[2]]);
    } else if (axis === 'y') {
      setRingY(value);
      onRingRotationChange([ringRotation[0], numValue, ringRotation[2]]);
    } else {
      setRingZ(value);
      onRingRotationChange([ringRotation[0], ringRotation[1], numValue]);
    }
  };

  const handleRadiusChange = (value: string) => {
    setRadius(value);
    const numValue = parseFloat(value) || 0;
    onRingRadiusMultiplierChange(numValue);
  };

  return (
    <div className={styles.controls}>
      <div className={styles.title}>3D 오브젝트 설정</div>
      
      {/* 지구본 회전 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>지구본 회전 (라디안)</div>
        <div className={styles.controlGroup}>
          <label className={styles.label}>X</label>
          <input
            type="number"
            step="0.01"
            value={globeX}
            onChange={(e) => handleGlobeChange('x', e.target.value)}
            className={styles.input}
            placeholder="0"
          />
        </div>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Y</label>
          <input
            type="number"
            step="0.01"
            value={globeY}
            onChange={(e) => handleGlobeChange('y', e.target.value)}
            className={styles.input}
            placeholder="0"
          />
        </div>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Z</label>
          <input
            type="number"
            step="0.01"
            value={globeZ}
            onChange={(e) => handleGlobeChange('z', e.target.value)}
            className={styles.input}
            placeholder="0"
          />
        </div>
      </div>

      <div className={styles.divider} />

      {/* 원통 회전 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>원통 회전 (라디안)</div>
        <div className={styles.controlGroup}>
          <label className={styles.label}>X</label>
          <input
            type="number"
            step="0.01"
            value={ringX}
            onChange={(e) => handleRingChange('x', e.target.value)}
            className={styles.input}
            placeholder="0"
          />
        </div>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Y</label>
          <input
            type="number"
            step="0.01"
            value={ringY}
            onChange={(e) => handleRingChange('y', e.target.value)}
            className={styles.input}
            placeholder="0"
          />
        </div>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Z</label>
          <input
            type="number"
            step="0.01"
            value={ringZ}
            onChange={(e) => handleRingChange('z', e.target.value)}
            className={styles.input}
            placeholder="0"
          />
        </div>
      </div>

      <div className={styles.divider} />

      {/* 원통 반지름 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>원통 반지름 배수</div>
        <div className={styles.controlGroup}>
          <label className={styles.label}>반지름 배수</label>
          <input
            type="number"
            step="0.01"
            value={radius}
            onChange={(e) => handleRadiusChange(e.target.value)}
            className={styles.input}
            placeholder="1.48"
          />
        </div>
      </div>
    </div>
  );
}
