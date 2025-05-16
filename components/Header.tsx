// app/components/Header.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

// --- IKONY ---
const SunIcon = () => (
  <svg className={styles.themeIconSvg} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591" />
  </svg>
);

const MoonIcon = () => (
  <svg className={styles.themeIconSvg} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 2.138 0 4.123-.693 5.752-1.848Z" />
  </svg>
);

const HamburgerIcon = () => (
  <svg className={styles.hamburgerIconSvg} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = () => (
  <svg className={styles.hamburgerIconSvg} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const TranslatorIcon = () => (
  <svg className={styles.themeIconSvg}
    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9.75-4.5H21m-12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// --- KOMPONENTY PODRZĘDNE ---
const SearchBar = ({ isFocused, setFocused, isMobile = false }: { isFocused: boolean, setFocused: (isFocused: boolean) => void, isMobile?: boolean }) => {
  return (
    <div
      className={`${styles.searchBarContainer} ${isFocused ? styles.searchBarShadow : ''} ${isMobile ? styles.mobileSearchBarContainer : ''}`}
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
};

// --- GŁÓWNY KOMPONENT HEADER ---
const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const writtenLogoHeight = 30;
  const writtenLogoWidth = 140; // Pamiętaj, aby dostosować tę wartość!

  const placeholderLogoWidth = writtenLogoWidth;
  const placeholderLogoHeight = writtenLogoHeight;

  // Definicja cienia dla spójności
  const hoverBoxShadow = '0 0 12px 0px rgba(99, 211, 145, 0.5)';
  const darkHoverBoxShadow = '0 0 12px 0px rgba(100, 220, 150, 0.4)'; // Cień dla trybu ciemnego z .navLink:hover

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

  const handleLanguageChange = () => {
    console.log('Language change clicked - implement translation logic here');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isMounted) {
    return (
      <header className={styles.headerPlaceholder} style={{ minHeight: '70px' }}>
        <div style={{ width: `${placeholderLogoWidth}px`, height: `${placeholderLogoHeight}px` }} />
      </header>
    );
  }

  return (
    <header className={styles.header} ref={headerRef}>
      <nav className={styles.nav}>
        <div className={styles.logoContainer}>
          <Link
            href="/"
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Dodano box-shadow do transition
              transform: isLogoHovered ? 'scale(1.05)' : 'scale(1)',
              // Dodajemy boxShadow warunkowo, uwzględniając tryb ciemny
              boxShadow: isLogoHovered ? (darkMode ? darkHoverBoxShadow : hoverBoxShadow) : 'none',
              padding: '0.4rem 0.2rem', // Dodajemy niewielki padding, aby cień miał gdzie "żyć" i nie był ucięty
              borderRadius: '6px', // Dopasowujemy do .navLink dla spójności cienia
            }}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            className={styles.logoWrapper} // .logoWrapper powinien mieć display:flex i align-items:center
            aria-label="AltrSeed Home"
          >
            <Image
              src="/images/LogoPisaneAltrSeed.png"
              alt="AltrSeed"
              width={writtenLogoWidth}
              height={writtenLogoHeight}
              className={styles.logoImage} // Tylko filtr
              priority
            />
          </Link>
        </div>

        <div className={styles.navDesktop}>
          <div className={styles.navLeft}>
            <Link href="/startups" className={styles.navLink}>Startups</Link>
            <Link href="/charities" className={styles.navLink}>Charities</Link>
            <Link href="/my-fundraisers" className={styles.navLink}>My Fundraisers</Link>
            <Link href="/my-donations" className={styles.navLink}>My Donations</Link>
            <Link href="/whitepaper" className={styles.navLink}>WhitePaper</Link>
            <Link href="/contact" className={styles.navLink}>Contact</Link>
          </div>
          <div className={styles.navCenter}>
            {/* Puste */}
          </div>
          <div className={styles.navRight}>
            <SearchBar isFocused={isSearchFocused} setFocused={setIsSearchFocused} />
            <button
              onClick={handleLanguageChange}
              className={`${styles.iconThemeToggle} ${styles.desktopThemeToggle}`}
              aria-label="Change language"
              title="Change language"
            >
              <TranslatorIcon />
            </button>
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

        <div className={styles.mobileHeaderControls}>
           <button
              onClick={handleLanguageChange}
              className={`${styles.iconThemeToggle} ${styles.mobileInlineThemeToggle}`}
              aria-label="Change language"
              title="Change language"
            >
              <TranslatorIcon />
            </button>
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
          <Link href="/my-fundraisers" className={styles.mobileNavLink} onClick={toggleMobileMenu}>My Fundraisers</Link>
          <Link href="/my-donations" className={styles.mobileNavLink} onClick={toggleMobileMenu}>My Donations</Link>
          <Link href="/whitepaper" className={styles.mobileNavLink} onClick={toggleMobileMenu}>WhitePaper</Link>
          <Link href="/contact" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Contact</Link>

          <div className={`${styles.mobileMenuItem} ${styles.mobileMenuItemSpecial}`}>
            <SearchBar isFocused={isSearchFocused} setFocused={setIsSearchFocused} isMobile={true} />
          </div>
          
          <div className={styles.mobileMenuItem}>
            <button
                onClick={() => { handleLanguageChange(); toggleMobileMenu(); }}
                className={styles.mobileLangButton}
                title="Change language"
            >
                Change Language
            </button>
          </div>

          <div className={`${styles.mobileMenuItem} ${styles.connectWalletMobileWrapper}`}>
            <w3m-button />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;