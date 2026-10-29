import SiteShell from '@/components/layout/SiteShell';
import { pageMeta } from '@/lib/seo';
import AgentSignIn from './AgentSignIn';

export const metadata = pageMeta({
  title: 'Agents | Dubai Rapid Properties',
  description: 'Sign-in for D|R|P agents.',
  path: '/agents',
  noindex: true,
});

/** Where D|R|P's agents unlock their tools (lib/agentAccess.ts). Not linked from the site. */
export default function Page() {
  return (
    <SiteShell>
      <section className="bg-white pb-[var(--section-y)] pt-36 lg:pt-44">
        <div className="container-drp">
          <p className="eyebrow text-orange">For D|R|P Agents</p>
          <h1 className="heading-display mt-5 text-[clamp(2.2rem,4.6vw,3.5rem)] text-charcoal">Agent tools</h1>
          <p className="mt-5 max-w-xl text-[15px] font-light leading-relaxed text-charcoal-muted">
            Enter the office&apos;s agent access code to download off-plan project brochures with your own contact details.
          </p>
          <div className="mt-12">
            <AgentSignIn />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
