'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { UserRound } from 'lucide-react';
import { OWNER_PORTAL_URL } from '@/data/external';
import { contact, site } from '@/data/homepage';
import { navCta, navigation } from '@/data/navigation';
import DesktopNav from './nav/DesktopNav';
import FullMenu from './nav/FullMenu';
import MenuToggle from './nav/MenuToggle';
import SavedLink from './nav/SavedLink';
import SmartLink from './ui/SmartLink';

const MENU_ID = 'full-menu';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleWrapRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock body scroll behind the overlay and restore focus to the toggle */
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      toggleWrapRef.current?.querySelector('button')?.focus();
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname]);

  /**
   * Only the homepage has a hero to sit over. `usePathname` resolves the same
   * on the server render and the client hydrate, so markup matches per route.
   */
  const solid = (!isHome || scrolled) && !menuOpen;

  const items = useMemo(
    () => navigation.filter((node) => !(node.hideOnHome && isHome)),
    [isHome],
  );

  const ctaHref = isHome ? navCta.homeHref : navCta.href;

  return (
    <>
      <header
        /* Sits above the overlay so its logo and X stay in place */
        className={`fixed inset-x-0 top-0 z-[70] transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-premium ${
          solid ? 'bg-ink/95 shadow-[0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        {/* Scrim: keeps the header legible over any frame of the hero video */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-[140px] bg-gradient-to-b from-black/45 to-transparent transition-opacity duration-500 ${
            solid || menuOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* One height on every page, over the hero or solid */}
        <div className="container-drp relative z-10 flex h-16 items-center justify-between gap-8 lg:h-[72px]">
          {/* ---------- Logo, upper left ---------- */}
          <SmartLink
            href="/"
            aria-label={`${site.name} — home`}
            onClick={() => setMenuOpen(false)}
            className={`relative block h-11 w-[83px] shrink-0 transition-[filter] duration-500 lg:h-14 lg:w-[105px] ${
              solid ? '' : 'logo-shadow-video'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.logos.white}
              alt={`${site.name} logo`}
              className="h-full w-full object-contain object-left"
            />
          </SmartLink>

          {/* ---------- Phone, centred in the space between the logo and the menu ---------- */}
          <div className="hidden min-w-0 flex-1 justify-center 2xl:flex">
            <a
              href={contact.phoneHref}
              className={`whitespace-nowrap text-[15px] font-light tracking-wide text-white transition-opacity duration-300 hover:text-orange ${
                menuOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
              } ${solid ? '' : 'text-shadow-video'}`}
            >
              {contact.phone}
            </a>
          </div>

          {/* ---------- Everything else, flush right ---------- */}
          {/* Gaps stay at 24px on wide screens too: with the saved-homes heart and the
              Home link, the row only just fits the 1320px container */}
          <div className="flex min-w-0 items-center justify-end gap-6">
            <div
              className={`transition-opacity duration-300 ${
                menuOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
            >
              <DesktopNav items={items} solid={solid} ctaHref={ctaHref} />
            </div>

            <SavedLink className={menuOpen ? 'pointer-events-none opacity-0' : solid ? '' : 'logo-shadow-video'} />

            {/* Owners who list with DRP sign in to the separate portal */}
            <a
              href={OWNER_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Owner sign in (opens the owner portal in a new tab)"
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/40 px-3 text-[13px] font-medium tracking-wide text-white transition-colors duration-300 hover:border-orange hover:bg-orange sm:px-4 ${
                menuOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
              } ${solid ? '' : 'logo-shadow-video'}`}
            >
              <UserRound aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Sign In</span>
            </a>

            {/* The toggle is the last item, at the far right */}
            <div ref={toggleWrapRef} className={solid || menuOpen ? '' : 'logo-shadow-video'}>
              <MenuToggle
                open={menuOpen}
                onToggle={() => setMenuOpen((o) => !o)}
                controls={MENU_ID}
              />
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <FullMenu
            id={MENU_ID}
            onClose={() => setMenuOpen(false)}
            toggleRef={toggleWrapRef}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
