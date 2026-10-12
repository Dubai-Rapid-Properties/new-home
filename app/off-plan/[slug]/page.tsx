import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ProjectCard from '@/components/offplan/ProjectCard';
import ListingGallery from '@/components/properties/ListingGallery';
import PropertyMap from '@/components/properties/PropertyMap';
import { ListingMortgage } from '@/components/ecosystem/MortgageCalculator';
import FormSection from '@/components/sections/FormSection';
import ArrowLink from '@/components/ui/ArrowLink';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartLink from '@/components/ui/SmartLink';
import { areaHref, areas } from '@/data/areas';
import { contactStep, type LeadFormConfig } from '@/data/leadPages';
import {
  constructionFor,
  constructionStage,
  getProject,
  handoverLabel,
  priceLabel,
  projectEyebrow,
  projectLocation,
  similarProjects,
  unitTypesLabel,
} from '@/data/offPlan';
import { staticSlugs } from './slugs';

/** Next 16: route params arrive as a Promise and must be awaited. */
type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const project = getProject((await params).slug);
  return {
    title: project
      ? `${project.name}${project.developer ? ` by ${project.developer}` : ''} | Dubai Rapid Properties`
      : 'Off-Plan | Dubai Rapid Properties',
  };
}

const bedLabel = (n: number) => (n === 0 ? 'Studio' : `${n} Bedroom${n === 1 ? '' : 's'}`);

export default async function Page({ params }: PageProps) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const construction = constructionFor(project);
  /* Only link areas that have a guide */
  const guide = areas.find((a) => a.name === project.area);
  const facts = [
    ['Starting price', priceLabel(project)],
    ['Handover', handoverLabel(project)],
    ['Units', unitTypesLabel(project)],
    ['Location', project.area],
    ...(project.paymentPlan ? [['Payment plan', project.paymentPlan]] : []),
    ...(project.developer ? [['Developer', project.developer]] : []),
  ].slice(0, 5);
  /* Unit-type step: bedrooms when known, otherwise property types */
  const unitOptions = project.bedrooms.length
    ? project.bedrooms.map(bedLabel)
    : project.propertyTypes.map((t) => `${t}`);

  const interestForm: LeadFormConfig = {
    formId: 'off-plan-interest',
    submitLabel: 'Register Interest',
    successTitle: 'Thank you.',
    successBody: `A DRP off-plan specialist will send you the ${project.name} brochure, floor plans and current availability.`,
    steps: [
      {
        id: 'unitType',
        label: 'Unit Type',
        question: 'Which unit type interests you?',
        kind: 'choice',
        columns: unitOptions.length > 2 ? 3 : 2,
        options: [...unitOptions, 'Not sure yet'].map((v) => ({ value: v, label: v })),
      },
      {
        id: 'purpose',
        label: 'Purpose',
        question: 'Are you buying to live in or to invest?',
        kind: 'choice',
        columns: 2,
        options: [
          { value: 'Live in', label: 'To live in' },
          { value: 'Invest', label: 'To invest' },
        ],
      },
      contactStep({ id: 'brochure', label: 'Send me the brochure and floor plans' }),
    ],
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow={projectEyebrow(project)}
        heading={project.name}
        intro={project.description[0].length > 260 ? `${project.description[0].slice(0, 250).replace(/\s+\S*$/, '')}…` : project.description[0]}
        image={project.image}
        imageAlt={project.alt}
      />

      {/* ---------- Key facts ---------- */}
      <section aria-label="Key facts" className="border-b border-line bg-white">
        <div className="container-drp">
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {facts.map(([label, value], i) => (
              <div
                key={label}
                className={`border-line py-6 sm:py-8 ${i > 0 ? 'lg:border-l lg:pl-8' : ''} ${
                  i % 2 === 1 ? 'border-l pl-5 sm:border-l-0 sm:pl-0' : ''
                } ${i >= 2 ? 'border-t sm:border-t-0' : ''}`}
              >
                <dt className="text-[10px] uppercase tracking-eyebrow text-charcoal-muted">{label}</dt>
                <dd className="mt-2 font-serif text-[1.35rem] leading-snug text-charcoal">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- About + highlights ---------- */}
      <section aria-labelledby="about-heading" className="section-y bg-white">
        <div className="container-drp grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="The Project" heading={`About ${project.name}`} headingId="about-heading" />
            <div className="mt-8 space-y-5">
              {project.description.map((p, i) => (
                <p key={i} className="text-[15px] font-light leading-relaxed text-charcoal-light sm:text-base">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {guide ? <ArrowLink href={areaHref(guide.name)} label={`${guide.name} area guide`} /> : null}
              <ArrowLink href="/ecosystem/mortgage" label="Mortgage assistance" />
            </div>
          </div>
          <div className="lg:col-span-5 lg:pt-16">
            {project.highlights.length ? (
              <>
                <p className="eyebrow text-charcoal-muted">Highlights</p>
                <ul className="mt-5 border-t border-line">
                  {project.highlights.map((h) => (
                    <li key={h.title} className="border-b border-line py-5">
                      <p className="flex items-baseline gap-4 text-[15px] text-charcoal">
                        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 -translate-y-0.5 rounded-full bg-orange" />
                        {h.title}
                      </p>
                      {h.text ? <p className="mt-1.5 pl-[1.375rem] text-sm font-light leading-relaxed text-charcoal-muted">{h.text}</p> : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p className="eyebrow mt-10 text-charcoal-muted">Configurations</p>
            <p className="mt-3 text-[15px] font-light text-charcoal">
              {project.bedrooms.length ? `${project.bedrooms.map(bedLabel).join(' · ')} — ` : ''}
              {project.propertyTypes.join(', ')}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Gallery ---------- */}
      {project.gallery.length > 1 ? (
        <section aria-labelledby="gallery-heading" className="section-y bg-cream">
          <div className="container-drp">
            <SectionHeading eyebrow="Gallery" heading={`Inside ${project.name}`} headingId="gallery-heading" />
            <div className="mt-12">
              <ListingGallery images={project.gallery} title={project.name} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------- Mortgage on the starting price ---------- */}
      {project.fromPrice ? (
        <section aria-labelledby="mortgage-heading" className="section-y bg-white">
          <div className="container-drp">
            <div className="max-w-4xl">
              <ListingMortgage price={project.fromPrice} headingId="mortgage-heading" />
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------- Location: map + the area ---------- */}
      <section aria-label="Location" className={`section-y ${project.gallery.length > 1 ? 'bg-white' : 'bg-cream'}`}>
        <div className="container-drp grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <PropertyMap {...projectLocation(project)} headingId="location-heading" />
          </div>
          {project.locationText.length ? (
            <div className="space-y-5 lg:col-span-5 lg:pt-12">
              <p className="eyebrow text-charcoal-muted">About {project.area}</p>
              {project.locationText.slice(0, 2).map((p, i) => (
                <p key={i} className="text-[15px] font-light leading-relaxed text-charcoal-light">
                  {p}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ---------- Construction progress, or the expected handover ---------- */}
      <section aria-label="Construction" className="section-y bg-ink text-white">
        <div className="container-drp">
          <div className="max-w-3xl">
            {construction ? (
              <div>
                <SectionHeading eyebrow="Construction" heading={constructionStage(construction.progress)} tone="light" />
                <div
                  role="progressbar"
                  aria-label="Construction progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={construction.progress}
                  className="mt-10 h-1.5 w-full bg-white/10"
                >
                  <div className="h-full bg-orange" style={{ width: `${construction.progress}%` }} />
                </div>
                <div className="mt-8 flex items-end justify-between gap-6">
                  <p className="font-serif text-[clamp(2rem,4vw,3rem)] font-light leading-none">{construction.progress}%</p>
                  <p className="text-right text-[11px] uppercase tracking-eyebrow text-white/50">
                    Expected handover {handoverLabel(project)}
                    <br />
                    Updated{' '}
                    {new Date(construction.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="mt-10">
                  <ArrowLink href="/off-plan/construction-tracker" label="Construction tracker" tone="light" />
                </div>
              </div>
            ) : (
              <div>
                <p className="eyebrow text-white/50">Expected handover</p>
                <p className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] font-light leading-none">{handoverLabel(project)}</p>
                <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-white/60">
                  {project.fromPrice != null ? `Starting from ${priceLabel(project)}. ` : ''}Ask a DRP specialist for the payment plan and current availability.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <FormSection
        eyebrow="Register Interest"
        heading={`Receive the ${project.name} brochure`}
        intro="Floor plans, current availability and the full payment schedule, sent by a DRP off-plan specialist."
        config={interestForm}
        context={{ project: project.slug }}
      />

      <section aria-labelledby="similar-heading" className="section-y bg-white">
        <div className="container-drp">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Explore More" heading="Similar Projects" headingId="similar-heading" />
            <SmartLink href="/off-plan/projects" className="link-underline text-[11px] font-medium text-charcoal">
              All off-plan projects <span aria-hidden="true">&rarr;</span>
            </SmartLink>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {similarProjects(project).map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
