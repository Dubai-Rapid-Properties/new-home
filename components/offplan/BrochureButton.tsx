'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Download, FileText, X } from 'lucide-react';
import type { BrochureAgent, BrochureOffice, BrochureProject } from '@/lib/brochurePdf';
import { inputBase, labelBase } from '@/components/ui/formStyles';

/** The agent's details, remembered in this browser for the next brochure */
const KEY = 'drp:brochure-agent';
const OTHER = '__other';

type Props = {
  project: BrochureProject;
  /** D|R|P's agents, to pick from */
  agents: BrochureAgent[];
  office: BrochureOffice;
};

type Saved = { pick: string; agent: BrochureAgent };

const empty: BrochureAgent = { name: '', role: 'Property Consultant', phone: '', whatsapp: '', email: '', brn: '' };

function readSaved(): Saved | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? 'null');
    return v && typeof v.pick === 'string' && v.agent && typeof v.agent.name === 'string' ? v : null;
  } catch {
    return null;
  }
}

/**
 * "Download brochure" for D|R|P's agents: pick yourself (or type your
 * details), and the project's details, photos and your contacts come out as
 * a branded PDF to send to a client.
 */
export default function BrochureButton({ project, agents, office }: Props) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState('');
  const [agent, setAgent] = useState<BrochureAgent>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  /* Only D|R|P agents, signed in at /agents, see the button */
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    fetch('/api/agent-access', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setIsAgent(Boolean(d.agent)))
      .catch(() => setIsAgent(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    const saved = readSaved();
    if (saved) {
      setPick(saved.pick);
      setAgent(saved.agent);
    }
    dialog.current?.querySelector<HTMLElement>('select')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy]);

  const choose = (value: string) => {
    setPick(value);
    setError('');
    if (value === OTHER) setAgent({ ...empty });
    else {
      const a = agents.find((x) => x.name === value);
      if (a) setAgent({ ...a });
    }
  };

  const set = (k: keyof BrochureAgent) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAgent((a) => ({ ...a, [k]: e.target.value }));

  const download = async () => {
    if (!agent.name.trim() || !agent.phone.trim() || !agent.email.trim()) {
      setError('Add your name, phone and email for the brochure.');
      return;
    }
    setBusy(true);
    setError('');
    const clean = Object.fromEntries(
      Object.entries(agent).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
    ) as BrochureAgent;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ pick, agent: clean }));
    } catch {
      /* Blocked storage: the details are asked for again next time */
    }
    try {
      const { makeBrochure } = await import('@/lib/brochurePdf');
      await makeBrochure(project, clean, office);
      setOpen(false);
    } catch (e) {
      console.error('[brochure]', e);
      setError('The brochure could not be made. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const field = (k: keyof BrochureAgent, label: string, type = 'text') => (
    <div className="relative">
      <input
        id={`${uid}-${k}`}
        type={type}
        placeholder=" "
        value={agent[k] ?? ''}
        onChange={set(k)}
        className={inputBase}
      />
      <label htmlFor={`${uid}-${k}`} className={labelBase}>
        {label}
      </label>
    </div>
  );

  if (!isAgent) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-eyebrow text-charcoal transition-colors duration-300 hover:text-orange"
      >
        <FileText aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
        Agent brochure (PDF)
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-6">
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto bg-white p-6 sm:p-9"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="eyebrow text-orange">For D|R|P agents</p>
                <h2 id={`${uid}-title`} className="mt-3 font-serif text-[1.75rem] leading-snug text-charcoal">
                  {project.name} brochure
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !busy && setOpen(false)}
                aria-label="Close"
                className="-mr-2 p-2 text-charcoal-muted hover:text-charcoal"
              >
                <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <p className="mt-3 text-sm font-light leading-relaxed text-charcoal-muted">
              The project&apos;s details and photos as a PDF, with your contact details on every page, ready to send to a client.
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <label htmlFor={`${uid}-pick`} className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
                  Agent
                </label>
                <select
                  id={`${uid}-pick`}
                  value={pick}
                  onChange={(e) => choose(e.target.value)}
                  className="mt-2 w-full cursor-pointer border-0 border-b border-line bg-transparent pb-2.5 text-[15px] font-light text-charcoal outline-none focus:border-orange"
                >
                  <option value="" disabled>
                    Choose yourself
                  </option>
                  {agents.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                  <option value={OTHER}>Someone else</option>
                </select>
              </div>
              {pick ? (
                <>
                  {field('name', 'Name')}
                  {field('role', 'Title')}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {field('phone', 'Phone', 'tel')}
                    {field('whatsapp', 'WhatsApp', 'tel')}
                  </div>
                  {field('email', 'Email', 'email')}
                  {field('brn', 'BRN (RERA broker number)')}
                  <p className="text-xs font-light text-charcoal-muted">
                    Check your phone and email: they appear on every page. They are remembered on this device.
                  </p>
                </>
              ) : null}
            </div>

            {error ? (
              <p role="alert" className="mt-5 text-sm text-orange-600">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={download}
              disabled={!pick || busy}
              className="group mt-8 inline-flex h-14 w-full items-center justify-center gap-3 bg-orange px-10 text-[11px] font-medium uppercase tracking-eyebrow text-white transition-colors duration-300 hover:bg-orange-600 disabled:opacity-50"
            >
              <Download aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
              {busy ? 'Making the PDF…' : 'Download PDF'}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
