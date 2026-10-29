'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import ArrowLink from '@/components/ui/ArrowLink';
import { inputBase, labelBase } from '@/components/ui/formStyles';

/** The office's access code, entered once per browser, unlocks the agents' tools. */
export default function AgentSignIn() {
  const uid = useId();
  const [state, setState] = useState<'checking' | 'out' | 'in'>('checking');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/agent-access', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setState(d.agent ? 'in' : 'out'))
      .catch(() => setState('out'));
  }, []);

  const send = async (body: object) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/agent-access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json().catch(() => ({}));
      if (d.agent) setState('in');
      else if ('signOut' in body) setState('out');
      else
        setError(
          d.error === 'not-configured'
            ? 'Agent access is not set up yet. Ask the office.'
            : 'That code is not right. Ask the office for the current one.',
        );
    } catch {
      setError('Could not reach the website. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim()) send({ code });
  };

  if (state === 'checking') return <p className="text-sm font-light text-charcoal-muted">Checking…</p>;

  if (state === 'in')
    return (
      <div>
        <p className="font-serif text-2xl text-charcoal">You are signed in as a D|R|P agent.</p>
        <p className="mt-3 max-w-lg text-[15px] font-light leading-relaxed text-charcoal-muted">
          Open any off-plan project and use <strong className="font-medium text-charcoal">Agent brochure (PDF)</strong>, next to the area guide link, to download its brochure with your details. This browser stays signed in for 90 days.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <ArrowLink href="/off-plan/projects" label="Off-plan projects" />
          <button
            type="button"
            onClick={() => send({ signOut: true })}
            disabled={busy}
            className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted hover:text-orange"
          >
            Sign out
          </button>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="max-w-md space-y-8">
      <div className="relative">
        <input
          id={`${uid}-code`}
          type="password"
          autoComplete="current-password"
          placeholder=" "
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${uid}-error` : undefined}
          className={inputBase}
        />
        <label htmlFor={`${uid}-code`} className={labelBase}>
          Agent access code
        </label>
      </div>
      {error ? (
        <p id={`${uid}-error`} role="alert" className="text-sm text-orange-600">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy || !code.trim()}
        className="inline-flex h-14 items-center justify-center bg-orange px-10 text-[11px] font-medium uppercase tracking-eyebrow text-white transition-colors duration-300 hover:bg-orange-600 disabled:opacity-50"
      >
        {busy ? 'Checking…' : 'Sign In'}
      </button>
    </form>
  );
}
