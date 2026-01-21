'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PathAnimation.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PathAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bold1Ref = useRef<HTMLElement>(null);
  const bold2Ref = useRef<HTMLElement>(null);
  const bold3Ref = useRef<HTMLElement>(null);
  const boldTitleRef = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const gradientAnimationStartedRef = useRef(false);
  const pointDistancesRef = useRef<{ point1: number; point2: number; point3: number } | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !pathRef.current || !svgRef.current) return;
    if (!bold1Ref.current || !bold2Ref.current || !bold3Ref.current) return;
    if (!boldTitleRef.current || !subtitleRef.current) return;

    const section = sectionRef.current;
    const path = pathRef.current;
    const svg = svgRef.current;
    
    // 각 strong 요소의 위치 계산 (텍스트를 정확히 관통하도록)
    const getElementCenter = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - sectionRect.left,
        y: rect.top + rect.height / 2 - sectionRect.top,
      };
    };

    // 각 strong 요소의 왼쪽 상단 위치 (경로가 텍스트를 더 정확히 관통하도록)
    const getElementTopLeft = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      return {
        x: rect.left - sectionRect.left,
        y: rect.top - sectionRect.top,
      };
    };

    // "D"자의 꼭지점 위치 계산 (첫 글자의 상단 꼭지점 - 곡선의 최상단)
    const getDTopPoint = (el: HTMLElement) => {
      const range = document.createRange();
      const textNode = el.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        // 텍스트 노드가 없으면 요소의 상단 사용
        const rect = el.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        return {
          x: rect.left + rect.width * 0.12 - sectionRect.left, // "D"의 왼쪽에서 약 12% 지점
          y: rect.top + 50 - sectionRect.top, // 상단에서 약 50px 아래
        };
      }
      
      // 첫 글자 "D"의 위치 찾기
      range.setStart(textNode, 0);
      range.setEnd(textNode, 1);
      const rect = range.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      
      // "D"의 상단 꼭지점: 너비의 약 12% 지점, 상단에서 약 50px 아래
      return {
        x: rect.left + rect.width * 0.12 - sectionRect.left,
        y: rect.top + 50 - sectionRect.top,
      };
    };

    // SVG 크기를 섹션에 맞춤
    const updatePath = () => {
      const sectionRect = section.getBoundingClientRect();
      svg.setAttribute('width', `${sectionRect.width}`);
      svg.setAttribute('height', `${sectionRect.height}`);
      svg.setAttribute('viewBox', `0 0 ${sectionRect.width} ${sectionRect.height}`);

      const point1 = getElementCenter(bold1Ref.current!);
      const point2 = getElementCenter(bold2Ref.current!);
      const point3 = getElementCenter(bold3Ref.current!);
      const point4 = getDTopPoint(boldTitleRef.current!); // "D"의 꼭지점

      // 각 bold 텍스트의 경계 정보 (다른 텍스트를 피하기 위해)
      const rect1 = bold1Ref.current!.getBoundingClientRect();
      const rect2 = bold2Ref.current!.getBoundingClientRect();
      const rect3 = bold3Ref.current!.getBoundingClientRect();

      // 시작점 (섹션의 오른쪽 상단, 첫 번째 텍스트보다 위에서 시작)
      const startX = sectionRect.width - 50;
      const startY = Math.min(50, point1.y - 100); // 첫 번째 텍스트보다 위에서 시작

      // 각 포인트 간 방향 벡터 계산 (부드러운 연결을 위해)
      const dir1X = point1.x - startX;
      const dir1Y = point1.y - startY;
      const dir2X = point2.x - point1.x;
      const dir2Y = point2.y - point1.y;
      const dir3X = point3.x - point2.x;
      const dir3Y = point3.y - point2.y;
      const dir4X = point4.x - point3.x;
      const dir4Y = point4.y - point3.y;

      // 방향 벡터 정규화 (길이 계산)
      const len1 = Math.sqrt(dir1X * dir1X + dir1Y * dir1Y);
      const len2 = Math.sqrt(dir2X * dir2X + dir2Y * dir2Y);
      const len3 = Math.sqrt(dir3X * dir3X + dir3Y * dir3Y);
      const len4 = Math.sqrt(dir4X * dir4X + dir4Y * dir4Y);

      // 두 점 사이의 거리를 구하는 함수
      const getDist = (x1: number, y1: number, x2: number, y2: number) => 
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

      // 부드러운 제어점 계산 함수 (핵심!)
      const getControlPoints = (
        prev: { x: number; y: number },
        curr: { x: number; y: number },
        next: { x: number; y: number },
        tension: number = 0.2
      ) => {
        const d1 = getDist(prev.x, prev.y, curr.x, curr.y);
        const d2 = getDist(curr.x, curr.y, next.x, next.y);
        
        // 거리가 0인 경우 처리
        if (d1 + d2 === 0) {
          return { in: { x: curr.x, y: curr.y }, out: { x: curr.x, y: curr.y } };
        }
        
        // 이전 점과 다음 점 사이의 벡터를 활용해 현재 점에서의 "접선" 방향을 구함
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;

        const c1x = curr.x - dx * tension * (d1 / (d1 + d2));
        const c1y = curr.y - dy * tension * (d1 / (d1 + d2));
        const c2x = curr.x + dx * tension * (d2 / (d1 + d2));
        const c2y = curr.y + dy * tension * (d2 / (d1 + d2));

        return { in: { x: c1x, y: c1y }, out: { x: c2x, y: c2y } };
      };

      // 웨이브 크기 및 위치
      const waveDist = 150; // 웨이브 크기 (다른 텍스트를 피하기 위해 조정)
      const waveProgress = 0.7; // 포인트에 도달하기 전 70% 지점에서 웨이브

      // 수직 벡터 계산 함수 (방향 벡터에 수직인 벡터)
      const getPerpendicular = (dx: number, dy: number, len: number) => {
        if (len === 0) return { x: 0, y: 1 };
        const perpX = -dy / len;
        const perpY = dx / len;
        return { x: perpX, y: perpY };
      };

      // 각 포인트로 가기 전 웨이브 포인트 계산 함수 (하나의 웨이브만)
      const createWavePoints = (
        fromX: number, fromY: number,
        toX: number, toY: number,
        dirX: number, dirY: number,
        len: number
      ) => {
        // 웨이브 위치 (포인트에 도달하기 전)
        const waveX = fromX + (toX - fromX) * waveProgress;
        const waveY = fromY + (toY - fromY) * waveProgress;

        // 수직 벡터 계산
        const perp = getPerpendicular(dirX, dirY, len);

        // 웨이브 포인트 (수직 방향으로 웨이브 크기만큼 이동)
        const wavePointX = waveX + perp.x * waveDist;
        const wavePointY = waveY + perp.y * waveDist;

        return { wavePointX, wavePointY };
      };

      // 웨이브 포인트 생성 (다른 텍스트를 피하도록 방향 조정)
      const waves1 = createWavePoints(startX, startY, point1.x, point1.y, dir1X, dir1Y, len1);
      const waves2 = createWavePoints(point1.x, point1.y, point2.x, point2.y, dir2X, dir2Y, len2);
      const waves3 = createWavePoints(point2.x, point2.y, point3.x, point3.y, dir3X, dir3Y, len3);
      const waves4 = createWavePoints(point3.x, point3.y, point4.x, point4.y, dir4X, dir4Y, len4);

      // 웨이브 포인트가 각 bold 텍스트 영역을 정확히 관통하도록 조정
      const sectionTop = section.getBoundingClientRect().top;
      
      // 첫 번째 웨이브는 첫 번째 텍스트 위쪽으로
      if (waves1.wavePointY > rect1.top - sectionTop - 30) {
        waves1.wavePointY = rect1.top - sectionTop - 30;
      }
      
      // 두 번째 웨이브는 첫 번째와 두 번째 텍스트 사이로
      if (waves2.wavePointY < rect1.bottom - sectionTop + 20 || waves2.wavePointY > rect2.top - sectionTop - 20) {
        const midY = (rect1.bottom - sectionTop + rect2.top - sectionTop) / 2;
        waves2.wavePointY = midY;
      }
      
      // 세 번째 웨이브는 두 번째와 세 번째 텍스트 사이로
      if (waves3.wavePointY < rect2.bottom - sectionTop + 20 || waves3.wavePointY > rect3.top - sectionTop - 20) {
        const midY = (rect2.bottom - sectionTop + rect3.top - sectionTop) / 2;
        waves3.wavePointY = midY;
      }

      // 모든 점 배열 (웨이브 포함)
      const points = [
        { x: startX, y: startY },
        { x: waves1.wavePointX, y: waves1.wavePointY },
        { x: point1.x, y: point1.y },
        { x: waves2.wavePointX, y: waves2.wavePointY },
        { x: point2.x, y: point2.y },
        { x: waves3.wavePointX, y: waves3.wavePointY },
        { x: point3.x, y: point3.y },
        { x: waves4.wavePointX, y: waves4.wavePointY },
        { x: point4.x, y: point4.y },
      ];

      // 각 점에 대한 제어점 계산 (부드러운 곡선을 위해)
      const controlPoints: Array<{ in: { x: number; y: number }; out: { x: number; y: number } }> = [];
      for (let i = 0; i < points.length; i++) {
        const prev = i === 0 ? points[i] : points[i - 1];
        const curr = points[i];
        const next = i === points.length - 1 ? points[i] : points[i + 1];
        // 웨이브 포인트는 더 큰 tension으로 부드럽게
        const isWavePoint = i === 1 || i === 3 || i === 5 || i === 7;
        // 메인 포인트는 더 부드럽게, 웨이브는 적당히
        const tension = isWavePoint ? 0.4 : 0.35;
        controlPoints.push(getControlPoints(prev, curr, next, tension));
      }

      // 부드러운 파도 모양 경로 생성
      let pathData = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const cp = controlPoints[i];
        const nextCp = controlPoints[i + 1];
        pathData += ` C ${cp.out.x} ${cp.out.y}, ${nextCp.in.x} ${nextCp.in.y}, ${points[i + 1].x} ${points[i + 1].y}`;
      }

      path.setAttribute('d', pathData);

      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = `${pathLength}`;
      path.style.strokeDashoffset = `${pathLength}`;
      
      // 각 포인트가 path의 어느 지점에 있는지 계산
      // SVG path의 getPointAtLength를 사용하여 각 포인트에 가장 가까운 위치 찾기
      if (pathLength > 0) {
        const findClosestPathLength = (targetX: number, targetY: number) => {
          let closestLength = 0;
          let minDistance = Infinity;
          
          // Path를 여러 지점에서 샘플링하여 가장 가까운 위치 찾기
          const sampleStep = Math.max(10, pathLength / 100); // 최소 10px 간격으로 샘플링
          for (let len = 0; len <= pathLength; len += sampleStep) {
            try {
              const point = path.getPointAtLength(len);
              const distance = Math.sqrt((point.x - targetX) ** 2 + (point.y - targetY) ** 2);
              if (distance < minDistance) {
                minDistance = distance;
                closestLength = len;
              }
            } catch (e) {
              // getPointAtLength가 실패할 수 있으므로 무시
              continue;
            }
          }
          return closestLength;
        };
        
        // 각 포인트까지의 거리 저장
        pointDistancesRef.current = {
          point1: findClosestPathLength(point1.x, point1.y),
          point2: findClosestPathLength(point2.x, point2.y),
          point3: findClosestPathLength(point3.x, point3.y),
        };
      }
    };

    // 초기 경로 생성
    updatePath();

    // 리사이즈 시 경로 업데이트
    const handleResize = () => {
      updatePath();
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    const ctx = gsap.context(() => {
      // Path 애니메이션이 완료되는 시점 (약 98%에서 Path가 "D"에 도달)
      const pathCompleteProgress = 0.98;
      
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const pathLength = path.getTotalLength();
          
          // Path 애니메이션 (0 ~ pathCompleteProgress까지)
          if (progress <= pathCompleteProgress) {
            const pathProgress = progress / pathCompleteProgress;
            const currentPathLength = pathLength * pathProgress;
            path.style.strokeDashoffset = `${pathLength * (1 - pathProgress)}`;
            
            // 각 포인트를 지났는지 확인 (미리 계산된 거리 사용)
            if (pointDistancesRef.current) {
              const { point1, point2, point3 } = pointDistancesRef.current;
              const tolerance = pathLength * 0.03; // 3% 허용 오차
              
              if (bold1Ref.current && bold1Ref.current.parentElement) {
                const pathText1 = bold1Ref.current.parentElement as HTMLElement;
                if (currentPathLength >= point1 - tolerance) {
                  pathText1.classList.add(styles.closePath);
                } else {
                  pathText1.classList.remove(styles.closePath);
                }
              }
              
              if (bold2Ref.current && bold2Ref.current.parentElement) {
                const pathText2 = bold2Ref.current.parentElement as HTMLElement;
                if (currentPathLength >= point2 - tolerance) {
                  pathText2.classList.add(styles.closePath);
                } else {
                  pathText2.classList.remove(styles.closePath);
                }
              }
              
              if (bold3Ref.current && bold3Ref.current.parentElement) {
                const pathText3 = bold3Ref.current.parentElement as HTMLElement;
                if (currentPathLength >= point3 - tolerance) {
                  pathText3.classList.add(styles.closePath);
                } else {
                  pathText3.classList.remove(styles.closePath);
                }
              }
            }
          } else {
            // Path 완료 후에는 완전히 그려진 상태 유지
            path.style.strokeDashoffset = '0';
            
            // 모든 포인트에 closePath 클래스 추가
            if (bold1Ref.current && bold1Ref.current.parentElement) {
              bold1Ref.current.parentElement.classList.add(styles.closePath);
            }
            if (bold2Ref.current && bold2Ref.current.parentElement) {
              bold2Ref.current.parentElement.classList.add(styles.closePath);
            }
            if (bold3Ref.current && bold3Ref.current.parentElement) {
              bold3Ref.current.parentElement.classList.add(styles.closePath);
            }
          }

          // Path가 완료된 후 자동 그라데이션 애니메이션 (1.5초)
          if (boldTitleRef.current && subtitleRef.current) {
            if (progress >= pathCompleteProgress && !gradientAnimationStartedRef.current) {
              // Path 완료 후 자동 애니메이션 시작 (한 번만 실행)
              gradientAnimationStartedRef.current = true;
              
              const whiteColor = `rgba(255, 255, 255, 0.2)`;
              const orangeColor = `rgb(232, 67, 12)`;
              const subtitleWhiteColor = `rgb(255, 255, 255)`;
              const subtitleGrayColor = `rgb(88, 88, 88)`;
              
              const titleElement = boldTitleRef.current;
              const subtitleElement = subtitleRef.current;
              
              // title 텍스트에만 그라데이션 적용
              titleElement.style.backgroundClip = 'text';
              titleElement.style.webkitBackgroundClip = 'text';
              titleElement.style.webkitTextFillColor = 'transparent';
              titleElement.style.color = 'transparent';
              
              // subtitle 텍스트에만 그라데이션 적용
              subtitleElement.style.backgroundClip = 'text';
              subtitleElement.style.webkitBackgroundClip = 'text';
              subtitleElement.style.webkitTextFillColor = 'transparent';
              subtitleElement.style.color = 'transparent';
              
              // GSAP timeline으로 1.5초 동안 부드러운 연속 애니메이션
              const titleAnimationData = { whiteStop: 0, orangeStop: 0 };
              const subtitleAnimationData = { grayStop: 0, whiteStop: 0 };
              const tl = gsap.timeline({ smoothChildTiming: true });
              
              // Title 1단계 시작: linear-gradient(90deg, rgb(232, 67, 12) 0%, rgb(232, 67, 12) 0%, rgba(255, 255, 255, 0.2) 0%)
              tl.set(titleElement, {
                backgroundImage: `linear-gradient(90deg, ${orangeColor} 0%, ${orangeColor} 0%, ${whiteColor} 0%)`,
              });
              
              // Subtitle 1단계 시작: linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(88, 88, 88) 0%)
              tl.set(subtitleElement, {
                backgroundImage: `linear-gradient(90deg, ${subtitleWhiteColor} 0%, ${subtitleGrayColor} 0%)`,
              }, '<'); // 동시에 시작
              
              // Title 2단계: 흰색 stop이 0%에서 100%로 (0.5초)
              // Subtitle 2단계: 회색 stop이 0%에서 100%로 (0.5초)
              tl.to(titleAnimationData, {
                whiteStop: 100,
                duration: 0.5,
                ease: 'sine.out',
                onUpdate: function() {
                  const whiteStop = titleAnimationData.whiteStop;
                  titleElement.style.backgroundImage = `linear-gradient(90deg, ${orangeColor} 0%, ${orangeColor} 0%, ${whiteColor} ${whiteStop}%)`;
                },
              });
              tl.to(subtitleAnimationData, {
                grayStop: 100,
                duration: 0.5,
                ease: 'sine.out',
                onUpdate: function() {
                  const grayStop = subtitleAnimationData.grayStop;
                  subtitleElement.style.backgroundImage = `linear-gradient(90deg, ${subtitleWhiteColor} 0%, ${subtitleGrayColor} ${grayStop}%)`;
                },
              }, '<'); // 동시에 시작
              
              // Title 3단계: 주황색 stop이 0%에서 100%로 (1초)
              // Subtitle 3단계: 흰색 stop이 0%에서 100%로 (1초)
              tl.to(titleAnimationData, {
                orangeStop: 100,
                duration: 1.0,
                ease: 'sine.inOut',
                onUpdate: function() {
                  const orangeStop = titleAnimationData.orangeStop;
                  titleElement.style.backgroundImage = `linear-gradient(90deg, ${orangeColor} 0%, ${orangeColor} ${orangeStop}%, ${whiteColor} 100%)`;
                },
              });
              tl.to(subtitleAnimationData, {
                whiteStop: 100,
                duration: 1.0,
                ease: 'sine.inOut',
                onUpdate: function() {
                  const whiteStop = subtitleAnimationData.whiteStop;
                  subtitleElement.style.backgroundImage = `linear-gradient(90deg, ${subtitleWhiteColor} ${whiteStop}%, ${subtitleGrayColor} 100%)`;
                },
              }, '<'); // 동시에 시작
            } else if (progress < pathCompleteProgress) {
              // Path 완료 전에는 기본 색상 유지
              if (boldTitleRef.current) {
                boldTitleRef.current.style.backgroundImage = '';
                boldTitleRef.current.style.backgroundClip = '';
                boldTitleRef.current.style.webkitBackgroundClip = '';
                boldTitleRef.current.style.webkitTextFillColor = '';
                boldTitleRef.current.style.color = '';
              }
              if (subtitleRef.current) {
                subtitleRef.current.style.color = `rgba(237, 237, 237, 0.20)`;
              }
              gradientAnimationStartedRef.current = false;
            }
          }
        },
      });
    }, section);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={sectionRef} className={styles.pathAnimationSection}>
      <div className={styles.pathTextContainer}>
        <p className={styles.pathText}>
          WACUS builds high-performance, responsive<br />
          platforms and <strong ref={bold1Ref} className={styles.pathTextBold}>custom-engineered</strong> systems.
        </p>
        <p className={styles.pathText}>
          We leverage cutting-edge technology to deliver robust,<br />
          <strong ref={bold2Ref} className={styles.pathTextBold2}>future-proof</strong> digital infrastructure.
        </p>
        <p className={styles.pathText}>
          Through continuous maintenance and advanced security<br />
          protocols, we ensure stable uptime and peak<br />
          performance for your <strong ref={bold3Ref} className={styles.pathTextBold3}>guaranteed business continuity.</strong>
        </p>
      </div>
      <svg 
        ref={svgRef}
        className={styles.svgPath}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <path
          ref={pathRef}
          className={styles.path}
        />
      </svg>
      <div className={styles.pathTitleContainer}>
        <h2 className={styles.pathTextTitle}>
          WACUS is a
          <strong ref={boldTitleRef} className={styles.pathTextBoldTitle}>digital growth</strong>
          agency.
        </h2>
        <p ref={subtitleRef} className={styles.pathTextSubtitle}>We bridge the gap between Korean innovation and U.S. market needs.</p>
      </div>
    </div>
  );
}
