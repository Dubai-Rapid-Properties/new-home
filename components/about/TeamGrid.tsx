import Image from 'next/image';
import { ArrowRight, Mail, MessageCircle } from 'lucide-react';
import { about, memberContact, team, teamHref } from '@/data/company';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import SmartLink from '../ui/SmartLink';

/** Portrait grid linking to each profile: slow photo zoom and a lifting name on hover or focus. */
export default function TeamGrid() {
  return (
    <section id="team" aria-labelledby="team-heading" className="section-y scroll-mt-16 bg-white">
      <div className="container-drp">
        <SectionHeading eyebrow={about.team.eyebrow} heading={about.team.heading} headingId="team-heading" />
        <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          {team.map((m, i) => (
            <Reveal as="li" key={m.id} delay={(i % 4) * 0.08} className="group">
              <SmartLink href={teamHref(m)} aria-label={`${m.name}, ${m.role}: view profile`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange">
                <div className="relative aspect-[4/5] overflow-hidden bg-line">
                  <Image
                    src={m.photo}
                    alt={`${m.name}, ${m.role}`}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-[50%_18%] transition-transform duration-[900ms] ease-premium group-hover:scale-[1.05] group-focus-within:scale-[1.05]"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 transition-transform duration-500 ease-premium group-hover:-translate-y-2 group-focus-within:-translate-y-2 sm:p-6">
                    <h3 className="font-serif text-[1.6rem] leading-tight text-white">{m.name}</h3>
                    <p className="mt-1.5 text-[10px] uppercase tracking-eyebrow text-white/75">{m.role}</p>
                  </div>
                </div>
              </SmartLink>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  {m.line ? <p className="text-sm font-light leading-relaxed text-charcoal-muted">{m.line}</p> : null}
                  <SmartLink
                    href={teamHref(m)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className={`${m.line ? 'mt-3' : ''} inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-eyebrow text-charcoal transition-colors duration-300 hover:text-orange group-hover:text-orange`}
                  >
                    View profile
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
                  </SmartLink>
                </div>
                {m.whatsapp || m.email ? (
                  <div className="flex shrink-0 items-center gap-3 pt-0.5">
                    {m.whatsapp ? (
                      <a
                        href={`${memberContact(m).whatsappHref}?text=${encodeURIComponent(
                          memberContact(m).personal ? `Hello ${m.name.split(' ')[0]},` : `Hello DRP, I would like to speak to ${m.name}.`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${m.name}`}
                        className="text-charcoal transition-colors duration-300 hover:text-orange"
                      >
                        <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-[18px] w-[18px]" />
                      </a>
                    ) : null}
                    {m.email ? (
                      <a
                        href={`${memberContact(m).emailHref}?subject=${encodeURIComponent(`For the attention of ${m.name}`)}`}
                        aria-label={`Email ${m.name}`}
                        className="text-charcoal transition-colors duration-300 hover:text-orange"
                      >
                        <Mail aria-hidden="true" strokeWidth={1.5} className="h-[18px] w-[18px]" />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
