'use client';

import { useEffect, useState } from 'react';
import styles from './RingControls.module.css';

interface RingControlsProps {
  radiusMultiplier: number;
  onRadiusMultiplierChange: (multiplier: number) => void;
}

export default function RingControls({ 
  radiusMultiplier,
  onRadiusMultiplierChange
}: RingControlsProps) {
  const [value, setValue] = useState(radiusMultiplier.toString());

  useEffect(() => {
    setValue(radiusMultiplier.toString());
  }, [radiusMultiplier]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    const numValue = parseFloat(newValue) || 1.3;
    onRadiusMultiplierChange(numValue);
  };

  return (
    <div className={styles.controls}>
      <div className={styles.title}>포트폴리오 띠 거리</div>
      
      <div className={styles.controlGroup}>
        <label className={styles.label}>반지름 배수</label>
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={styles.input}
          placeholder="1.3"
        />
        <div className={styles.description}>
          지구 크기의 배수로 조절됩니다 (작을수록 가까움)
        </div>
      </div>
    </div>
  );
}
