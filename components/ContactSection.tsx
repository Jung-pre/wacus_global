'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ContactSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactSection() {
  const [emailError, setEmailError] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const contactMaskPathRef = useRef<SVGPathElement>(null);
  const ballsRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const rafRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const gsapVh = useMemo(() => (typeof window !== 'undefined' ? window.innerHeight / 100 : 0), []);

  const ballLetters = useMemo(() => ['W', 'A', 'C', 'U', 'S'], []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const emailInput = form.querySelector('#contact-email') as HTMLInputElement | null;
    const emailValue = emailInput?.value.trim() ?? '';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValue || !emailPattern.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
  };

  const handleEmailChange = () => {
    if (emailError) {
      setEmailError('');
    }
  };


  useEffect(() => {
    const container = ballsRef.current;
    const section = sectionRef.current;
    if (!container || !section) return;

    const ballCount = 30;
    const balls: {
      el: HTMLDivElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      radius: number;
      rotation: number;
      spawnAt: number;
      spawnStart: number;
      spawned: boolean;
    }[] = [];

    const letterColors: Record<string, string> = {
      W: '#789E4A',
      A: '#6C50F8',
      C: '#AF4197',
      U: '#AA50F8',
      S: '#D38383',
    };

    const initBalls = (fromTop = false) => {
      container.innerHTML = '';
      balls.length = 0;
      const rect = container.getBoundingClientRect();
      const now = performance.now();
      const spawnGap = 70;
      for (let i = 0; i < ballCount; i += 1) {
        const el = document.createElement('div');
        el.className = styles.contactBall;
        const size = 85;
        const letter = ballLetters[i % ballLetters.length];
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.background = letterColors[letter];
        el.textContent = letter;
        container.appendChild(el);
        const startX = Math.random() * rect.width;
        const startY = fromTop ? -rect.height * (0.2 + Math.random() * 0.6) : Math.random() * rect.height;
        balls.push({
          el,
          x: startX,
          y: startY,
          vx: (Math.random() - 0.5) * 0.4,
          vy: 0.4 + Math.random() * 0.6,
          size,
          radius: size / 2,
          rotation: Math.random() * 360,
          spawnAt: now + i * spawnGap,
          spawnStart: 0,
          spawned: false,
        });
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const animate = () => {
      const rect = container.getBoundingClientRect();
      const { x: mx, y: my, active } = mouseRef.current;

      const gravity = 0.1;
      const bounce = 0.8;
      const minBounce = 0;
      const mouseRadius = 70;
      const now = performance.now();
      balls.forEach((ball) => {
        if (now < ball.spawnAt) return;
        if (!ball.spawned) {
          ball.spawned = true;
          ball.spawnStart = now;
        }
        if (active) {
          const dx = ball.x - mx;
          const dy = ball.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = ball.radius + mouseRadius;
          if (dist > 0 && dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            const kick = Math.max(6, overlap * 0.25);
            ball.x += nx * overlap * 0.5;
            ball.y += ny * overlap * 0.5;
            ball.vx += nx * kick;
            ball.vy += ny * kick;
            if (ball.vy > 0) ball.vy = -ball.vy;
          }
        }

        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        ball.vx *= 0.985;
        ball.vy *= 0.992;

        if (ball.y + ball.radius >= rect.height) {
          ball.y = rect.height - ball.radius;
          const nextVy = Math.max(Math.abs(ball.vy) * bounce, minBounce);
          ball.vy = -nextVy;
          ball.vx += (Math.random() - 0.5) * 0.4;
        }

        if (ball.y - ball.radius <= 0) {
          ball.y = ball.radius;
          ball.vy = Math.abs(ball.vy) * bounce;
        }

        if (ball.x - ball.radius <= 0) {
          ball.x = ball.radius;
          ball.vx = Math.abs(ball.vx) * bounce;
        }

        if (ball.x + ball.radius >= rect.width) {
          ball.x = rect.width - ball.radius;
          ball.vx = -Math.abs(ball.vx) * bounce;
        }
      });

      for (let i = 0; i < balls.length; i += 1) {
        for (let j = i + 1; j < balls.length; j += 1) {
          const b1 = balls[i];
          const b2 = balls[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist > 0 && dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            const relVx = b2.vx - b1.vx;
            const relVy = b2.vy - b1.vy;
            const relVel = relVx * nx + relVy * ny;

            if (relVel < 0) {
              const restitution = 0.6;
              const impulse = (-(1 + restitution) * relVel) / 2;
              b1.vx -= impulse * nx;
              b1.vy -= impulse * ny;
              b2.vx += impulse * nx;
              b2.vy += impulse * ny;
            }
          }
        }
      }

      balls.forEach((ball) => {
        const spawnT = Math.min((now - ball.spawnStart) / 300, 1);
        const ease = spawnT * (2 - spawnT);
        const scale = 0.7 + 0.3 * ease;
        ball.el.style.opacity = `${ease}`;
        ball.el.style.transform = `translate3d(${ball.x}px, ${ball.y}px, 0) rotate(${ball.rotation}deg) scale(${scale})`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    if (!initializedRef.current) {
      initBalls(true);
      initializedRef.current = true;
    }
    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseleave', onMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      if (!initializedRef.current) return;
      initBalls(true);
    };
    window.addEventListener('resize', onResize);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !initializedRef.current) {
            initBalls(true);
            initializedRef.current = true;
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(section);

    return () => {
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [ballLetters]);

  // ContactSection path 확대 애니메이션 (SlotSection finalSVG 색 채우기 완료 후)
  useEffect(() => {
    if (typeof window === 'undefined' || !gsapVh || !contactMaskPathRef.current || !sectionRef.current) return;

    // SlotSection의 sectionRef 찾기
    const slotSection = document.querySelector('[class*="slotSection"]') as HTMLElement;
    if (!slotSection) return;

    // SlotSection의 finalSVG 색 채우기 완료 시점 계산
    // pathDrawStart = 220, pathDrawDuration = 100, pathFillDuration = 80
    // 색 채우기 완료 = 220 + 100 + 80 = 400vh
    const pathFillStart = 220 + 100; // 320vh
    const pathFillDuration = 80; // 80vh
    const pathScaleStart = pathFillStart + pathFillDuration; // 400vh (색 채우기 완료 후)

    const pathElement = contactMaskPathRef.current;
    const sectionElement = sectionRef.current;
    const maskSVG = pathElement.closest('svg') as SVGSVGElement;

    // 초기 matrix 계산: scale에 비례하여 translate 값 계산
    // scale 0.48일 때: matrix(0.48, 0, 0, 0.48, 228, 87)
    // scale 1일 때: matrix(1, 0, 0, 1, 468, 187)
    // translate 값은 scale에 비례: e = 228 * (scale / 0.48), f = 87 * (scale / 0.48)
    const calculateInitialMatrix = () => {
      const initialScale = 0.48;
      // scale 0.48일 때의 translate 값
      const baseE = 228;
      const baseF = 87;
      
      return {
        a: initialScale,
        b: 0,
        c: 0,
        d: initialScale,
        e: baseE,
        f: baseF,
      };
    };
    
    // scale에 따른 translate 값 계산 함수
    // scale 0.48: e=228, f=87
    // scale 1: e=468, f=187
    // scale 1 이상에서는 scale에 비례하여 증가
    const calculateTranslateForScale = (scale: number) => {
      if (scale <= 0.48) {
        return { e: 228, f: 87 };
      }
      
      if (scale <= 1) {
        // scale 0.48에서 1 사이의 보간
        const scaleRatio = (scale - 0.48) / (1 - 0.48);
        const e = 228 + (468 - 228) * scaleRatio;
        const f = 87 + (187 - 87) * scaleRatio;
        return { e, f };
      }
      
      // scale 1 이상: e는 1:1로 증가, f는 1:4로 증가
      // scale 1: e=468, f=187
      const scaleRatio = scale / 1; // scale 1 기준 비율
      const e = 468 * scaleRatio; // 1:1 비율
      // f는 1:4 비율로 증가: f = 187 * (1 + (scaleRatio - 1) * 4)
      const f = 187 * (1 + (scaleRatio - 1) * 2);
      
      return { e, f };
    };

    // 초기값: matrix(0.48, 0, 0, 0.48, 228, 87)
    const initialMatrix = calculateInitialMatrix();
    
    // 목표값: scale 12일 때 translate 계산
    const targetScale = 12;
    const targetTranslate = calculateTranslateForScale(targetScale);
    const targetMatrix = { 
      a: targetScale, 
      b: 0, 
      c: 0, 
      d: targetScale, 
      e: targetTranslate.e, 
      f: targetTranslate.f 
    };

    // 초기 matrix 설정
    pathElement.style.transform = `matrix(${initialMatrix.a},0,0,${initialMatrix.d},${initialMatrix.e},${initialMatrix.f})`;

    // matrix 확대 애니메이션
    const scaleAnimation = ScrollTrigger.create({
      id: 'contactPathScale',
      trigger: slotSection,
      start: `top+=${pathScaleStart * gsapVh}px top`,
      end: `+=${100 * gsapVh}px`, // 100vh 동안 확대
      scrub: true,
      onStart: () => {
        // 확대 시작 시 SlotSection의 finalSVG 숨기기
        const finalSVG = slotSection.querySelector('[class*="finalSVG"]') as HTMLElement;
        if (finalSVG) {
          finalSVG.style.opacity = '0';
          finalSVG.style.visibility = 'hidden';
        }
      },
      onUpdate: (self) => {
        const progress = self.progress;
        
        // 확대 중에는 finalSVG 숨김 유지, 초기화 시 다시 보이기
        const finalSVG = slotSection.querySelector('[class*="finalSVG"]') as HTMLElement;
        if (finalSVG) {
          if (progress > 0) {
            // 확대 중
            finalSVG.style.opacity = '0';
            finalSVG.style.visibility = 'hidden';
          } else {
            // 초기화 (progress === 0)
            finalSVG.style.opacity = '';
            finalSVG.style.visibility = '';
          }
        }
        
        const currentScale = initialMatrix.a + (targetMatrix.a - initialMatrix.a) * progress;
        
        // scale에 따른 translate 값 계산 (중앙 유지)
        const currentTranslate = calculateTranslateForScale(currentScale);
        
        pathElement.style.transform = `matrix(${currentScale},0,0,${currentScale},${currentTranslate.e},${currentTranslate.f})`;
        
        // progress가 0으로 돌아갔을 때 (초기화) onBrowser 제거
        if (progress === 0 && sectionElement.classList.contains(styles.onBrowser)) {
          sectionElement.classList.remove(styles.onBrowser);
          sectionElement.style.left = '-200vw';
        }
      },
    });

    // 리사이즈 시 초기 matrix 재설정 (translate 값은 scale에 비례하므로 동일)
    const handleResize = () => {
      // 애니메이션이 진행 중이 아닐 때만 초기값 적용
      if (scaleAnimation.progress === 0) {
        pathElement.style.transform = `matrix(${initialMatrix.a},0,0,${initialMatrix.d},${initialMatrix.e},${initialMatrix.f})`;
      }
    };

    window.addEventListener('resize', handleResize);

    // contactSection에 onBrowser 클래스 추가 및 left: 0 설정
    ScrollTrigger.create({
      id: 'contactSectionMove',
      trigger: slotSection,
      start: `top+=${pathScaleStart * gsapVh}px top`,
      onEnter: () => {
        sectionElement.classList.add(styles.onBrowser);
        sectionElement.style.left = '0';
      },
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      scaleAnimation?.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.id === 'contactSectionMove') {
          trigger.kill();
        }
      });
    };
  }, [gsapVh, styles]);

  return (
    <section ref={sectionRef} className={styles.contactSection}>
      {/* SVG mask 정의 - SlotSection과 동일한 path 사용 */}
      <svg className={styles.contactMaskSVG} width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <mask id="contactMask">
            <rect width="100%" height="100%" fill="black" />
            <path 
              ref={contactMaskPathRef}
              className={styles.contactMaskPath}
              d="M960 0L764.005 586H585.02L479.064 250.942L374.044 586H195.995L0 0H188.036L292.12 377.038L394.018 0H575.969L678.96 379.066L783.043 0H960Z"
              fill="white"
            />
          </mask>
        </defs>
      </svg>
      <div className={styles.contactInner}>
        <div>
          <h2 className={styles.contactTitle}>Work with us.</h2>
          <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
            <div className={styles.contactField}>
              <label className={styles.contactLabel} htmlFor="contact-email">
                <span className={styles.contactLabelRow}>
                  <Image
                    src="/main/icon_mail.svg"
                    alt=""
                    width={16}
                    height={16}
                    className={styles.contactIcon}
                  />
                  Email Address
                </span>
              </label>
              <div className={styles.contactInputWrapper}>
                <input
                  id="contact-email"
                  className={styles.contactInput}
                  type="email"
                  placeholder="example@yourdomain.com"
                  onChange={handleEmailChange}
                  aria-invalid={emailError ? 'true' : 'false'}
                  aria-describedby={emailError ? 'contact-email-error' : undefined}
                />
                {emailError ? (
                  <div id="contact-email-error" className={styles.contactError}>
                    <button
                      type="button"
                      className={styles.contactErrorIcon}
                      aria-label="Dismiss error"
                      onClick={() => setEmailError('')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.33" />
                        <path d="M6.11438 6.11426L9.88562 9.88549" stroke="white" strokeWidth="1.33" strokeLinecap="round" />
                        <path d="M9.88562 6.11426L6.11438 9.88549" stroke="white" strokeWidth="1.33" strokeLinecap="round" />
                      </svg>
                    </button>
                    {emailError}
                  </div>
                ) : null}
              </div>
            </div>
            <div className={styles.contactField}>
              <label className={`${styles.contactLabel} ${styles.contactLabelMuted}`} htmlFor="contact-company">
                <span className={styles.contactLabelRow}>
                  <Image
                    src="/main/icon_enterprise.svg"
                    alt=""
                    width={16}
                    height={16}
                    className={styles.contactIcon}
                  />
                  Company Name
                </span>
              </label>
              <div className={styles.contactInputWrapper}>
                <input
                  id="contact-company"
                  className={styles.contactInput}
                  type="text"
                  placeholder="Company Name"
                />
              </div>
            </div>
            <div className={styles.contactField}>
              <label className={`${styles.contactLabel} ${styles.contactLabelMuted}`} htmlFor="contact-phone">
                <span className={styles.contactLabelRow}>
                  <Image
                    src="/main/icon_call.svg"
                    alt=""
                    width={16}
                    height={16}
                    className={styles.contactIcon}
                  />
                  Contact Number
                </span>
              </label>
              <div className={styles.contactInputWrapper}>
                <input
                  id="contact-phone"
                  className={styles.contactInput}
                  type="tel"
                  placeholder="+1 (000) 000-0000"
                />
              </div>
            </div>
            <button type="submit" className={styles.contactButton}>
              SUBMIT
            </button>
          </form>
        </div>
        <div className={styles.contactInfo}>
          <div>
            <ul className={styles.contactList}>
              <li><a href="#" className={styles.contactLink}>Work</a></li>
              <li><a href="#" className={styles.contactLink}>About</a></li>
              <li><a href="#" className={styles.contactLink}>Services</a></li>
              <li><a href="#" className={styles.contactLink}>Portfolio</a></li>
              <li><a href="#" className={styles.contactLink}>Contact</a></li>
            </ul>
          </div>
          <div>
            <div className={styles.contactListTitle}>Social</div>
            <ul className={styles.contactIconList}>
              <li>
                <a href="#" className={styles.contactIconLink} aria-label="LinkedIn">
                  <Image
                    src="/main/icon_social01.svg"
                    alt=""
                    width={16}
                    height={16}
                    className={styles.contactIconItem}
                  />
                </a>
              </li>
              <li>
                <a href="#" className={styles.contactIconLink} aria-label="Instagram">
                  <Image
                    src="/main/icon_social02.svg"
                    alt=""
                    width={16}
                    height={16}
                    className={styles.contactIconItem}
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.contactFooter}>
        <span>Copyright © 2026 WACUS Global. All rights reserved.</span>
        <div className={styles.contactFooterLinks}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>
      <div ref={ballsRef} className={styles.contactBalls} aria-hidden="true" />
    </section>
  );
}
