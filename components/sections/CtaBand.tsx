import type { ReactNode } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { contact } from '@/data/homepage';
import SmartLink from '../ui/SmartLink';

type Props = {
  eyebrow: string;
  heading: string;
  text?: string;
  button?: { label: string; href: string };
  /** A form shown beside the heading in place of the button */
  form?: ReactNode;
  /** Pre-filled WhatsApp message. */
  whatsappText?: string;
};

/** Dark closing band: one button (or a form), with phone and WhatsApp beside it. */
export default function CtaBand({ eyebrow, heading, text, button, form, whatsappText }: Props) {
  const whatsappHref = whatsappText
    ? `${contact.whatsappHref}?text=${encodeURIComponent(whatsappText)}`
    : contact.whatsappHref;

  const lines = (
    <ul className="flex flex-col gap-3 text-sm font-light sm:gap-2">
      <li>
        <a
          href={contact.phoneHref}
          className="inline-flex items-center gap-2.5 text-white/80 transition-colors duration-300 hover:text-orange"
        >
          <Phone aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
          {contact.phone}
        </a>
      </li>
      <li>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 text-white/80 transition-colors duration-300 hover:text-orange"
        >
          <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
          WhatsApp {contact.whatsapp}
        </a>
      </li>
    </ul>
  );

  const intro = (
    <div>
      <p className="eyebrow text-orange">{eyebrow}</p>
      <h2 id="cta-heading" className="heading-display mt-5 max-w-[18ch] text-[clamp(2rem,4.6vw,3.75rem)] text-white">
        {heading}
      </h2>
      {text ? <p className="mt-5 max-w-lg text-[15px] font-light leading-relaxed text-white/60">{text}</p> : null}
    </div>
  );

  if (form)
    return (
      <section aria-labelledby="cta-heading" className="section-y bg-ink text-white">
        <div className="container-drp grid gap-12 lg:grid-cols-[1fr_minmax(0,32rem)] lg:items-center lg:gap-20">
          <div className="flex flex-col gap-10">
            {intro}
            {lines}
          </div>
          <div className="bg-white p-6 text-charcoal sm:p-10">{form}</div>
        </div>
      </section>
    );

  return (
    <section aria-labelledby="cta-heading" className="section-y bg-ink text-white">
      <div className="container-drp flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        {intro}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          {button ? (
          <SmartLink
            href={button.href}
            className="group inline-flex h-14 items-center justify-center gap-3 bg-orange px-10 text-[11px] font-medium uppercase tracking-eyebrow text-white transition-colors duration-300 hover:bg-orange-600"
          >
            {button.label}
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-premium group-hover:translate-x-1.5"
            >
              &rarr;
            </span>
          </SmartLink>
          ) : null}
          {lines}
        </div>
      </div>
    </section>
  );
}
