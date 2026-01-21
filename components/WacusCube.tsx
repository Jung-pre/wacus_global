'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

interface FaceData {
  color: string;
  letter: string;
  number?: number; // 1~9 번호
  rotation?: number; // 글자 회전 (180 = 뒤집힘)
}

interface CubeFaceData {
  front?: FaceData;  // 앞면 (Z+)
  back?: FaceData;   // 뒷면 (Z-)
  top?: FaceData;    // 위면 (Y+)
  bottom?: FaceData; // 아래면 (Y-)
  left?: FaceData;   // 왼쪽면 (X-)
  right?: FaceData;  // 오른쪽면 (X+)
}

// 전개도 방식: 각 면을 정면에서 바라봤을 때 1-9를 순서대로 배치
// 각 면의 번호 계산 함수
const getFaceNumber = (
  face: 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom',
  x: number, y: number, z: number
): number => {
  // 각 면을 정면에서 바라봤을 때의 그리드 위치 (0-2)
  let col = 0, row = 0;
  
  switch (face) {
    case 'front': // 정면: x(-1,0,1), y(1,0,-1) -> 1,2,3 / 4,5,6 / 7,8,9
      col = x + 1; // -1->0, 0->1, 1->2
      row = 1 - y; // 1->0, 0->1, -1->2
      break;
    case 'back': // 뒤: x(1,0,-1), y(1,0,-1) -> 좌우 반전 -> 3,2,1 / 6,5,4 / 9,8,7
      col = 2 - (x + 1); // 좌우 반전
      row = 1 - y;
      break;
    case 'right': // 오른쪽: z(1,0,-1), y(1,0,-1) -> 1,2,3 / 4,5,6 / 7,8,9
      col = 1 - z; // 1->0, 0->1, -1->2
      row = 1 - y;
      break;
    case 'left': // 왼쪽: z(-1,0,1), y(1,0,-1) -> 좌우 반전 -> 3,2,1 / 6,5,4 / 9,8,7
      col = 2 - (z + 1); // 좌우 반전
      row = 1 - y;
      break;
    case 'top': // 위: x(-1,0,1), z(1,0,-1) -> 1,2,3 / 4,5,6 / 7,8,9
      col = x + 1;
      row = 1 - z;
      break;
    case 'bottom': // 아래: x(-1,0,1), z(-1,0,1) -> 상하 반전 -> 7,8,9 / 4,5,6 / 1,2,3
      col = x + 1;
      row = 2 - (z + 1); // 상하 반전
      break;
  }
  
  return row * 3 + col + 1; // 1-9
};

// 3x3x3 큐브의 각 위치별 면 데이터
// [z][y][x] 순서 (z: 앞뒤, y: 위아래, x: 좌우)
//
// 각 면의 번호 배치 (전개도 형태):
// FRONT (z=1):     BACK (z=-1):    RIGHT (x=1):     LEFT (x=-1):     TOP (y=1):       BOTTOM (y=-1):
//   1  2  3           3  2  1          1  2  3          3  2  1          1  2  3          7  8  9
//   4  5  6           6  5  4          4  5  6          6  5  4          4  5  6          4  5  6
//   7  8  9           9  8  7          7  8  9          9  8  7          7  8  9          1  2  3
//
const cubeData: CubeFaceData[][][] = [
  // ===== Z=0 (앞쪽 레이어, z=1) =====
  [
    // Y=2 (위쪽 행, y=1)
    [
      { front: { color: '#8840F4', letter: 'W', number: 1 }, top: { color: '#131313', letter: '', number: 1 }, left: { color: '#131313', letter: '', number: 3 }},
      { front: { color: '#8840F4', letter: 'A', number: 2 }, top: { color: '#E8430C', letter: 'U', number: 2 }, right: { color: '#7c3aed', letter: 'RIGHT', number: 2 } },
      { front: { color: '#131313', letter: '', number: 3 }, top: { color: '#E8430C', letter: 'S', number: 3 }, right: { color: '#4268FF', letter: 'W', number: 3 } },
    ],
    // Y=1 (중간 행, y=0)
    [
      { front: { color: '#131313', letter: '', number: 4 }, left: { color: '#131313', letter: '', number: 6 }},
      { front: { color: '#131313', letter: '', number: 5 } },
      { front: { color: '#131313', letter: '', number: 6 }, right: { color: '#131313', letter: '', number: 6 } },
    ],
    // Y=0 (아래쪽 행, y=-1)
    [
      { front: { color: '#8840F4', letter: 'C', number: 7 }, bottom: { color: '#4268FF', letter: 'W', number: 1 }, left: { color: '#4268FF', letter: 'S', number: 9 }},
      { front: { color: '#8840F4', letter: 'U', number: 8 }, bottom: { color: '#131313', letter: '', number: 2 }},
      { front: { color: '#8840F4', letter: 'S', number: 9 }, bottom: { color: '#4268FF', letter: 'A', number: 3 }, right: { color: '#4268FF', letter: 'U', number: 9 } },
    ],
  ],
  // ===== Z=1 (중간 레이어, z=0) =====
  [
    // Y=2 (위쪽 행, y=1)
    [
      { top: { color: '#131313', letter: '', number: 4 }, left: { color: '#E8430C', letter: 'A', number: 2 }},
      { top: { color: '#E8430C', letter: 'C', number: 5 }},
      { top: { color: '#131313', letter: '', number: 6 }, right: { color: '#131313', letter: '', number: 2 } },
    ],
    // Y=1 (중간 행, y=0)
    [
      { left: { color: '#E8430C', letter: 'C', number: 5 } },
      {},
      { right: { color: '#E8430C', letter: 'C', number: 5 } },
    ],
    // Y=0 (아래쪽 행, y=-1)
    [
      { bottom: { color: '#4268FF', letter: 'C', number: 4 }, left: { color: '#131313', letter: '', number: 8 } },
      { bottom: { color: '#131313', letter: '', number: 5 } },
      { bottom: { color: '#4268FF', letter: 'S', number: 6 }, right: { color: '#131313', letter: '', number: 8 } },
    ],
  ],
  // ===== Z=2 (뒤쪽 레이어, z=-1) =====
  [
    // Y=2 (위쪽 행, y=1)
    [
      { top: { color: '#131313', letter: '', number: 7 }, back: { color: '#E8430C', letter: 'C', number: 3 }, left: { color: '#8840F4', letter: 'W', number: 1 }},
      { top: { color: '#E8430C', letter: 'W', number: 8 }, back: { color: '#8840F4', letter: 'A', number: 2 }},
      { top: { color: '#E8430C', letter: 'A', number: 9 }, back: { color: '#E8430C', letter: 'W', number: 1 }, right: { color: '#E8430C', letter: 'A', number: 7 } },
    ],
    // Y=1 (중간 행, y=0)
    [
      { back: { color: '#131313', letter: '', number: 6 }, left: { color: '#131313', letter: '', number: 4 } },
      { back: { color: '#4268FF', letter: 'S', number: 5 } },
      { back: { color: '#8840F4', letter: 'U', number: 4 }, right: { color: '#131313', letter: '', number: 6 } },
    ],
    // Y=0 (아래쪽 행, y=-1)
    [
      { bottom: { color: '#131313', letter: '', number: 7 }, back: { color: '#131313', letter: '', number: 9 }, left: { color: '#8840F4', letter: 'U', number: 7 } },
      { bottom: { color: '#4268FF', letter: 'U', number: 8 }, back: { color: '#131313', letter: '', number: 8 }, left: { color: '#131313', letter: '', number: 8 } },
      { bottom: { color: '#131313', letter: '', number: 9 }, back: { color: '#131313', letter: '', number: 7 }, right: { color: '#8840F4', letter: 'S', number: 1 } },
    ],
  ],
];

interface CubeletProps {
  position: [number, number, number]; // [-1, 0, 1] 범위
  faces: CubeFaceData;
}

// 개별 큐브 컴포넌트 (참고 코드 방식)
const Cubelet: React.FC<CubeletProps> = ({ position, faces }) => {
  const [x, y, z] = position;

  // 바깥면인지 확인 (참고 코드 방식)
  const isRight = x === 1;
  const isLeft = x === -1;
  const isTop = y === 1;
  const isBottom = y === -1;
  const isFront = z === 1;
  const isBack = z === -1;

  // 각 면에 직접 렌더링하기 위한 설정
  const faceOffset = 0.501; // 큐브 면보다 약간 앞으로 (Z-fighting 방지)
  const stickerSize = 0.85;

  return (
    <group position={position} userData={{ originalPosition: new THREE.Vector3(x, y, z) }}>
      {/* The main black plastic body - 볼록 튀어나와 보이는 효과 */}
      <RoundedBox args={[1, 1, 1]} radius={0.05} smoothness={4}>
        <meshStandardMaterial 
          color="#3a3a3a" 
          roughness={0.18} 
          metalness={0.25}
          emissive="#1a1a1a"
          emissiveIntensity={0.25}
        />
      </RoundedBox>

      {/* 각 면에 직접 렌더링 - 배경과 텍스트를 면에 정확히 배치 */}
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
  scrollProgress?: number; // 스크롤 진행도 (0~1)
}

export default function WacusCube({ 
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  scale = 1,
  scrollProgress
}: WacusCubeProps) {
  const groupRef = useRef<Group>(null);
  const fullCubeAxisRef = useRef(new THREE.Vector3(0, 1, 0).normalize()); // 전체 큐브 역방향 회전 축 (y축 기준)
  
  const cubeSize = 1; // 각 큐브의 크기 (RoundedBox args={[1, 1, 1]})
  // 큐브 장난감처럼 완전히 붙이기: 중심점 간 거리 = 큐브 크기 (간격 없음)
  const spacing = 0.05; // 간격 조정
  
  // 3개의 그룹: left면, right면, 가운데
  const leftFaceRef = useRef<Group>(null);   // x=-1 (1번 그룹)
  const rightFaceRef = useRef<Group>(null);  // x=1 (2번 그룹)
  const centerFaceRef = useRef<Group>(null); // x=0 (3번 그룹)
  
  // 각 그룹의 회전 상태 관리
  const [group1Rotating, setGroup1Rotating] = useState(false);
  const [group1Target, setGroup1Target] = useState(0);
  const [group1Current, setGroup1Current] = useState(0);

  const [group2Rotating, setGroup2Rotating] = useState(false);
  const [group2Target, setGroup2Target] = useState(0);
  const [group2Current, setGroup2Current] = useState(0);

  const [group3Rotating, setGroup3Rotating] = useState(false);
  const [group3Target, setGroup3Target] = useState(0);
  const [group3Current, setGroup3Current] = useState(0);

  // 초기 회전 설정: 각 그룹을 지정된 방향과 바퀴 수로 회전
  // scrollProgress가 제공되면 스크롤 기반 회전, 아니면 자동 회전
  useEffect(() => {
    if (scrollProgress === undefined || scrollProgress === null) {
      // 1번 그룹: 정방향 1바퀴 (2π)
      setGroup1Rotating(true);
      setGroup1Target(2 * Math.PI);
      
      // 2번 그룹: 정방향 1바퀴 (2π)
      setGroup2Rotating(true);
      setGroup2Target(2 * Math.PI);
      
      // 3번 그룹: 역방향 2바퀴 (-4π)
      setGroup3Rotating(true);
      setGroup3Target(-4 * Math.PI);
    }
  }, [scrollProgress]);

  // 키보드 이벤트 핸들러
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

  // 회전 애니메이션 - 스크롤 진행도에 따라 회전 또는 자동 회전
  useFrame((state, delta) => {
    // 스크롤 기반 회전인 경우
    if (scrollProgress !== undefined && scrollProgress !== null && scrollProgress >= 0) {
      // 각 그룹의 목표 회전량
      const group1TargetRotation = 2 * Math.PI; // 정방향 1바퀴
      const group2TargetRotation = 2 * Math.PI; // 정방향 1바퀴
      const group3TargetRotation = -4 * Math.PI; // 역방향 2바퀴
      
      // 스크롤 진행도에 따라 회전 각도 설정
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
      
      // 전체 큐브를 사선으로 1바퀴 회전 (결국 제자리로 돌아옴)
      if (groupRef.current) {
        const totalRotation = -2 * Math.PI * scrollProgress; // 역방향 1바퀴
        groupRef.current.setRotationFromAxisAngle(fullCubeAxisRef.current, totalRotation);
        // 스케일 1.3으로 고정
        groupRef.current.scale.setScalar(1.3);
      }
      
      return; // 스크롤 기반 회전이면 자동 회전 로직 건너뛰기
    }
    
    // 자동 회전 로직 (scrollProgress가 없을 때)
    // 각 그룹의 duration 설정
    const group1Duration = 2.0; // 1바퀴를 2초에
    const group2Duration = 2.4; // 1바퀴를 2.4초에
    const group3Duration = 2.6; // 역방향 2바퀴를 2.6초에
    
    // 각 그룹의 목표 회전량에 따라 속도 계산
    // 1번: 2π (정방향 1바퀴), 2번: 2π (정방향 1바퀴), 3번: -4π (역방향 2바퀴)
    const group1Speed = Math.abs(2 * Math.PI) / group1Duration; // π/초
    const group2Speed = Math.abs(2 * Math.PI) / group2Duration; // 약 2.618 rad/초 (π/1.2)
    const group3Speed = Math.abs(-4 * Math.PI) / group3Duration; // 약 4.83 rad/초 (4π/2.6)

    // 1번 그룹 (left면) - 정방향 1바퀴
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

    // 2번 그룹 (right면) - 정방향 1바퀴 (2.4초에 완료)
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

    // 3번 그룹 (center) - 역방향 2바퀴 (2.6초에 완료)
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
      {/* 1. left면(x=-1) 그룹 - 회전 중심을 원점으로 맞추기 위해 position을 [0,0,0]으로 설정 */}
      <group ref={leftFaceRef} position={[0, 0, 0]}>
        {cubeData.map((layer, zIndex) =>
          layer.map((row, yIndex) => {
            const y = 1 - yIndex;
            const z = 1 - zIndex;
            const x = -1; // left면은 x=-1
            const cubeFaces = row[0]; // xIndex=0 -> x=-1
            
            if (!cubeFaces) return null;
            
            // left면의 큐브들을 원점 기준으로 배치 (회전 중심이 원점이 되도록)
            const posX = x * spacing; // x * spacing (원점 기준)
            const posY = y * spacing; // y * spacing
            const posZ = z * spacing; // z * spacing
            
            return (
              <group key={`left-${zIndex}-${yIndex}`} position={[posX, posY, posZ]}>
                <Cubelet position={[x, y, z]} faces={cubeFaces} />
              </group>
            );
          })
        )}
      </group>

      {/* 2. right면(x=1) 그룹 */}
      <group ref={rightFaceRef} position={[1 * spacing, 0 * spacing, 0 * spacing]}>
        {cubeData.map((layer, zIndex) =>
          layer.map((row, yIndex) => {
            const y = 1 - yIndex;
            const z = 1 - zIndex;
            const x = 1; // right면은 x=1
            const cubeFaces = row[2]; // xIndex=2 -> x=1
            
            if (!cubeFaces) return null;
            
            // right면의 5번 큐브(x=1, y=0, z=0)를 중심으로 상대 위치 계산
            const centerX = 1;
            const centerY = 0;
            const centerZ = 0;
            const posX = (x - centerX) * spacing; // 항상 0
            const posY = (y - centerY) * spacing; // y * spacing
            const posZ = (z - centerZ) * spacing; // z * spacing
            
            return (
              <group key={`right-${zIndex}-${yIndex}`} position={[posX, posY, posZ]}>
                <Cubelet position={[x, y, z]} faces={cubeFaces} />
              </group>
            );
          })
        )}
      </group>

      {/* 3. 가운데(x=0) 그룹 */}
      <group ref={centerFaceRef} position={[0 * spacing, 0 * spacing, 0 * spacing]}>
        {cubeData.map((layer, zIndex) =>
          layer.map((row, yIndex) => {
            const y = 1 - yIndex;
            const z = 1 - zIndex;
            const x = 0; // 가운데는 x=0
            const cubeFaces = row[1]; // xIndex=1 -> x=0
            
            if (!cubeFaces) return null;
            
            // 가운데 그룹의 5번 큐브(x=0, y=0, z=0)를 중심으로 상대 위치 계산
            const centerX = 0;
            const centerY = 0;
            const centerZ = 0;
            const posX = (x - centerX) * spacing; // 항상 0
            const posY = (y - centerY) * spacing; // y * spacing
            const posZ = (z - centerZ) * spacing; // z * spacing
            
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
