'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Navigation.module.css';

const gnbItems = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'KO'>('EN');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={styles.nav}>
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
            CONTACT
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
}
