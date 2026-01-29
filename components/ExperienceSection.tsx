'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ExperienceSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface PortfolioItem {
  category: string;
  title: string;
  url?: string;
  videoSrc: string;
  imgSrc: string;
}

const COOKIE_NAME = 'wacus_portfolio_data';
const COOKIE_EXPIRY_DAYS = 7;

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const setCookie = (name: string, value: string, days: number) => {
  if (typeof window === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

export default function ExperienceSection() {
  const gsapVh = useMemo(() => (typeof window !== 'undefined' ? window.innerHeight / 100 : 0), []);
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const portfolioBgRef = useRef<HTMLDivElement>(null);
  const portfolioBgMoRef = useRef<HTMLDivElement>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setIsPageLoaded(true);
    };

    if (document.readyState === 'complete') {
      setIsPageLoaded(true);
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  useEffect(() => {
    if (!isPageLoaded) return;

    const loadPortfolioData = () => {
      const cookieData = getCookie(COOKIE_NAME);
      if (cookieData) {
        try {
          const data = JSON.parse(decodeURIComponent(cookieData));
          setPortfolioData(data);
        } catch (error) {
          console.error('Failed to parse cookie data:', error);
          fetchPortfolioData();
        }
      } else {
        fetchPortfolioData();
      }
    };

    const fetchPortfolioData = async () => {
      try {
        const response = await fetch('https://wacus.co.kr/api/getPortfolio.php', {
          method: 'POST',
          body: JSON.stringify({
            type: 'getPortfolio',
          }),
        });
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        setPortfolioData(data);
        setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(data)), COOKIE_EXPIRY_DAYS);
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
      }
    };

    loadPortfolioData();
  }, [isPageLoaded]);

  useEffect(() => {
    if (!sectionRef.current || !gsapVh || portfolioData.length === 0) return;

    const ctx = gsap.context(() => {
      const initScrollAnimations = () => {
        const lists = sectionRef.current?.querySelectorAll(`.${styles.verticalList}`);
        if (!lists) return;

        lists.forEach((list) => {
          const wrapper = list.querySelector(`.${styles.portfolioContentsWrapper}`) as HTMLElement;
          if (!wrapper) return;

          const originalContent = wrapper.innerHTML;
          wrapper.innerHTML = originalContent + originalContent + originalContent + originalContent + originalContent + originalContent + originalContent + originalContent;

          const speed = parseFloat(list.getAttribute('data-speed') || '1');
          const dir = list.getAttribute('data-dir') || 'down';
          const isReverse = list.getAttribute('data-reverse') === 'true';

          const baseTime = 120;
          const duration = baseTime / speed;
          const animationName = dir === 'up' ? 'marquee-up' : 'marquee-down';
          wrapper.style.animation = `${animationName} ${duration}s linear infinite`;

          if (isReverse) {
            const wrapperHeight = wrapper.scrollHeight;
            const singleSetHeight = wrapperHeight / 8;
            const initialOffset = -singleSetHeight * 4;
            gsap.set(wrapper, {
              y: initialOffset,
            });
          } else {
            gsap.set(wrapper, {
              y: 0,
            });
          }

          const scrollTrigger = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              const wrapperHeight = wrapper.scrollHeight;
              const singleSetHeight = wrapperHeight / 8;
              const moveDistance = singleSetHeight * 2;
              
              let baseOffset = 0;
              if (isReverse) {
                baseOffset = -singleSetHeight * 4;
              }
              
              const easedProgress = self.progress;
              const scrollOffset = baseOffset + (dir === 'up' ? -moveDistance : moveDistance) * easedProgress * speed * 0.5;
              gsap.set(wrapper, { y: scrollOffset });
            },
          });
        });
      };

      initScrollAnimations();

      if (portfolioBgRef.current) {
        gsap.set(portfolioBgRef.current, {
          opacity: 0,
        });

        gsap.to(portfolioBgRef.current, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }

      if (portfolioBgMoRef.current) {
        gsap.set(portfolioBgMoRef.current, {
          opacity: 0,
        });

        gsap.to(portfolioBgMoRef.current, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [gsapVh, portfolioData]);

  return (
    <section ref={sectionRef} className={styles.experienceSection}>
      <div ref={portfolioBgRef} className={`${styles.portfolioBg} ${styles.pc}`}>
        {[0, 1, 2].map((columnIndex) => (
          <div
            key={columnIndex}
            className={columnIndex === 2 ? `${styles.verticalList} ${styles.column3}` : styles.verticalList}
            data-dir={columnIndex === 1 ? 'up' : 'down'}
            data-speed={columnIndex === 1 ? '0.8' : '1'}
            data-reverse={columnIndex !== 1 ? 'true' : 'false'}
          >
            <div className={styles.portfolioContentsWrapper}>
              {portfolioData
                .filter((_, index) => index % 3 === columnIndex)
                .map((item, idx) => (
                  <div
                    key={idx}
                    className={styles.portfolioContents}
                    data-categories={item.category}
                    data-subject={item.title}
                  >
                    <a
                      href={item.url || '#'}
                      target={item.url ? '_blank' : undefined}
                      rel={item.url ? 'noopener noreferrer' : undefined}
                    >
                      <video
                        src={item.videoSrc}
                        poster={item.imgSrc}
                        muted
                        playsInline
                        loop
                        autoPlay
                        onMouseEnter={(e) => {
                          const video = e.currentTarget as HTMLVideoElement;
                          video.play();
                        }}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget as HTMLVideoElement;
                          video.pause();
                        }}
                      />
                    </a>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div ref={portfolioBgMoRef} className={`${styles.portfolioBg} ${styles.mo}`}>
        {[0, 1].map((columnIndex) => (
          <div
            key={columnIndex}
            className={columnIndex === 2 ? `${styles.verticalList} ${styles.column3}` : styles.verticalList}
            data-dir={columnIndex === 1 ? 'up' : 'down'}
            data-speed={columnIndex === 1 ? '0.8' : '1'}
            data-reverse={columnIndex !== 1 ? 'true' : 'false'}
          >
            <div className={styles.portfolioContentsWrapper}>
              {portfolioData
                .filter((_, index) => index % 2 === columnIndex)
                .map((item, idx) => (
                  <div
                    key={idx}
                    className={styles.portfolioContents}
                    data-categories={item.category}
                    data-subject={item.title}
                  >
                    <a
                      href={item.url || '#'}
                      target={item.url ? '_blank' : undefined}
                      rel={item.url ? 'noopener noreferrer' : undefined}
                    >
                      <video
                        src={item.videoSrc}
                        poster={item.imgSrc}
                        muted
                        playsInline
                        loop
                        autoPlay
                        onMouseEnter={(e) => {
                          const video = e.currentTarget as HTMLVideoElement;
                          video.play();
                        }}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget as HTMLVideoElement;
                          video.pause();
                        }}
                      />
                    </a>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.experienceContent}>
        <h2 className={styles.experienceTitle}>Our Experience</h2>
        <Link href="/portfolio" className={styles.viewMoreButton}>View More</Link>
      </div>
    </section>
  );
}
