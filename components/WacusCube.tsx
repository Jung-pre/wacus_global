'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

interface FaceData {
  color: string;
  letter: string;
  number?: number;
  rotation?: number;
}

interface CubeFaceData {
  front?: FaceData;
  back?: FaceData;
  top?: FaceData;
  bottom?: FaceData;
  left?: FaceData;
  right?: FaceData;
}

const getFaceNumber = (
  face: 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom',
  x: number, y: number, z: number
): number => {
  let col = 0, row = 0;
  
  switch (face) {
    case 'front':
      col = x + 1;
      row = 1 - y;
      break;
    case 'back':
      col = 2 - (x + 1);
      row = 1 - y;
      break;
    case 'right':
      col = 1 - z;
      row = 1 - y;
      break;
    case 'left':
      col = 2 - (z + 1);
      row = 1 - y;
      break;
    case 'top':
      col = x + 1;
      row = 1 - z;
      break;
    case 'bottom':
      col = x + 1;
      row = 2 - (z + 1);
      break;
  }
  
  return row * 3 + col + 1;
};

const cubeData: CubeFaceData[][][] = [
  [
    [
      { front: { color: '#8840F4', letter: 'W', number: 1 }, top: { color: '#131313', letter: '', number: 1 }, left: { color: '#131313', letter: '', number: 3 }},
      { front: { color: '#8840F4', letter: 'A', number: 2 }, top: { color: '#E8430C', letter: 'U', number: 2 }, right: { color: '#7c3aed', letter: 'RIGHT', number: 2 } },
      { front: { color: '#131313', letter: '', number: 3 }, top: { color: '#E8430C', letter: 'S', number: 3 }, right: { color: '#4268FF', letter: 'W', number: 3 } },
    ],
    [
      { front: { color: '#131313', letter: '', number: 4 }, left: { color: '#131313', letter: '', number: 6 }},
      { front: { color: '#131313', letter: '', number: 5 } },
      { front: { color: '#131313', letter: '', number: 6 }, right: { color: '#131313', letter: '', number: 6 } },
    ],
    [
      { front: { color: '#8840F4', letter: 'C', number: 7 }, bottom: { color: '#4268FF', letter: 'W', number: 1 }, left: { color: '#4268FF', letter: 'S', number: 9 }},
      { front: { color: '#8840F4', letter: 'U', number: 8 }, bottom: { color: '#131313', letter: '', number: 2 }},
      { front: { color: '#8840F4', letter: 'S', number: 9 }, bottom: { color: '#4268FF', letter: 'A', number: 3 }, right: { color: '#4268FF', letter: 'U', number: 9 } },
    ],
  ],
  [
    [
      { top: { color: '#131313', letter: '', number: 4 }, left: { color: '#E8430C', letter: 'A', number: 2 }},
      { top: { color: '#E8430C', letter: 'C', number: 5 }},
      { top: { color: '#131313', letter: '', number: 6 }, right: { color: '#131313', letter: '', number: 2 } },
    ],
    [
      { left: { color: '#E8430C', letter: 'C', number: 5 } },
      {},
      { right: { color: '#E8430C', letter: 'C', number: 5 } },
    ],
    [
      { bottom: { color: '#4268FF', letter: 'C', number: 4 }, left: { color: '#131313', letter: '', number: 8 } },
      { bottom: { color: '#131313', letter: '', number: 5 } },
      { bottom: { color: '#4268FF', letter: 'S', number: 6 }, right: { color: '#131313', letter: '', number: 8 } },
    ],
  ],
  [
    [
      { top: { color: '#131313', letter: '', number: 7 }, back: { color: '#E8430C', letter: 'C', number: 3 }, left: { color: '#8840F4', letter: 'W', number: 1 }},
      { top: { color: '#E8430C', letter: 'W', number: 8 }, back: { color: '#8840F4', letter: 'A', number: 2 }},
      { top: { color: '#E8430C', letter: 'A', number: 9 }, back: { color: '#E8430C', letter: 'W', number: 1 }, right: { color: '#E8430C', letter: 'A', number: 7 } },
    ],
    [
      { back: { color: '#131313', letter: '', number: 6 }, left: { color: '#131313', letter: '', number: 4 } },
      { back: { color: '#4268FF', letter: 'S', number: 5 } },
      { back: { color: '#8840F4', letter: 'U', number: 4 }, right: { color: '#131313', letter: '', number: 6 } },
    ],
    [
      { bottom: { color: '#131313', letter: '', number: 7 }, back: { color: '#131313', letter: '', number: 9 }, left: { color: '#8840F4', letter: 'U', number: 7 } },
      { bottom: { color: '#4268FF', letter: 'U', number: 8 }, back: { color: '#131313', letter: '', number: 8 }, left: { color: '#131313', letter: '', number: 8 } },
      { bottom: { color: '#131313', letter: '', number: 9 }, back: { color: '#131313', letter: '', number: 7 }, right: { color: '#8840F4', letter: 'S', number: 1 } },
    ],
  ],
];

interface CubeletProps {
  position: [number, number, number];
  faces: CubeFaceData;
}

const Cubelet: React.FC<CubeletProps> = ({ position, faces }) => {
  const [x, y, z] = position;

  const isRight = x === 1;
  const isLeft = x === -1;
  const isTop = y === 1;
  const isBottom = y === -1;
  const isFront = z === 1;
  const isBack = z === -1;

  const faceOffset = 0.501;
  const stickerSize = 0.85;

  return (
    <group position={position} userData={{ originalPosition: new THREE.Vector3(x, y, z) }}>
      <RoundedBox args={[1, 1, 1]} radius={0.05} smoothness={4}>
        <meshStandardMaterial 
          color="#3a3a3a" 
          roughness={0.18} 
          metalness={0.25}
          emissive="#1a1a1a"
          emissiveIntensity={0.25}
        />
      </RoundedBox>

      {isFront && faces.front && (
        <group position={[0, 0, faceOffset]} rotation={[0, 0, 0]}>
          <mesh renderOrder={1}>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial 
              color={faces.front.color} 
              roughness={0.12} 
              metalness={0.05}
              emissive={faces.front.color}
              emissiveIntensity={0.12}
              depthWrite={false}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.45}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight={800}
            depthTest={false}
            depthWrite={false}
            renderOrder={2}
          >
            {faces.front.letter || ''}
          </Text>
        </group>
      )}
      {isBack && faces.back && (
        <group position={[0, 0, -faceOffset]} rotation={[0, Math.PI, 0]}>
          <mesh renderOrder={1}>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial 
              color={faces.back.color} 
              roughness={0.12} 
              metalness={0.05}
              emissive={faces.back.color}
              emissiveIntensity={0.12}
              depthWrite={false}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.45}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight={800}
            depthTest={false}
            depthWrite={false}
            renderOrder={2}
          >
            {faces.back.letter || ''}
          </Text>
        </group>
      )}
      {isRight && faces.right && (
        <group position={[faceOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh renderOrder={1}>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial 
              color={faces.right.color} 
              roughness={0.12} 
              metalness={0.05}
              emissive={faces.right.color}
              emissiveIntensity={0.12}
              depthWrite={false}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.45}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight={800}
            depthTest={false}
            depthWrite={false}
            renderOrder={2}
            
          >
            {faces.right.letter || ''}
          </Text>
        </group>
      )}
      {isLeft && faces.left && (
        <group position={[-faceOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh renderOrder={1}>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial 
              color={faces.left.color} 
              roughness={0.12} 
              metalness={0.05}
              emissive={faces.left.color}
              emissiveIntensity={0.12}
              depthWrite={false}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.45}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight={800}
            depthTest={false}
            depthWrite={false}
            renderOrder={2}
          >
            {faces.left.letter || ''}
          </Text>
        </group>
      )}
      {isTop && faces.top && (
        <group position={[0, faceOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh renderOrder={1}>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial 
              color={faces.top.color} 
              roughness={0.12} 
              metalness={0.05}
              emissive={faces.top.color}
              emissiveIntensity={0.12}
              depthWrite={false}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.45}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight={800}
            rotation={[0, 0, (faces.top.rotation || 0) * Math.PI / 180]}
            depthTest={false}
            depthWrite={false}
            renderOrder={2}
            
          >
            {faces.top.letter || ''}
          </Text>
        </group>
      )}
      {isBottom && faces.bottom && (
        <group position={[0, -faceOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh renderOrder={1}>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial 
              color={faces.bottom.color} 
              roughness={0.12} 
              metalness={0.05}
              emissive={faces.bottom.color}
              emissiveIntensity={0.12}
              depthWrite={false}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.45}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight={800}
            rotation={[0, 0, (faces.bottom.rotation || 0) * Math.PI / 180]}
            depthTest={false}
            depthWrite={false}
            renderOrder={2}
          >
            {faces.bottom.letter || ''}
          </Text>
        </group>
      )}
    </group>
  );
};

interface WacusCubeProps {
  rotation?: [number, number, number];
  position?: [number, number, number];
  scale?: number;
  scrollProgress?: number;
}

export default function WacusCube({ 
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  scale = 1,
  scrollProgress
}: WacusCubeProps) {
  const groupRef = useRef<Group>(null);
  const fullCubeAxisRef = useRef(new THREE.Vector3(0, 1, 0).normalize());
  
  const cubeSize = 1;
  const spacing = 0.05;
  
  const leftFaceRef = useRef<Group>(null);
  const rightFaceRef = useRef<Group>(null);
  const centerFaceRef = useRef<Group>(null);
  
  const [group1Rotating, setGroup1Rotating] = useState(false);
  const [group1Target, setGroup1Target] = useState(0);
  const [group1Current, setGroup1Current] = useState(0);

  const [group2Rotating, setGroup2Rotating] = useState(false);
  const [group2Target, setGroup2Target] = useState(0);
  const [group2Current, setGroup2Current] = useState(0);

  const [group3Rotating, setGroup3Rotating] = useState(false);
  const [group3Target, setGroup3Target] = useState(0);
  const [group3Current, setGroup3Current] = useState(0);

  useEffect(() => {
    if (scrollProgress === undefined || scrollProgress === null) {
      setGroup1Rotating(true);
      setGroup1Target(2 * Math.PI);
      
      setGroup2Rotating(true);
      setGroup2Target(2 * Math.PI);
      
      setGroup3Rotating(true);
      setGroup3Target(-4 * Math.PI);
    }
  }, [scrollProgress]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '1' && !group1Rotating) {
        setGroup1Rotating(true);
        setGroup1Target(group1Current + Math.PI / 2);
      } else if (event.key === '2' && !group2Rotating) {
        setGroup2Rotating(true);
        setGroup2Target(group2Current + Math.PI / 2);
      } else if (event.key === '3' && !group3Rotating) {
        setGroup3Rotating(true);
        setGroup3Target(group3Current + Math.PI / 2);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [group1Rotating, group1Current, group2Rotating, group2Current, group3Rotating, group3Current]);

  useFrame((state, delta) => {
    if (scrollProgress !== undefined && scrollProgress !== null && scrollProgress >= 0) {
      const group1TargetRotation = 2 * Math.PI;
      const group2TargetRotation = 2 * Math.PI;
      const group3TargetRotation = -4 * Math.PI;
      
      if (leftFaceRef.current) {
        const rotation = group1TargetRotation * scrollProgress;
        leftFaceRef.current.rotation.x = rotation;
        setGroup1Current(rotation);
      }
      
      if (rightFaceRef.current) {
        const rotation = group2TargetRotation * scrollProgress;
        rightFaceRef.current.rotation.x = rotation;
        setGroup2Current(rotation);
      }
      
      if (centerFaceRef.current) {
        const rotation = group3TargetRotation * scrollProgress;
        centerFaceRef.current.rotation.x = rotation;
        setGroup3Current(rotation);
      }
      
      if (groupRef.current) {
        const totalRotation = -2 * Math.PI * scrollProgress;
        groupRef.current.setRotationFromAxisAngle(fullCubeAxisRef.current, totalRotation);
        groupRef.current.scale.setScalar(1.3);
      }
      
      return;
    }
    
    const group1Duration = 2.0;
    const group2Duration = 2.4;
    const group3Duration = 2.6;
    
    const group1Speed = Math.abs(2 * Math.PI) / group1Duration;
    const group2Speed = Math.abs(2 * Math.PI) / group2Duration;
    const group3Speed = Math.abs(-4 * Math.PI) / group3Duration;

    if (leftFaceRef.current && group1Rotating) {
      const diff = group1Target - group1Current;
      
      if (Math.abs(diff) > 0.01) {
        const step = Math.sign(diff) * Math.min(group1Speed * delta, Math.abs(diff));
        const newRotation = group1Current + step;
        setGroup1Current(newRotation);
        leftFaceRef.current.rotation.x = newRotation;
      } else {
        leftFaceRef.current.rotation.x = group1Target;
        setGroup1Current(group1Target);
        setGroup1Rotating(false);
      }
    }

    if (rightFaceRef.current && group2Rotating) {
      const diff = group2Target - group2Current;
      
      if (Math.abs(diff) > 0.01) {
        const step = Math.sign(diff) * Math.min(group2Speed * delta, Math.abs(diff));
        const newRotation = group2Current + step;
        setGroup2Current(newRotation);
        rightFaceRef.current.rotation.x = newRotation;
      } else {
        rightFaceRef.current.rotation.x = group2Target;
        setGroup2Current(group2Target);
        setGroup2Rotating(false);
      }
    }

    if (centerFaceRef.current && group3Rotating) {
      const diff = group3Target - group3Current;
      
      if (Math.abs(diff) > 0.01) {
        const step = Math.sign(diff) * Math.min(group3Speed * delta, Math.abs(diff));
        const newRotation = group3Current + step;
        setGroup3Current(newRotation);
        centerFaceRef.current.rotation.x = newRotation;
      } else {
        centerFaceRef.current.rotation.x = group3Target;
        setGroup3Current(group3Target);
        setGroup3Rotating(false);
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      rotation={rotation}
    >
      <group ref={leftFaceRef} position={[0, 0, 0]}>
        {cubeData.map((layer, zIndex) =>
          layer.map((row, yIndex) => {
            const y = 1 - yIndex;
            const z = 1 - zIndex;
            const x = -1;
            const cubeFaces = row[0];
            
            if (!cubeFaces) return null;
            
            const posX = x * spacing;
            const posY = y * spacing;
            const posZ = z * spacing;
            
            return (
              <group key={`left-${zIndex}-${yIndex}`} position={[posX, posY, posZ]}>
                <Cubelet position={[x, y, z]} faces={cubeFaces} />
              </group>
            );
          })
        )}
      </group>

      <group ref={rightFaceRef} position={[1 * spacing, 0 * spacing, 0 * spacing]}>
        {cubeData.map((layer, zIndex) =>
          layer.map((row, yIndex) => {
            const y = 1 - yIndex;
            const z = 1 - zIndex;
            const x = 1;
            const cubeFaces = row[2];
            
            if (!cubeFaces) return null;
            
            const centerX = 1;
            const centerY = 0;
            const centerZ = 0;
            const posX = (x - centerX) * spacing;
            const posY = (y - centerY) * spacing;
            const posZ = (z - centerZ) * spacing;
            
            return (
              <group key={`right-${zIndex}-${yIndex}`} position={[posX, posY, posZ]}>
                <Cubelet position={[x, y, z]} faces={cubeFaces} />
              </group>
            );
          })
        )}
      </group>

      <group ref={centerFaceRef} position={[0 * spacing, 0 * spacing, 0 * spacing]}>
        {cubeData.map((layer, zIndex) =>
          layer.map((row, yIndex) => {
            const y = 1 - yIndex;
            const z = 1 - zIndex;
            const x = 0;
            const cubeFaces = row[1];
            
            if (!cubeFaces) return null;
            
            const centerX = 0;
            const centerY = 0;
            const centerZ = 0;
            const posX = (x - centerX) * spacing;
            const posY = (y - centerY) * spacing;
            const posZ = (z - centerZ) * spacing;
            
            return (
              <group key={`center-${zIndex}-${yIndex}`} position={[posX, posY, posZ]}>
                <Cubelet position={[x, y, z]} faces={cubeFaces} />
              </group>
            );
          })
        )}
      </group>
    </group>
  );
}
