'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, forwardRef } from 'react';
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
  const [isResizing, setIsResizing] = useState(false);
  const [scrollClass, setScrollClass] = useState<'downScroll' | 'upScroll' | ''>('');
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const savedScrollPosition = useRef(0);
  const combinedRef = (ref || navRef) as React.RefObject<HTMLElement>;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      const navElement = combinedRef.current;
      
      if (navElement) {
        const navHeight = navElement.getBoundingClientRect().height;
        const hideDistance = navHeight + 20;
        navElement.style.setProperty('--nav-height', `${navHeight}px`);
        navElement.style.setProperty('--hide-distance', `-${hideDistance}px`);
        
        if (currentScrollY <= 0) {
          setScrollClass('');
          lastScrollY.current = currentScrollY;
          return;
        }
        
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setScrollClass('downScroll');
        } 
        else if (currentScrollY < lastScrollY.current) {
          setScrollClass('upScroll');
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      setIsResizing(true);
      
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('width');
        savedScrollPosition.current = 0;
      }
      
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsResizing(false);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    
    if (isMobile && isMobileMenuOpen) {
      savedScrollPosition.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollPosition.current}px`;
      document.body.style.width = '100%';
    } else {
      const scrollPosition = savedScrollPosition.current;
      
      if (scrollPosition > 0) {
        savedScrollPosition.current = 0;
        
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('width');
        
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollPosition,
            behavior: 'auto'
          });
        });
      } else {
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('width');
      }
    }
    
    return () => {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('width');
    };
  }, [isMobileMenuOpen]);

  return (
    <nav ref={combinedRef} className={`${styles.nav} ${scrollClass ? styles[scrollClass] : ''}`}>
      <div className={styles.container}>
        <div className={styles.gnbAreaWrapper}>
        <h1 className={styles.logoTitle}>
            <Link href="/" className={styles.logo}>
              <Image
                src="/logo.svg"
                alt="WACUS"
                fill
                className={styles.logoImage}
                priority
              />
            </Link>
          </h1>
          <div className={`${styles.mobilegnbArea} ${isMobileMenuOpen ? styles.mobilegnbAreaOpen : ''} ${isResizing ? styles.mobilegnbAreaResizing : ''}`}>
            <div className={styles.desktopGnb}>
              {gnbItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${styles.gnbLink} ${pathname === item.href ? styles.gnbLinkActive : ''} ${index === 1 ? styles.gnbLinkBeforeLogo : ''}`}
                >
                  {item.label}
                </Link>
              ))}            
            </div>          
            <div className={styles.mobileMenu}>
              <p className={styles.mobileMenuTitle}>Work with us.</p>
              <ul className={styles.mobileMenuList}>
                <li><a className={styles.mobileMenuPhone} href="tel:+82-70-4288-0067">+82 10 4042 0310</a></li>
                <li><a className={styles.mobileMenuEmail} href="mailto:wacus2020@naver.com">wacus2020@naver.com</a></li>
              </ul>
              <ul className={styles.mobileMenuSocial}>
                <li>
                  <a href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path  d="M20.979 1.5H3.083C2.227 1.5 1.5 2.177 1.5 3.011V20.988C1.5 21.823 1.977 22.5 2.833 22.5H20.729C21.586 22.5 22.5 21.823 22.5 20.988V3.011C22.5 2.177 21.836 1.5 20.979 1.5ZM9.49999 9.49999H12.327V10.941H12.358C12.789 10.164 14.062 9.37499 15.636 9.37499C18.657 9.37499 19.5 10.979 19.5 13.95V19.5H16.5V14.497C16.5 13.167 15.969 12 14.727 12C13.219 12 12.5 13.021 12.5 14.697V19.5H9.49999V9.49999ZM4.5 19.5H7.5V9.49999H4.5V19.5ZM7.875 6C7.88083 6.2498 7.83668 6.49825 7.74513 6.73075C7.65358 6.96325 7.51649 7.1751 7.3419 7.35386C7.16731 7.53262 6.95876 7.67469 6.72849 7.7717C6.49822 7.86871 6.25088 7.91872 6.00101 7.91879C5.75114 7.91886 5.50377 7.86898 5.27345 7.77209C5.04313 7.6752 4.83449 7.53325 4.65981 7.35458C4.48513 7.17591 4.34793 6.96413 4.25625 6.73168C4.16458 6.49923 4.12029 6.2508 4.126 6.001C4.13718 5.51134 4.33951 5.0455 4.68973 4.7031C5.03994 4.3607 5.51022 4.16892 6 4.16879C6.48979 4.16866 6.96019 4.36019 7.31058 4.7024C7.66098 5.04461 7.86356 5.51035 7.875 6Z" fill="white"/>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                    <path d="M14.9864 0H6.10909C2.67273 0 0 2.67273 0 6.01363V14.8909C0 18.3273 2.67273 21 6.10909 21H14.9864C18.3273 21 21 18.3273 21 14.8909V6.01363C21 2.67273 18.3273 0 14.9864 0ZM10.5 16.0364C7.44545 16.0364 5.05909 13.5545 5.05909 10.5954C5.05909 7.63636 7.44545 5.05909 10.5 5.05909C13.5545 5.05909 15.9409 7.54091 15.9409 10.5C15.9409 13.4591 13.5545 16.0364 10.5 16.0364ZM16.1318 6.20454C15.4636 6.20454 14.8909 5.63181 14.8909 4.96363C14.8909 4.29545 15.4636 3.72273 16.1318 3.72273C16.8 3.72273 17.3727 4.29545 17.3727 4.96363C17.3727 5.63181 16.8 6.20454 16.1318 6.20454Z" fill="white"/>
                    </svg>
                  </a>
                </li>
              </ul>
              <a className={styles.mobileMenuMaps} href="https://www.google.com/maps/place/4th+floor,+467+Songpa-daero,+Songpa+District,+Seoul/data=!3m2!1e3!4b1!4m5!3m4!1s0x357ca5a1dff1836b:0x7005db71ad5edfa!8m2!3d37.5077537!4d127.1043985?hl=en&entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoASAFQAw%3D%3D" target="_blank" >4th floor, 467 Songpa-daero, Songpa-gu, Seoul</a>
            </div>
          </div>
        </div>

        <div className={styles.desktopUtil}>
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
