'use client';

import Image from 'next/image';
import { Flame } from 'lucide-react';
import type { OffPlanProject, ReadyProperty, RentalProperty } from '@/data/homepage';
import FavouriteButton from './properties/FavouriteButton';
import Price from './ui/Price';
import SmartLink from './ui/SmartLink';

type Props =
  | { kind: 'ready'; item: ReadyProperty }
  | { kind: 'rent'; item: RentalProperty }
  | { kind: 'offplan'; item: OffPlanProject };

export default function PropertyCard(props: Props) {
  const { kind, item } = props;
  const isProject = kind === 'offplan';

  /* Sale and rental cards share the same shape; only the price line differs. */
  const badge = isProject ? item.paymentPlan ?? 'New Launch' : item.status;
  const hot = !isProject && item.hot;
  const eyebrow = isProject
    ? item.developer
      ? `${item.developer} · ${item.community}`
      : item.community
    : item.location;

  return (
    <article className="group relative">
      {isProject ? null : <FavouriteButton slug={item.id} title={item.title} />}
      <SmartLink href={item.href} document={!isProject && item.document} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
          <Image
            src={item.image}
            alt={item.alt}
            fill
            loading="lazy"
            /* The 4:5 card crops a landscape photo to its middle, so it needs about twice the card's width to stay sharp */
            sizes="(max-width: 640px) 180vw, (max-width: 1024px) 90vw, 50vw"
            quality={85}
            className="object-cover transition-transform duration-[700ms] ease-premium group-hover:scale-[1.06]"
          />

          {hot ? (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 bg-orange px-3 py-1.5 text-[10px] font-medium uppercase tracking-eyebrow text-white shadow-[0_6px_18px_rgba(244,123,73,0.35)]">
              <Flame aria-hidden="true" className="h-3 w-3" strokeWidth={2} />
              {badge}
            </span>
          ) : (
            <span className="absolute left-4 top-4 bg-white/95 px-3 py-1.5 text-[10px] font-medium uppercase tracking-eyebrow text-charcoal backdrop-blur-sm">
              {badge}
            </span>
          )}
        </div>

        <div className="pt-5">
          {/* Off-plan eyebrows ("Developer · Community") can run to two lines,
              so the space is reserved to keep every card's text aligned. */}
          <p
            className={`text-[10px] uppercase leading-4 tracking-eyebrow text-charcoal-muted ${
              isProject ? 'min-h-8' : ''
            }`}
          >
            {eyebrow}
          </p>

          <h3 className="mt-3 line-clamp-2 min-h-[3.1rem] font-serif text-xl font-normal leading-snug text-charcoal transition-colors duration-300 group-hover:text-orange sm:text-[1.4rem]">
            {item.title}
          </h3>

          <p className="mt-3 font-serif text-lg font-normal text-charcoal sm:text-xl">
            {isProject ? item.fromPrice : item.aed ? <Price aed={item.aed} /> : item.price}
            {kind === 'rent' ? (
              <span className="ml-1.5 font-sans text-[13px] font-light text-charcoal-muted">
                {item.period}
              </span>
            ) : null}
          </p>

          {/* Specs row — type/beds/baths on the left, size on the right, so
              every card keeps the same height regardless of label length */}
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4 text-[10px] font-light uppercase tracking-wide text-charcoal-muted">
            {isProject ? (
              <>
                <span>Handover {item.handover}</span>
                <span className="text-right">{item.paymentPlan ? `${item.paymentPlan} plan` : item.units}</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <span>{item.type}</span>
                  <span aria-hidden="true" className="text-line">
                    |
                  </span>
                  <span>{item.beds}</span>
                  {item.baths ? (
                    <>
                      <span aria-hidden="true" className="text-line">
                        |
                      </span>
                      <span>{item.baths}</span>
                    </>
                  ) : null}
                </span>
                <span className="shrink-0 whitespace-nowrap">{item.area}</span>
              </>
            )}
          </div>
        </div>
      </SmartLink>
    </article>
  );
}
