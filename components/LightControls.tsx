'use client';

import { useEffect, useState } from 'react';
import styles from './LightControls.module.css';

interface LightControlsProps {
  position: [number, number, number];
  intensity: number;
  onPositionChange: (position: [number, number, number]) => void;
  onIntensityChange: (intensity: number) => void;
}

export default function LightControls({ 
  position, 
  intensity,
  onPositionChange,
  onIntensityChange
}: LightControlsProps) {
  const [x, setX] = useState(position[0].toString());
  const [y, setY] = useState(position[1].toString());
  const [z, setZ] = useState(position[2].toString());
  const [intensityValue, setIntensityValue] = useState(intensity.toString());

  useEffect(() => {
    setX(position[0].toString());
    setY(position[1].toString());
    setZ(position[2].toString());
  }, [position]);

  useEffect(() => {
    setIntensityValue(intensity.toString());
  }, [intensity]);

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    if (axis === 'x') {
      setX(value);
      onPositionChange([numValue, position[1], position[2]]);
    } else if (axis === 'y') {
      setY(value);
      onPositionChange([position[0], numValue, position[2]]);
    } else {
      setZ(value);
      onPositionChange([position[0], position[1], numValue]);
    }
  };

  const handleIntensityChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setIntensityValue(value);
    onIntensityChange(numValue);
  };

  return (
    <div className={styles.controls}>
      <div className={styles.title}>조명 설정</div>
      
      <div className={styles.controlGroup}>
        <label className={styles.label}>위치 X</label>
        <input
          type="number"
          step="0.1"
          value={x}
          onChange={(e) => handlePositionChange('x', e.target.value)}
          className={styles.input}
          placeholder="0"
        />
      </div>
      
      <div className={styles.controlGroup}>
        <label className={styles.label}>위치 Y</label>
        <input
          type="number"
          step="0.1"
          value={y}
          onChange={(e) => handlePositionChange('y', e.target.value)}
          className={styles.input}
          placeholder="15"
        />
      </div>
      
      <div className={styles.controlGroup}>
        <label className={styles.label}>위치 Z</label>
        <input
          type="number"
          step="0.1"
          value={z}
          onChange={(e) => handlePositionChange('z', e.target.value)}
          className={styles.input}
          placeholder="5"
        />
      </div>
      
      <div className={styles.controlGroup}>
        <label className={styles.label}>강도 (Intensity)</label>
        <input
          type="number"
          step="0.1"
          value={intensityValue}
          onChange={(e) => handleIntensityChange(e.target.value)}
          className={styles.input}
          placeholder="2.5"
        />
      </div>
    </div>
  );
}
