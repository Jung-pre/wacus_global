'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, forwardRef } from 'react';
import gsap from 'gsap';
import styles from './Navigation.module.css';

const gnbItems = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
];

const Navigation = forwardRef<HTMLElement>((props, ref) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'KO'>('EN');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(false);
  const combinedRef = (ref || navRef) as React.RefObject<HTMLElement>;

  useEffect(() => {
    let rafId: number | null = null;
    let lastScrollTime = 0;
    const throttleDelay = 16; // ~60fps

    const handleScroll = () => {
      const currentTime = Date.now();
      
      if (currentTime - lastScrollTime < throttleDelay) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          lastScrollTime = Date.now();
          updateNavigation();
        });
        return;
      }

      lastScrollTime = currentTime;
      updateNavigation();
    };

    const updateNavigation = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      const navElement = combinedRef.current;
      
      if (navElement) {
        const navHeight = navElement.offsetHeight;
        
        // 이전 애니메이션 취소하여 덜덜거림 방지
        gsap.killTweensOf(navElement);
        
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          if (!isScrollingDown.current) {
            isScrollingDown.current = true;
            gsap.to(navElement, {
              y: -navHeight,
              duration: 0.4,
              ease: 'power3.out',
            });
          }
        } else if (currentScrollY < lastScrollY.current) {
          if (isScrollingDown.current) {
            isScrollingDown.current = false;
            gsap.to(navElement, {
              y: 0,
              duration: 0.4,
              ease: 'power3.out',
            });
          }
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (combinedRef.current) {
        gsap.killTweensOf(combinedRef.current);
      }
    };
  }, []);

  return (
    <nav ref={combinedRef} className={styles.nav}>
      <div className={styles.container}>
        {/* 데스크톱: GNB 메뉴 - 가운데 위치 */}
        <div className={styles.desktopGnb}>
          {gnbItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.gnbLink} ${pathname === item.href ? styles.gnbLinkActive : ''} ${index === 1 ? styles.gnbLinkBeforeLogo : ''}`}
            >
              {item.label}
            </Link>
          ))}
          
          {/* 중앙 로고 */}
          <Link href="/" className={styles.logo}>
            <Image
              src="/logo.svg"
              alt="WACUS"
              fill
              className={styles.logoImage}
              priority
            />
          </Link>
        </div>

        {/* 모바일: 로고 중앙 */}
        <div className={styles.mobileLogo}>
          <Link href="/" className={styles.mobileLogoLink}>
            <Image
              src="/logo.svg"
              alt="WACUS"
              fill
              className={styles.logoImage}
              priority
            />
          </Link>
        </div>

        {/* 데스크톱: 유틸메뉴 - 오른쪽 고정 */}
        <div className={styles.desktopUtil}>
          {/* 언어 선택기 */}
          <div className={styles.languageSelector}>
            <button
              onClick={() => setLanguage('EN')}
              className={`${styles.languageButton} ${styles.languageButtonEN} ${language === 'EN' ? styles.languageButtonActive : ''}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('KO')}
              className={`${styles.languageButton} ${styles.languageButtonKO} ${language === 'KO' ? styles.languageButtonActive : ''}`}
            >
              KO
            </button>
            <div className={styles.languageDivider} />
          </div>

          {/* CONTACT 버튼 */}
          <Link href="/contact" className={styles.contactButton}>
            <span className={styles.contactButtonText}>CONTACT</span>
            <Image
              src="/main/icon_arrow-detail.svg"
              alt=""
              width={20}
              height={20}
              className={styles.contactButtonIcon}
            />
          </Link>
        </div>

        {/* 모바일: 햄버거 메뉴 버튼 */}
        <div className={styles.mobileMenuButton}>
          {/* 언어 선택기 (모바일) */}
          <div className={styles.mobileLanguageSelector}>
            <button
              onClick={() => setLanguage('EN')}
              className={`${styles.mobileLanguageButton} ${language === 'EN' ? styles.mobileLanguageButtonActive : ''}`}
            >
              EN
            </button>
            <span className={styles.mobileLanguageDivider}>|</span>
            <button
              onClick={() => setLanguage('KO')}
              className={`${styles.mobileLanguageButton} ${language === 'KO' ? styles.mobileLanguageButtonActive : ''}`}
            >
              KO
            </button>
          </div>

          {/* 햄버거 메뉴 버튼 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={styles.hamburgerButton}
            aria-label="메뉴"
          >
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineOpen1 : ''}`} />
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineOpen2 : ''}`} />
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineOpen3 : ''}`} />
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuContent}>
              {gnbItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${styles.mobileMenuLink} ${pathname === item.href ? styles.mobileMenuLinkActive : ''}`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={styles.mobileContactButton}
              >
                CONTACT
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
