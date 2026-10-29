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
import BrochureButton from '@/components/offplan/BrochureButton';
import { DetailsAndAmenities, UnitsAndPlan } from '@/components/offplan/ProjectDetails';
import { agentCards } from '@/data/agentCards';
import { allTeam, memberContact } from '@/data/company';
import { contact } from '@/data/homepage';
import { licences } from '@/data/licences';
import { siteUrl } from '@/lib/siteUrl';
import { areaHref, areas } from '@/data/areas';
import { contactStep, type LeadFormConfig } from '@/data/leadPages';
import {
  constructionFor,
  constructionStage,
  formatAed,
  getProject,
  handoverLabel,
  priceLabel,
  projectEyebrow,
  projectHref,
  projectLocation,
  similarProjects,
  unitName,
  unitTypesLabel,
} from '@/data/offPlan';
import { clip, pageMeta } from '@/lib/seo';
import { staticSlugs } from './slugs';

/** Next 16: route params arrive as a Promise and must be awaited. */
type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const project = getProject((await params).slug);
  if (!project) return { title: 'Off-Plan | Dubai Rapid Properties' };
  const by = project.developer ? ` by ${project.developer}` : '';
  return pageMeta({
    title: `${project.name}${by} | Dubai Rapid Properties`,
    description: clip(
      `${project.name}${by}, an off-plan project in ${project.area}, Dubai. ${project.fromPrice == null ? 'Price on request' : `From ${priceLabel(project)}`}, handover ${handoverLabel(project)}. ${project.description.join(' ')}`,
    ),
    path: projectHref(project.slug),
    image: project.image,
  });
}

/** "AED 1.35M", "AED 850K" */
const shortAed = (n: number) =>
  n >= 1_000_000 ? `AED ${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M` : `AED ${Math.round(n / 1000)}K`;

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
  const schedule = project.schedule;
  const details: [string, string][] = [
    ...(project.developer ? ([['Developer', project.developer]] as [string, string][]) : []),
    ['Location', `${project.area}, Dubai`],
    ['Property types', project.propertyTypes.join(', ')],
    ['Unit types', unitTypesLabel(project)],
    ['Starting price', priceLabel(project)],
    ['Expected handover', handoverLabel(project)],
    ...(schedule
      ? ([['Payment plan', `${schedule[0]}% on booking, ${schedule[1]}% during construction, ${schedule[2]}% on and after handover`]] as [string, string][])
      : project.paymentPlan
        ? ([['Payment plan', project.paymentPlan]] as [string, string][])
        : []),
    ...(project.ownership ? ([['Ownership', project.ownership]] as [string, string][]) : []),
    ...(project.availability ? ([['Availability', project.availability]] as [string, string][]) : []),
    ...(construction ? ([['Construction', `${construction.progress}% complete`]] as [string, string][]) : []),
  ];
  /* Unit-type step: bedrooms when known, otherwise property types */
  const unitOptions = project.units?.length
    ? [...new Set(project.units.map(unitName))]
    : project.bedrooms.length
    ? project.bedrooms.map(bedLabel)
    : project.propertyTypes.map((t) => `${t}`);

  const interestForm: LeadFormConfig = {
    formId: 'off-plan-interest',
    submitLabel: 'Register Interest',
    successTitle: 'Thank you.',
    successBody: `A D|R|P off-plan specialist will send you the ${project.name} brochure, floor plans and current availability.`,
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

  /* The agents' brochure: the page's own details and photos */
  const plan = schedule ? `${schedule[0] + schedule[1]}/${schedule[2]}` : project.paymentPlan;
  const [beds, types] = unitTypesLabel(project).includes(' · ')
    ? unitTypesLabel(project).split(' · ')
    : ['', unitTypesLabel(project)];
  const sizes = (project.units ?? []).flatMap((u) => u.size ?? []);
  const sqft = (n: number) => n.toLocaleString('en-US');
  const grid = [
    {
      label: 'Starting price',
      value: project.fromPrice ? shortAed(project.fromPrice) : 'On request',
      sub: project.fromPrice ? formatAed(project.fromPrice) : 'Ask your D|R|P specialist',
    },
    project.developer ? { label: 'Developer', value: project.developer, sub: project.ownership ? `${project.ownership} ownership` : 'Developer' } : null,
    {
      label: 'Handover',
      value: handoverLabel(project),
      sub: construction ? `${construction.progress}% built` : 'Expected completion',
    },
    plan
      ? {
          label: 'Payment plan',
          value: plan,
          sub: schedule ? `${schedule[0]}% booking · ${schedule[1]}% build · ${schedule[2]}% handover` : 'Before / after handover',
        }
      : null,
    { label: 'Unit types', value: beds || types, sub: beds ? types : 'Unit types' },
    sizes.length
      ? { label: 'Sizes', value: `${sqft(Math.min(...sizes))} - ${sqft(Math.max(...sizes))} sq ft`, sub: 'Across the unit types' }
      : null,
    { label: 'Location', value: project.area, sub: 'Dubai' },
    project.ownership ? { label: 'Ownership', value: project.ownership, sub: 'Title' } : null,
    project.amenities?.length
      ? { label: 'Amenities', value: `${project.amenities.length} amenities`, sub: project.amenities.slice(0, 3).join(' · ') }
      : null,
  ].filter((c): c is { label: string; value: string; sub: string } => c !== null);
  const brochure = {
    slug: project.slug,
    name: project.name,
    eyebrow: project.developer ? `Off-plan · ${project.developer}` : 'Off-plan',
    location: `${project.area} · Dubai`,
    price: project.fromPrice ? formatAed(project.fromPrice) : null,
    keyFacts: [
      [handoverLabel(project), 'Handover'],
      ...(plan ? [[plan, 'Payment plan']] : project.ownership ? [[project.ownership, 'Ownership']] : []),
      [beds || types, beds ? 'Units' : 'Homes'],
    ] as [string, string][],
    /* Whole rows of three */
    grid: grid.length > 6 ? grid.slice(0, grid.length - (grid.length % 3)) : grid,
    description: project.description,
    highlights: project.highlights,
    units: (project.units ?? []).map((u) => ({
      name: unitName(u),
      size: u.size ? (u.size[0] === u.size[1] ? `${sqft(u.size[0])} sq ft` : `${sqft(u.size[0])} - ${sqft(u.size[1])} sq ft`) : '',
      price: u.from ? formatAed(u.from) : 'On request',
    })),
    schedule: project.schedule,
    amenities: project.amenities ?? [],
    area: project.area,
    locationText: project.locationText,
    coords: project.map.exact ? project.map.near : undefined,
    images: [...new Set([project.image, ...project.gallery.map((g) => g.src)])].slice(0, 17),
    masterPlan: project.masterPlan,
    pageUrl: `${siteUrl}${projectHref(project.slug)}`,
  };
  const brochureAgents = allTeam.map((m) => {
    const c = memberContact(m);
    /* The agent's own contact card, and the details printed on it */
    const card = agentCards[m.name];
    return {
      name: m.name,
      role: card?.role ?? m.role,
      phone: card?.phone ?? c.phone,
      whatsapp: card?.whatsapp ?? m.whatsappNumber ?? contact.whatsapp,
      email: card?.email ?? m.emailAddress ?? contact.email,
      brn: m.brn ?? '',
      photo: m.photo || undefined,
      card: card?.card,
    };
  });
  const brochureOffice = {
    phone: contact.phone,
    email: contact.email,
    address: contact.addressFull,
    orn: licences.orn,
    website: siteUrl.replace(/^https?:\/\//, ''),
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
              <BrochureButton project={brochure} agents={brochureAgents} office={brochureOffice} />
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

      <UnitsAndPlan project={project} />
      <DetailsAndAmenities project={project} details={details} />

      {/* ---------- Gallery and master plan ---------- */}
      {project.gallery.length > 1 || project.masterPlan ? (
        <section aria-labelledby="gallery-heading" className="section-y bg-cream">
          <div className="container-drp">
            {project.gallery.length > 1 ? (
              <>
                <SectionHeading
                  eyebrow={`Gallery · ${project.gallery.length} photos`}
                  heading={`Inside ${project.name}`}
                  headingId="gallery-heading"
                />
                <div className="mt-12">
                  <ListingGallery images={project.gallery} title={project.name} />
                </div>
              </>
            ) : null}
            {project.masterPlan ? (
              <div className={project.gallery.length > 1 ? 'mt-20' : ''}>
                <SectionHeading
                  eyebrow="Master Plan"
                  heading={`${project.name} master plan`}
                  headingId={project.gallery.length > 1 ? undefined : 'gallery-heading'}
                />
                <div className="mt-10 bg-white p-4 sm:p-8">
                  {/* eslint-disable-next-line @next/next/no-img-element -- a drawing shown whole, at its own shape */}
                  <img
                    src={project.masterPlan}
                    alt={`${project.name} master plan`}
                    loading="lazy"
                    className="mx-auto h-auto max-h-[80vh] w-auto max-w-full"
                  />
                </div>
              </div>
            ) : null}
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
                  {project.fromPrice != null ? `Starting from ${priceLabel(project)}. ` : ''}Ask a D|R|P specialist for the payment plan and current availability.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <FormSection
        eyebrow="Register Interest"
        heading={`Receive the ${project.name} brochure`}
        intro="Floor plans, current availability and the full payment schedule, sent by a D|R|P off-plan specialist."
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
