import React from 'react';
import Link from 'next/link'; // Zakładam, że używasz Next.js i masz dostęp do Link

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1E1B2E] text-slate-400 py-8 px-4 mt-12 shadow-inner shadow-teal-500/10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center md:items-start text-sm">
        {/* Sekcja logo / nazwa projektu */}
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
          <Link href="/" className="text-2xl font-bold text-white hover:text-teal-400 transition-colors duration-300">
            AltərSeed
          </Link>
          <p className="mt-2 text-slate-500 text-center md:text-left max-w-xs">
            Platforma crowdfundingowa nowej generacji, zasilana przez technologię blockchain.
          </p>
        </div>

        {/* Sekcje linków */}
        <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 md:gap-x-16 md:gap-y-0">
          {/* Szybkie Linki */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-white mb-3">Szybkie Linki</h4>
            <ul className="space-y-2">
              <li><Link href="/startups" className="hover:text-teal-400 transition-colors duration-200">Startupy</Link></li>
              <li><Link href="/charities" className="hover:text-teal-400 transition-colors duration-200">Charytatywne</Link></li>
              <li><Link href="/my-fundraisers" className="hover:text-teal-400 transition-colors duration-200">Moje Zbiórki</Link></li>
              <li><Link href="/my-donations" className="hover:text-teal-400 transition-colors duration-200">Moje Dotacje</Link></li>
            </ul>
          </div>

          {/* Zasoby */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-white mb-3">Zasoby</h4>
            <ul className="space-y-2">
              <li><Link href="/whitepaper" className="hover:text-teal-400 transition-colors duration-200">WhitePaper</Link></li>
              <li><Link href="/faq" className="hover:text-teal-400 transition-colors duration-200">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-teal-400 transition-colors duration-200">Regulamin</Link></li>
              <li><Link href="/privacy" className="hover:text-teal-400 transition-colors duration-200">Polityka Prywatności</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-white mb-3">Kontakt</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors duration-200">Skontaktuj się</Link></li>
              <li>
                <a href="mailto:info@alterseed.com" className="hover:text-teal-400 transition-colors duration-200">
                  info@alterseed.com
                </a>
              </li>
              {/* Tutaj możesz dodać ikony social media, jeśli masz */}
              <li className="flex justify-center md:justify-start space-x-3 mt-2">
                {/* Przykład ikony (wymaga biblioteki ikon, np. Heroicons, Font Awesome, lub własne SVG) */}
                {/* <a href="#" className="hover:text-teal-400"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.417 2.865 8.167 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.867-.013-1.702-2.782.603-3.371-1.34-3.371-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.068-.608.068-.608 1.004.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.089 2.91.835.091-.65.356-1.09.648-1.334-2.22-.253-4.555-1.119-4.555-4.964 0-1.099.39-1.996 1.029-2.701-.103-.254-.447-1.274.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.7.111 2.5.324 1.909-1.296 2.747-1.025 2.747-1.025.546 1.376.202 2.396.099 2.65.64.704 1.028 1.601 1.028 2.701 0 3.853-2.339 4.707-4.568 4.957.36.309.678.92.678 1.855 0 1.334-.012 2.41-.012 2.727 0 .267.18.579.688.482C19.137 20.185 22 16.435 22 12.017A10.017 10.017 0 0012 2z"></path></svg></a> */}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prawa autorskie */}
      <div className="border-t border-slate-700/50 mt-8 pt-6 text-center text-xs text-slate-500">
        &copy; {currentYear} AltərSeed. Wszystkie prawa zastrzeżone.
      </div>
    </footer>
  );
};

export default Footer;