'use client';

import { useId, useState, type FormEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { useEnquiry } from '@/lib/enquiry';
import { DEFAULT_DIAL, normalisePhone, phoneError } from '@/lib/phone';
import { SuccessState } from '@/components/LeadForm';
import PhoneField from '@/components/ui/PhoneField';
import SendError from '@/components/ui/SendError';
import { EMAIL_PATTERN, inputBase, labelBase } from '@/components/ui/formStyles';

const INTERESTS = ['Off-plan investment', 'Ready property to buy', 'Golden Visa', 'Holiday home', 'Something else'];
const BUDGETS = ['Under AED 1M', 'AED 1M – 2M', 'AED 2M – 5M', 'AED 5M – 10M', 'AED 10M+'];

type Errors = Partial<Record<'name' | 'phone' | 'email', string>>;

const selectBase =
  'w-full cursor-pointer appearance-none border-0 border-b border-line bg-transparent pb-2.5 pt-6 text-[15px] font-light text-charcoal outline-none transition-colors duration-300 focus:border-orange';

/**
 * A short consultation request: who they are, how to reach them and what
 * they are looking for. Emailed to D|R|P and saved as a lead in the portal,
 * like every other website form.
 */
export default function ConsultationForm({ context = {} }: { context?: Record<string, string> }) {
  const uid = useId();
  const [name, setName] = useState('');
  const [dial, setDial] = useState(DEFAULT_DIAL);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const { sending, failed, send } = useEnquiry();

  const fix =
    (key: keyof Errors, set: (v: string) => void) =>
    (v: string) => {
      set(v);
      if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    };

  const error = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${uid}-${key}-error`} role="alert" className="mt-2 text-xs text-orange-600">
        {errors[key]}
      </p>
    ) : null;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found: Errors = {};
    if (!name.trim()) found.name = 'Please enter your name.';
    const phoneMsg = phoneError(dial, phone);
    if (phoneMsg) found.phone = phoneMsg;
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) found.email = 'Please enter a valid email address.';
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    const ok = await send({
      form: 'free-consultation',
      ...context,
      name: name.trim(),
      phone: normalisePhone(dial, phone) ?? '',
      email: email.trim(),
      interest,
      budget: budget || 'Not given',
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    });
    if (ok) setSent(true);
  };

  if (sent)
    return (
      <SuccessState
        title="Thank you."
        body="A D|R|P property expert will call you shortly to arrange your free consultation."
        headingRef={(el) => el?.focus()}
        onReset={() => {
          setSent(false);
          setMessage('');
        }}
        resetLabel="Send another request"
      />
    );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="relative">
        <input
          id={`${uid}-name`}
          type="text"
          autoComplete="name"
          placeholder=" "
          value={name}
          onChange={(e) => fix('name', setName)(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          className={inputBase}
        />
        <label htmlFor={`${uid}-name`} className={labelBase}>
          Name
        </label>
        {error('name')}
      </div>

      <PhoneField
        id={`${uid}-phone`}
        dial={dial}
        onDialChange={setDial}
        value={phone}
        onChange={fix('phone', setPhone)}
        error={errors.phone}
        errorId={`${uid}-phone-error`}
      />

      <div className="relative">
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="email"
          placeholder=" "
          value={email}
          onChange={(e) => fix('email', setEmail)(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${uid}-email-error` : undefined}
          className={inputBase}
        />
        <label htmlFor={`${uid}-email`} className={labelBase}>
          Email (optional)
        </label>
        {error('email')}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="relative">
          <label htmlFor={`${uid}-interest`} className="absolute left-0 top-0 text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
            Looking for
          </label>
          <select id={`${uid}-interest`} value={interest} onChange={(e) => setInterest(e.target.value)} className={selectBase}>
            {INTERESTS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" strokeWidth={1.5} className="pointer-events-none absolute bottom-3.5 right-0 h-4 w-4 text-charcoal-muted" />
        </div>
        <div className="relative">
          <label htmlFor={`${uid}-budget`} className="absolute left-0 top-0 text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
            Budget
          </label>
          <select id={`${uid}-budget`} value={budget} onChange={(e) => setBudget(e.target.value)} className={selectBase}>
            <option value="">Not sure yet</option>
            {BUDGETS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" strokeWidth={1.5} className="pointer-events-none absolute bottom-3.5 right-0 h-4 w-4 text-charcoal-muted" />
        </div>
      </div>

      <div className="relative">
        <textarea
          id={`${uid}-message`}
          rows={2}
          placeholder=" "
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputBase} resize-none`}
        />
        <label htmlFor={`${uid}-message`} className={labelBase}>
          Anything we should know? (optional)
        </label>
      </div>

      {failed ? <SendError /> : null}

      <button
        type="submit"
        disabled={sending}
        className="group inline-flex h-14 w-full items-center justify-center gap-3 bg-orange px-10 text-[11px] font-medium uppercase tracking-eyebrow text-white transition-colors duration-300 hover:bg-orange-600 disabled:opacity-60"
      >
        {sending ? 'Sending…' : 'Book a Free Consultation'}
        <span aria-hidden="true" className="transition-transform duration-500 ease-premium group-hover:translate-x-1.5">
          &rarr;
        </span>
      </button>
    </form>
  );
}
