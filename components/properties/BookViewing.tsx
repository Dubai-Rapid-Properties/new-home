'use client';

import { useId, useState, type FormEvent } from 'react';
import { useEnquiry } from '@/lib/enquiry';
import { DEFAULT_DIAL, normalisePhone, phoneError } from '@/lib/phone';
import { SuccessState } from '@/components/LeadForm';
import PhoneField from '@/components/ui/PhoneField';
import SendError from '@/components/ui/SendError';
import { EMAIL_PATTERN, inputBase, labelBase } from '@/components/ui/formStyles';

/** Viewings start tomorrow and can be booked two weeks ahead. */
const DAYS_AHEAD = 14;
const TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const KINDS = ['In person', 'Video call'] as const;

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function nextDays(): Date[] {
  const today = new Date();
  return Array.from({ length: DAYS_AHEAD }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i + 1));
}

/** "10:00" -> "10 am", "13:00" -> "1 pm" */
const timeLabel = (t: string) => {
  const h = Number(t.slice(0, 2));
  return `${h % 12 || 12} ${h < 12 ? 'am' : 'pm'}`;
};

type Errors = Partial<Record<'day' | 'time' | 'name' | 'phone' | 'email', string>>;

const chip = (selected: boolean) =>
  `rounded-md border text-charcoal transition-[border-color,background-color] duration-300 ${
    selected ? 'border-orange bg-orange-50 shadow-[inset_0_0_0_0.5px_#f47b49]' : 'border-line bg-white hover:border-charcoal/30'
  }`;

/**
 * Lets a visitor ask for a viewing on a day and time of their choice. The
 * request is emailed to DRP and saved as a lead in the portal, like every
 * other website form. Rendered only after a click, so the dates are always
 * the visitor's own.
 */
export default function BookViewing({ context }: { context: Record<string, string> }) {
  const uid = useId();
  const [days] = useState(nextDays);
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [kind, setKind] = useState<(typeof KINDS)[number]>('In person');
  const [name, setName] = useState('');
  const [dial, setDial] = useState(DEFAULT_DIAL);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const { sending, failed, send } = useEnquiry();

  /** Wraps a setter so fixing a field also clears its message. */
  const fix =
    <T,>(key: keyof Errors, set: (v: T) => void) =>
    (v: T) => {
      set(v);
      if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    };

  const error = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${uid}-${key}-error`} role="alert" className="mt-3 text-xs text-orange-600">
        {errors[key]}
      </p>
    ) : null;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found: Errors = {};
    if (!day) found.day = 'Please choose a day.';
    if (!time) found.time = 'Please choose a time.';
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

    const date = days.find((d) => isoDay(d) === day)!;
    const ok = await send({
      form: 'book-a-viewing',
      ...context,
      viewingDate: day,
      viewingDay: date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      viewingTime: `${time} (${timeLabel(time)})`,
      viewingType: kind,
      name: name.trim(),
      phone: normalisePhone(dial, phone) ?? '',
      email: email.trim(),
      submittedAt: new Date().toISOString(),
    });
    if (ok) setSent(true);
  };

  if (sent)
    return (
      <SuccessState
        title="Viewing requested."
        body="A DRP specialist will call you to confirm the time. If that slot is taken, they will offer the nearest one."
        headingRef={(el) => el?.focus()}
        onReset={() => {
          setSent(false);
          setDay('');
          setTime('');
        }}
        resetLabel="Book another time"
      />
    );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-9">
      <div>
        <p id={`${uid}-day-label`} className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
          Day
        </p>
        <div
          role="group"
          aria-labelledby={`${uid}-day-label`}
          className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]"
        >
          {days.map((d, i) => {
            const value = isoDay(d);
            return (
              <button
                key={value}
                id={i === 0 ? `${uid}-day` : undefined}
                type="button"
                aria-pressed={day === value}
                aria-label={d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                onClick={() => fix('day', setDay)(value)}
                className={`flex w-16 shrink-0 flex-col items-center py-2.5 ${chip(day === value)}`}
              >
                <span className="text-[10px] uppercase tracking-eyebrow text-charcoal-muted">
                  {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                </span>
                <span className="text-xl font-light leading-tight">{d.getDate()}</span>
                <span className="text-[10px] uppercase tracking-eyebrow text-charcoal-muted">
                  {d.toLocaleDateString('en-GB', { month: 'short' })}
                </span>
              </button>
            );
          })}
        </div>
        {error('day')}
      </div>

      <div>
        <p id={`${uid}-time-label`} className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
          Time
        </p>
        <div role="group" aria-labelledby={`${uid}-time-label`} className="mt-3 grid grid-cols-3 gap-2">
          {TIMES.map((t, i) => (
            <button
              key={t}
              id={i === 0 ? `${uid}-time` : undefined}
              type="button"
              aria-pressed={time === t}
              onClick={() => fix('time', setTime)(t)}
              className={`h-11 text-sm font-light ${chip(time === t)}`}
            >
              {timeLabel(t)}
            </button>
          ))}
        </div>
        {error('time')}
      </div>

      <div role="radiogroup" aria-label="Type of viewing" className="grid grid-cols-2 gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={`h-11 text-sm font-light ${chip(kind === k)}`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          id={`${uid}-name`}
          type="text"
          autoComplete="name"
          placeholder=" "
          value={name}
          onChange={(e) => fix('name', setName)(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          className={`${inputBase} ${errors.name ? 'border-orange' : ''}`}
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
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${uid}-email-error` : undefined}
          className={`${inputBase} ${errors.email ? 'border-orange' : ''}`}
        />
        <label htmlFor={`${uid}-email`} className={labelBase}>
          Email (optional)
        </label>
        {error('email')}
      </div>

      {failed ? <SendError /> : null}

      <div className="border-t border-line pt-6">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-12 w-full items-center justify-center bg-orange px-6 text-[11px] font-medium uppercase tracking-eyebrow text-white transition-colors duration-300 hover:bg-orange-600 disabled:cursor-wait disabled:opacity-70 sm:h-14"
        >
          {sending ? 'Sending…' : 'Request Viewing'}
        </button>
        <p className="mt-3 text-xs font-light leading-relaxed text-charcoal-muted">
          We confirm every viewing by phone before it is booked.
        </p>
      </div>
    </form>
  );
}
