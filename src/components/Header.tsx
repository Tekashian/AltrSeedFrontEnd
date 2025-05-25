// src/components/Header.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

// --- IKONY ---
const SunIcon = () => (
  <svg
    className={styles.themeIconSvg}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    className={styles.themeIconSvg}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 2.138 0 4.123-.693 5.752-1.848Z"
    />
  </svg>
);

const HamburgerIcon = () => (
  <svg
    className={styles.hamburgerIconSvg}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = () => (
  <svg
    className={styles.hamburgerIconSvg}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const TranslatorIcon = () => (
  <svg
    className={styles.themeIconSvg}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 21l5.25-11.25L21 21m-9.75-4.5H21m-12-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// --- KOMPONENT PODRZĘDNY ---
const SearchBar = ({
  isFocused,
  setFocused,
  isMobile = false,
}: {
  isFocused: boolean;
  setFocused: (b: boolean) => void;
  isMobile?: boolean;
}) => (
  <div
    className={`
      ${styles.searchBarContainer}
      ${isFocused ? styles.searchBarShadow : ''}
      ${isMobile ? styles.mobileSearchBarContainer : ''}
    `}
    onMouseEnter={!isMobile ? () => setFocused(true) : undefined}
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

// --- GŁÓWNY KOMPONENT HEADER ---
const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // cień przy hover na logo
  const darkHoverBoxShadow = '0 0 12px rgba(100, 220, 150, 0.4)';

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLanguageChange = () => console.log('Language change clicked');
  const toggleMobileMenu = () => setIsMobileMenuOpen((m) => !m);

  if (!isMounted) {
    return (
      <header
        className={styles.headerPlaceholder}
        style={{ minHeight: '49px', position: 'relative' }}
      />
    );
  }

  return (
    <header
      className={styles.header}
      ref={headerRef}
      style={{ position: 'relative' }}
    >
      <nav className={styles.nav}>
        <div className={styles.logoContainer}>
          <Link
            href="/"
            className={styles.logoWrapper}
            style={{
              transform: isLogoHovered ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isLogoHovered ? darkHoverBoxShadow : 'none',
              padding: '0.4rem 0.2rem',
              borderRadius: '6px',
            }}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            aria-label="AltrSeed Home"
          >
            <Image
              src="/images/LogoPisaneAltrSeed.png"
              alt="AltrSeed"
              width={140}
              height={30}
              className={styles.logoImage}
              priority
            />
          </Link>
        </div>

        <div className={styles.navDesktop}>
          <div className={styles.navLeft}>
            <Link href="/startups" className={styles.navLink}>Startups</Link>
            <Link href="/charities" className={styles.navLink}>Charities</Link>
            <Link href="/my-account" className={styles.navLink}>My Account</Link>
            <Link href="/whitepaper" className={styles.navLink}>WhitePaper</Link>
            <Link href="/contact" className={styles.navLink}>Contact</Link>
          </div>

          <div className={styles.navCenter} />

          <div className={styles.navRight}>
            <SearchBar isFocused={isSearchFocused} setFocused={setIsSearchFocused} />

            <button
              onClick={handleLanguageChange}
              className={`${styles.iconThemeToggle} ${styles.desktopThemeToggle}`}
              title="Change language"
            >
              <TranslatorIcon />
            </button>

            <button
              onClick={toggleDarkMode}
              className={`${styles.iconThemeToggle} ${styles.desktopThemeToggle}`}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            <div className={styles.connectWalletButtonWrapper}>
              <w3m-button />
            </div>
          </div>
        </div>

        {/* mobile */}
        <div className={styles.mobileHeaderControls}>
          <button
            onClick={handleLanguageChange}
            className={`${styles.iconThemeToggle} ${styles.mobileInlineThemeToggle}`}
            title="Change language"
          >
            <TranslatorIcon />
          </button>
          <button
            onClick={toggleDarkMode}
            className={`${styles.iconThemeToggle} ${styles.mobileInlineThemeToggle}`}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <div className={styles.hamburgerMenuButtonContainer}>
            <button
              onClick={toggleMobileMenu}
              className={styles.hamburgerButton}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className={`${styles.mobileMenu} ${styles.mobileMenuOpen}`}>
          <div className={styles.mobileMenuContent}>
            <Link href="/startups" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Startups</Link>
            <Link href="/charities" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Charities</Link>
            <Link href="/my-account" className={styles.mobileNavLink} onClick={toggleMobileMenu}>My Account</Link>
            <Link href="/whitepaper" className={styles.mobileNavLink} onClick={toggleMobileMenu}>WhitePaper</Link>
            <Link href="/contact" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Contact</Link>
            <div className={`${styles.mobileMenuItem} ${styles.mobileMenuItemSpecial}`}>
              <SearchBar isFocused={isSearchFocused} setFocused={setIsSearchFocused} isMobile />
            </div>
            <div className={styles.mobileMenuItem}>
              <button onClick={() => { handleLanguageChange(); toggleMobileMenu(); }} className={styles.mobileLangButton}>
                Change Language
              </button>
            </div>
            <div className={`${styles.mobileMenuItem} ${styles.connectWalletMobileWrapper}`}>
              <w3m-button />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
