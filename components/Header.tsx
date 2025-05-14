// components/Header.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

// Importuj swoje logo
import AltrSeedLogo from '../public/images/AltrSeedLogo.png';
import EthLogo from '../public/images/ETH.png';

// --- IKONY ---
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.themeIconSvg}>
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM5.106 17.834a.75.75 0 001.06 1.06l1.591-1.59a.75.75 0 00-1.06-1.061l-1.591 1.59zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm1.106-6.894a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 101.061-1.06l-1.59-1.591z"/>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.themeIconSvg}>
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.636 4.398-8.552a.75.75 0 01.818.162z" clipRule="evenodd" />
  </svg>
);

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.hamburgerIconSvg}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.hamburgerIconSvg}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- KOMPONENTY PODRZĘDNE ---
const TokenPriceIndicator = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [price, setPrice] = useState<string>('$1,823.45');
  return (
    <Link
      href="https://www.coingecko.com/pl/waluty/ethereum"
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.tokenPriceIndicatorLink} ${isMobile ? styles.mobileTokenPrice : ''}`}
    >
      <Image src={EthLogo} alt="ETH Symbol" width={isMobile ? 20 : 18} height={isMobile ? 20 : 18} className={styles.ethSymbol} />
      ETH: <span className={styles.tokenPriceValue}>{price}</span>
    </Link>
  );
};

const SearchBar = ({ isFocused, setFocused, isMobile = false }: { isFocused: boolean, setFocused: (isFocused: boolean) => void, isMobile?: boolean }) => {
  return (
    <div
      className={`${styles.searchBarContainer} ${isFocused ? styles.searchBarShadow : ''} ${isMobile ? styles.mobileSearchBarContainer : ''}`}
      onMouseEnter={!isMobile ? () => setFocused(true) : undefined} // Wyłączamy hover na mobile, jeśli efekt cienia ma być tylko na desktopie
      onMouseLeave={!isMobile ? () => setFocused(false) : undefined}
    >
      <input
        type="text"
        placeholder="Fund id or title."
        className={styles.searchInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button onClick={() => console.log('Search clicked')} className={styles.searchButton}>
        Search
      </button>
    </div>
  );
};

// --- GŁÓWNY KOMPONENT HEADER ---
const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);

  const originalLogoWidth = 120;
  const originalLogoHeight = 30;
  const reductionFactor = 0.60;
  const reducedLogoWidth = originalLogoWidth * reductionFactor;
  const reducedLogoHeight = originalLogoHeight * reductionFactor;

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Zapobiegaj scrollowaniu tła
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = ''; // Przywróć scrollowanie
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);


  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isMounted) {
    return (
      <header className={styles.headerPlaceholder} style={{ minHeight: '70px' }}>
        <div style={{ width: `${reducedLogoWidth}px`, height: `${reducedLogoHeight}px` }}></div>
      </header>
    );
  }

  return (
    <header className={styles.header} ref={headerRef}>
      <nav className={styles.nav}>
        <div className={styles.logoContainer}>
          <Link href="/" passHref>
            <div
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                transform: isLogoHovered ? 'scale(1.1)' : 'scale(1)',
              }}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              className={styles.logoWrapper}
            >
              <Image
                src={AltrSeedLogo}
                alt="AltrSeed Logo"
                width={reducedLogoWidth}
                height={reducedLogoHeight}
                priority
                className={styles.logoImage}
              />
            </div>
          </Link>
        </div>

        <div className={styles.navDesktop}>
          <div className={styles.navLeft}>
            <Link href="/startups" className={styles.navLink}>Startups</Link>
            <Link href="/charities" className={styles.navLink}>Charities</Link>
            <Link href="/whitepaper" className={styles.navLink}>WhitePaper</Link>
            <Link href="/contact" className={styles.navLink}>Contact</Link>
          </div>
          <div className={styles.navCenter}>
            <TokenPriceIndicator />
          </div>
          <div className={styles.navRight}>
            <SearchBar isFocused={isSearchFocused} setFocused={setIsSearchFocused} />
            {/* Przycisk zmiany motywu na desktopie */}
            <button
              onClick={toggleDarkMode}
              className={`${styles.iconThemeToggle} ${styles.desktopThemeToggle}`}
              aria-label={darkMode ? "Activate light mode" : "Activate dark mode"}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className={styles.connectWalletButtonWrapper}>
              <w3m-button />
            </div>
          </div>
        </div>

        {/* Elementy widoczne na mobile obok hamburgera (jeśli chcemy) */}
        <div className={styles.mobileHeaderControls}>
          {/* Przycisk zmiany motywu na mobile - obok hamburgera */}
          <button
            onClick={toggleDarkMode}
            className={`${styles.iconThemeToggle} ${styles.mobileInlineThemeToggle}`}
            aria-label={darkMode ? "Activate light mode" : "Activate dark mode"}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <div className={styles.hamburgerMenuButtonContainer}>
            <button
              onClick={toggleMobileMenu}
              className={styles.hamburgerButton}
              aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuContent}>
          <Link href="/startups" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Startups</Link>
          <Link href="/charities" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Charities</Link>
          <Link href="/whitepaper" className={styles.mobileNavLink} onClick={toggleMobileMenu}>WhitePaper</Link>
          <Link href="/contact" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Contact</Link>

          <div className={styles.mobileMenuItem}>
            <TokenPriceIndicator isMobile={true} />
          </div>
          <div className={styles.mobileMenuItem}>
            <SearchBar isFocused={isSearchFocused} setFocused={setIsSearchFocused} isMobile={true} />
          </div>
          {/* Przycisk zmiany motywu został przeniesiony na główny pasek mobilny */}
          {/* <hr className={styles.mobileMenuDivider} /> */}
          <div className={`${styles.mobileMenuItem} ${styles.connectWalletMobileWrapper}`}>
            <w3m-button />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;