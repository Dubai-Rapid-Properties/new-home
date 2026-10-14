'use client';

import { useId, useState } from 'react';
import { useEnquiry } from '@/lib/enquiry';
import { EMAIL_PATTERN } from './ui/formStyles';

/** Footer signup for DRP's market updates and new listings; emailed to the office. */
export default function NewsletterSignup() {
  const id = useId();
  const { sending, failed, send } = useEnquiry();
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (await send({ form: 'newsletter', email: email.trim() })) setDone(true);
  };

  return (
    <div>
      <h2 className="eyebrow text-white/40">Market Updates</h2>
      {done ? (
        <p role="status" className="mt-5 max-w-sm text-sm font-light text-white/75">
          Thank you. You will receive D|R|P&rsquo;s market updates and new listings.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5 max-w-sm">
          <p className="text-sm font-light leading-relaxed text-white/55">
            New listings, launches and Dubai market notes, once or twice a month.
          </p>
          <div className="mt-4 flex border-b border-white/25 focus-within:border-orange">
            <label htmlFor={`${id}-email`} className="sr-only">
              Email address
            </label>
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-error` : undefined}
              className="min-w-0 flex-1 bg-transparent py-3 text-sm font-light text-white outline-none placeholder:text-white/35"
            />
            <button
              type="submit"
              disabled={sending}
              className="shrink-0 pl-4 text-[11px] font-medium uppercase tracking-eyebrow text-orange transition-colors duration-300 hover:text-white disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Subscribe'}
            </button>
          </div>
          {invalid ? (
            <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-orange">
              Please enter a valid email address.
            </p>
          ) : null}
          {failed ? (
            <p role="alert" className="mt-2 text-xs text-white/60">
              Sorry, that did not go through. Please try again in a moment.
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
