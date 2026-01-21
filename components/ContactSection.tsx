'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ContactSection.module.css';

export default function ContactSection() {
  const [emailError, setEmailError] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const ballsRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const rafRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

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

  return (
    <section ref={sectionRef} className={styles.contactSection}>
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
