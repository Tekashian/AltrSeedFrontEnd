// src/components/Header.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

// --- IKONY ---
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

// --- GŁÓWNY KOMPONENT HEADER ---
const Header = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const darkHoverBoxShadow = '0 0 12px rgba(100, 220, 150, 0.4)';

  // Ustawienie podstawowe
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obsługa scrollowania
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Obsługa kliknięcia poza menu mobilnym
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

  // Toggle dark/light
  const toggleMobileMenu = () => setIsMobileMenuOpen((m) => !m);

  if (!isMounted) {
    // Placeholder, aby uniknąć skoku layoutu przed inicjacją stanu
    return <header className={`${styles.header} ${styles.unscrolled}`} style={{ minHeight: '80px' }} />;
  }

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${scrolled ? styles.scrolled : styles.unscrolled}`}
    >
      <nav className={styles.nav}>
        {/* --- LEWA CZĘŚĆ (logo + linki) --- */}
        <div className={styles.navLeft}>
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
          <Link href="/my-account" className={styles.navLink}>
            My Account
          </Link>
          <Link href="/whitepaper" className={styles.navLink}>
            WhitePaper
          </Link>
          <Link href="/contact" className={styles.navLink}>
            Contact
          </Link>
        </div>

        {/* --- ŚRODEK (przycisk Create Campaign) --- */}
        <div className={styles.navCenter}>
          <button
            onClick={() => router.push('/create-campaign')}
            className={styles.createCampaignButton}
          >
            <span className={styles.buttonIcon}>🚀</span>
            Create Campaign
          </button>
        </div>

        {/* --- PRAWA CZĘŚĆ (Connect Wallet – w3m-button) --- */}
        <div className={styles.navRight}>
          <div className={styles.connectWalletButtonWrapper}>
            <w3m-button />
          </div>
        </div>

        {/* --- MOBILNE KONTROLKI: tylko hamburger --- */}
        <div className={styles.mobileHeaderControls}>
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

      {/* --- Pełne menu mobilne (po kliknięciu hamburger) --- */}
      {isMobileMenuOpen && (
        <div className={`${styles.mobileMenu} ${styles.mobileMenuOpen}`}>
          <div className={styles.mobileMenuContent}>
            <Link href="/my-account" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
              My Account
            </Link>
            <Link href="/whitepaper" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
              WhitePaper
            </Link>
            <Link href="/contact" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
              Contact
            </Link>
            <button
              onClick={() => {
                router.push('/create-campaign');
                toggleMobileMenu();
              }}
              className={styles.mobileNavLink}
            >
              🚀 Create Campaign
            </button>
            <div className={styles.mobileConnectWalletWrapper}>
              <w3m-button />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
