'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { NavNode } from '@/data/navigation';
import SmartLink from '../ui/SmartLink';
import MegaPanel from './MegaPanel';

const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;

type Props = { items: NavNode[]; solid: boolean; ctaHref: string };

export default function DesktopNav({ items, solid, ctaHref }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();
  const triggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  /* The panel spans from the first item (Buy & Rent) to the hamburger at the far right */
  const [panelLeft, setPanelLeft] = useState(0);
  const [panelWidth, setPanelWidth] = useState<number | undefined>(undefined);
  const navRef = useRef<HTMLElement>(null);

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };
  useEffect(() => clearTimers, []);

  const scheduleOpen = (id: string) => {
    clearTimers();
    openTimer.current = window.setTimeout(() => setOpenId(id), OPEN_DELAY);
  };
  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpenId(null), CLOSE_DELAY);
  };
  const closeNow = useCallback(() => {
    clearTimers();
    setOpenId(null);
  }, []);

  /** Links inside the open panel, in DOM order. */
  const panelLinks = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>('[data-mega-link]') ?? []);

  const focusPanelLink = (index: number) => {
    const links = panelLinks();
    if (!links.length) return;
    const next = (index + links.length) % links.length;
    links[next]?.focus();
  };

  /* Escape closes and hands focus back to the trigger */
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const trigger = triggerRefs.current[openId];
      closeNow();
      trigger?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openId, closeNow]);

  /* Move focus across the top row with the arrow keys */
  const onRowKeyDown = (e: React.KeyboardEvent, index: number, node: NavNode) => {
    const focusTrigger = (i: number) => {
      const next = (i + items.length) % items.length;
      triggerRefs.current[items[next].id]?.focus();
    };

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusTrigger(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusTrigger(index - 1);
    } else if (e.key === 'ArrowDown' && node.columns) {
      e.preventDefault();
      clearTimers();
      setOpenId(node.id);
      /* Wait for the panel to mount before moving focus into it */
      window.setTimeout(() => focusPanelLink(0), reduce ? 0 : 60);
    }
  };

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const links = panelLinks();
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    focusPanelLink(current + (e.key === 'ArrowDown' ? 1 : -1));
  };

  /* Left edge on the first menu item; right edge on the header row's content
     edge, where the hamburger sits. */
  useLayoutEffect(() => {
    if (!openId) return;
    const nav = navRef.current;
    const box = panelRef.current?.offsetParent as HTMLElement | null;
    if (!nav || !box) return;
    const left = Math.max(0, nav.getBoundingClientRect().left - box.getBoundingClientRect().left);
    const padRight = parseFloat(getComputedStyle(box).paddingRight) || 0;
    setPanelLeft(left);
    setPanelWidth(Math.max(0, box.clientWidth - padRight - left));
  }, [openId]);

  const activeNode = items.find((n) => n.id === openId) ?? null;

  const linkBase =
    'relative whitespace-nowrap text-[16px] font-medium tracking-[0.01em] transition-colors duration-300';
  /* The header is transparent over the hero and dark once scrolled, so links
     are white in both states — only the video shadow is conditional. */
  const linkTone = `text-white hover:text-orange-400 ${solid ? '' : 'text-shadow-video'}`;

  return (
    <div
      className="hidden xl:block"
      onMouseLeave={scheduleClose}
      onMouseEnter={() => window.clearTimeout(closeTimer.current)}
    >
      <nav ref={navRef} aria-label="Primary">
        <ul className="flex items-center gap-9">
          {items.map((node, index) => {
            const open = openId === node.id;

            if (!node.columns) {
              return (
                <li key={node.id}>
                  <SmartLink
                    href={node.href as string}
                    ref={(el) => {
                      triggerRefs.current[node.id] = el;
                    }}
                    onKeyDown={(e: React.KeyboardEvent) => onRowKeyDown(e, index, node)}
                    onMouseEnter={closeNow}
                    onFocus={closeNow}
                    className={`group ${linkBase} ${linkTone}`}
                  >
                    {node.shortLabel ?? node.label}
                    <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-orange transition-transform duration-500 ease-premium group-hover:origin-left group-hover:scale-x-100" />
                  </SmartLink>
                </li>
              );
            }

            return (
              <li key={node.id}>
                <button
                  type="button"
                  ref={(el) => {
                    triggerRefs.current[node.id] = el;
                  }}
                  aria-haspopup="true"
                  aria-expanded={open}
                  aria-controls={`mega-${node.id}`}
                  onMouseEnter={() => scheduleOpen(node.id)}
                  onFocus={() => {
                    clearTimers();
                    setOpenId(node.id);
                  }}
                  onClick={() => (open ? closeNow() : setOpenId(node.id))}
                  onKeyDown={(e) => onRowKeyDown(e, index, node)}
                  className={`group ${linkBase} ${
                    open ? `text-orange ${solid ? '' : 'text-shadow-video'}` : linkTone
                  }`}
                >
                  {node.shortLabel ?? node.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px w-full bg-orange transition-transform duration-500 ease-premium ${
                      open
                        ? 'scale-x-100'
                        : 'origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100'
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ---------- Full-width mega panel ---------- */}
      <AnimatePresence>
        {activeNode ? (
          <motion.div
            id={`mega-${activeNode.id}`}
            ref={panelRef}
            onKeyDown={onPanelKeyDown}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
            style={{ left: panelLeft, width: panelWidth }}
            className="absolute top-full min-w-max border border-t-0 border-white/10 bg-ink/95 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            <MegaPanel node={activeNode} ctaHref={ctaHref} onNavigate={closeNow} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
