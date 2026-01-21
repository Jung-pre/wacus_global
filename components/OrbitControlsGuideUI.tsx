'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import styles from './OrbitControlsGuide.module.css';

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  distance: number;
  azimuthAngle: number;
  polarAngle: number;
}

export default function OrbitControlsGuideUI() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<CameraState>({
    position: [0, 0, 5],
    target: [0, 0, 0],
    distance: 5,
    azimuthAngle: 0,
    polarAngle: Math.PI / 2
  });

  // 상태 업데이트 리스너
  useEffect(() => {
    const handleStateUpdate = (event: CustomEvent<CameraState>) => {
      setState(event.detail);
    };

    window.addEventListener('orbitControlsStateUpdate', handleStateUpdate as EventListener);
    return () => {
      window.removeEventListener('orbitControlsStateUpdate', handleStateUpdate as EventListener);
    };
  }, []);

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    const newPosition: [number, number, number] = [...state.position];
    if (axis === 'x') newPosition[0] = numValue;
    else if (axis === 'y') newPosition[1] = numValue;
    else newPosition[2] = numValue;
    
    const handlers = (window as any).__orbitControlsHandlers;
    if (handlers?.setPosition) {
      handlers.setPosition(newPosition);
    }
  };

  const handleTargetChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    const newTarget: [number, number, number] = [...state.target];
    if (axis === 'x') newTarget[0] = numValue;
    else if (axis === 'y') newTarget[1] = numValue;
    else newTarget[2] = numValue;
    
    const handlers = (window as any).__orbitControlsHandlers;
    if (handlers?.setTarget) {
      handlers.setTarget(newTarget);
    }
  };

  const handleDistanceChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    const handlers = (window as any).__orbitControlsHandlers;
    if (handlers?.setDistance && handlers?.getControls) {
      const controls = handlers.getControls();
      const currentTarget = controls?.target || new THREE.Vector3(...state.target);
      handlers.setDistance(numValue, currentTarget);
    }
  };

  return (
    <div className={styles.guideContainer}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '▼' : '▲'} OrbitControls 가이드
      </button>
      
      {isOpen && (
        <div className={styles.controls}>
          <div className={styles.title}>카메라 설정</div>
          
          <div className={styles.section}>
            <div className={styles.sectionTitle}>현재 상태</div>
            
            <div className={styles.infoGroup}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>카메라 위치:</span>
                <span className={styles.infoValue}>
                  ({state.position[0].toFixed(2)}, {state.position[1].toFixed(2)}, {state.position[2].toFixed(2)})
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>타겟 위치:</span>
                <span className={styles.infoValue}>
                  ({state.target[0].toFixed(2)}, {state.target[1].toFixed(2)}, {state.target[2].toFixed(2)})
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>거리:</span>
                <span className={styles.infoValue}>{state.distance.toFixed(2)}</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>수평 각도 (azimuth):</span>
                <span className={styles.infoValue}>{(state.azimuthAngle * 180 / Math.PI).toFixed(2)}°</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>수직 각도 (polar):</span>
                <span className={styles.infoValue}>{(state.polarAngle * 180 / Math.PI).toFixed(2)}°</span>
              </div>
            </div>
          </div>
          
          <div className={styles.section}>
            <div className={styles.sectionTitle}>카메라 위치 설정</div>
            
            <div className={styles.controlGroup}>
              <label className={styles.label}>X</label>
              <input
                type="number"
                step="0.1"
                value={state.position[0].toFixed(2)}
                onChange={(e) => handlePositionChange('x', e.target.value)}
                className={styles.input}
              />
            </div>
            
            <div className={styles.controlGroup}>
              <label className={styles.label}>Y</label>
              <input
                type="number"
                step="0.1"
                value={state.position[1].toFixed(2)}
                onChange={(e) => handlePositionChange('y', e.target.value)}
                className={styles.input}
              />
            </div>
            
            <div className={styles.controlGroup}>
              <label className={styles.label}>Z</label>
              <input
                type="number"
                step="0.1"
                value={state.position[2].toFixed(2)}
                onChange={(e) => handlePositionChange('z', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
          
          <div className={styles.section}>
            <div className={styles.sectionTitle}>타겟 위치 설정</div>
            
            <div className={styles.controlGroup}>
              <label className={styles.label}>X</label>
              <input
                type="number"
                step="0.1"
                value={state.target[0].toFixed(2)}
                onChange={(e) => handleTargetChange('x', e.target.value)}
                className={styles.input}
              />
            </div>
            
            <div className={styles.controlGroup}>
              <label className={styles.label}>Y</label>
              <input
                type="number"
                step="0.1"
                value={state.target[1].toFixed(2)}
                onChange={(e) => handleTargetChange('y', e.target.value)}
                className={styles.input}
              />
            </div>
            
            <div className={styles.controlGroup}>
              <label className={styles.label}>Z</label>
              <input
                type="number"
                step="0.1"
                value={state.target[2].toFixed(2)}
                onChange={(e) => handleTargetChange('z', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
          
          <div className={styles.section}>
            <div className={styles.sectionTitle}>거리 설정</div>
            
            <div className={styles.controlGroup}>
              <label className={styles.label}>거리</label>
              <input
                type="number"
                step="0.1"
                value={state.distance.toFixed(2)}
                onChange={(e) => handleDistanceChange(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
