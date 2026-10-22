import Image from 'next/image';
import {
  handoverLabel,
  priceLabel,
  projectEyebrow,
  projectHref,
  unitTypesLabel,
  type ProjectCardData,
} from '@/lib/offPlanCards';
import SmartLink from '../ui/SmartLink';

type Props = {
  project: ProjectCardData;
  /** Shows the orange NEW LAUNCH tag above the payment plan badge. */
  isNew?: boolean;
  sizes?: string;
};

export default function ProjectCard({
  project,
  isNew,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: Props) {
  return (
    <article className="group h-full">
      <SmartLink href={projectHref(project.slug)} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-line">
          <Image
            src={project.image}
            alt={project.alt}
            fill
            loading="lazy"
            sizes={sizes}
            className="object-cover transition-transform duration-[700ms] ease-premium group-hover:scale-[1.06]"
          />
          <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
            {isNew ? (
              <span className="bg-orange px-3 py-1.5 text-[10px] font-medium uppercase tracking-eyebrow text-white">
                New Launch
              </span>
            ) : null}
            {project.paymentPlan ? (
              <span className="bg-white/95 px-3 py-1.5 text-[10px] font-medium uppercase tracking-eyebrow text-charcoal backdrop-blur-sm">
                {project.paymentPlan} Payment Plan
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <p className="text-[10px] uppercase leading-4 tracking-eyebrow text-charcoal-muted">
            {projectEyebrow(project)}
          </p>

          <h3 className="mt-3 font-serif text-[1.5rem] font-normal leading-snug text-charcoal transition-colors duration-300 group-hover:text-orange sm:text-[1.65rem]">
            {project.name}
          </h3>

          <p className="mt-2 text-charcoal">
            {project.fromPrice != null ? (
              <span className="text-[11px] font-light uppercase tracking-eyebrow text-charcoal-muted">From </span>
            ) : null}
            <span className="font-serif text-lg sm:text-xl">{priceLabel(project)}</span>
          </p>

          {/* mt-auto pins the row to the bottom so a row of cards lines up */}
          <div className="mt-auto pt-5">
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4 text-[10px] font-light uppercase tracking-wide text-charcoal-muted">
              <span className="shrink-0">Handover {handoverLabel(project)}</span>
              <span className="text-right">{unitTypesLabel(project)}</span>
            </div>
          </div>
        </div>
      </SmartLink>
    </article>
  );
}
