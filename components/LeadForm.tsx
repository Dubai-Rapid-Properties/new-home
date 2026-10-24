'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import type { LeadFormConfig, LeadStep } from '@/data/leadPages';
import { useEnquiry } from '@/lib/enquiry';
import { DEFAULT_DIAL, normalisePhone, phoneError } from '@/lib/phone';
import PhoneField from './ui/PhoneField';
import SendError from './ui/SendError';
import { EMAIL_PATTERN, inputBase, labelBase } from './ui/formStyles';

type Values = Record<string, string | boolean>;
type Errors = Record<string, string | undefined>;

const INITIAL: Values = { dialCode: DEFAULT_DIAL };

/** Pause after a card is picked so the selected state registers before moving on. */
const ADVANCE_DELAY = 320;

/** Whether a dropdown's "Other" is picked; kept apart from the answer, which is the typed text. */
const otherKey = (id: string) => `${id}__other`;

const choiceColumns = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' } as const;

type Props = {
  config: LeadFormConfig;
  /** Extra fields sent with the submission, e.g. the listing reference. */
  context?: Record<string, string>;
  /**
   * How much room the card has. `medium` (a half-width column) caps option
   * cards at two across; `compact` (a sidebar) also stacks the contact fields.
   */
  density?: 'regular' | 'medium' | 'compact';
  className?: string;
};

/**
 * Multi-step "mini quiz" lead form, driven entirely by `config.steps`.
 * One question per step, a thin progress bar, Back / Next, and an animated
 * success state. Contact details are always collected on a `contact` step.
 */
export default function LeadForm({ config, context, density = 'regular', className = '' }: Props) {
  const uid = useId();
  const reduce = useReducedMotion();
  const { steps } = config;

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [values, setValues] = useState<Values>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const { sending, failed, send } = useEnquiry();

  const cardRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<number>();
  /** Set when the step changes so the incoming heading takes focus once mounted. */
  const focusPending = useRef(false);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const progress = sent ? 1 : (stepIndex + 1) / steps.length;
  const single = steps.length === 1;

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const setValue = (key: string, value: string | boolean) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const goTo = (next: number) => {
    window.clearTimeout(advanceTimer.current);
    setDirection(next > stepIndex ? 1 : -1);
    setErrors({});
    focusPending.current = true;
    setStepIndex(next);
  };

  /** Moves focus to the new heading and brings the card back into view on mobile. */
  const headingRef = useCallback((el: HTMLHeadingElement | null) => {
    if (!el || !focusPending.current) return;
    focusPending.current = false;
    el.focus({ preventScroll: true });
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 72) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const validateStep = (s: LeadStep): Errors => {
    const next: Errors = {};
    const str = (key: string) => String(values[key] ?? '').trim();

    if (s.kind === 'choice' && !str(s.id)) next[s.id] = 'Please choose an option.';
    if (s.kind === 'select' && !str(s.id))
      next[s.id] = values[otherKey(s.id)] ? 'Please type the area.' : 'Please choose an area.';
    if (s.kind === 'text' && !s.optional && !str(s.id)) next[s.id] = 'Please fill in this field.';

    if (s.kind === 'contact') {
      if (!str('name')) next.name = 'Please enter your name.';

      const phoneMsg = phoneError(String(values.dialCode ?? DEFAULT_DIAL), str('phone'));
      if (phoneMsg) next.phone = phoneMsg;

      if (s.message && !s.message.optional && !str('message'))
        next.message = 'Please add a short message.';

      if (!str('email')) next.email = 'Please enter your email address.';
      else if (!EMAIL_PATTERN.test(str('email'))) next.email = 'Please enter a valid email address.';
    }
    return next;
  };

  const submitLead = async () => {
    const dial = String(values.dialCode ?? DEFAULT_DIAL);
    const payload: Record<string, string | boolean> = {
      form: config.formId,
      ...context,
      submittedAt: new Date().toISOString(),
      page: window.location.pathname,
    };

    for (const s of steps) {
      if (s.kind === 'contact') {
        payload.name = String(values.name).trim();
        payload.phone = normalisePhone(dial, String(values.phone)) ?? '';
        payload.email = String(values.email).trim();
        if (s.message) payload.message = String(values.message ?? '').trim();
        if (s.checkbox) payload[s.checkbox.id] = values[s.checkbox.id] === true;
      } else {
        payload[s.id] = String(values[s.id] ?? '').trim();
      }
    }

    if (!(await send(payload))) return;
    focusPending.current = true;
    setSent(true);
  };

  /* Enter on any field lands here: advance, or submit on the final step. */
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateStep(step);
    setErrors(found);

    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`${uid}-${firstInvalid}`)?.focus();
      return;
    }
    if (isLast) submitLead();
    else goTo(stepIndex + 1);
  };

  const choose = (s: LeadStep, value: string) => {
    setValue(s.id, value);
    if (isLast) return;
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => goTo(stepIndex + 1), ADVANCE_DELAY);
  };

  const reset = () => {
    setValues(INITIAL);
    setErrors({});
    setDirection(1);
    setStepIndex(0);
    focusPending.current = true;
    setSent(false);
  };

  const errorText = (key: string) =>
    errors[key] ? (
      <p id={`${uid}-${key}-error`} role="alert" className="mt-3 text-xs text-orange-600">
        {errors[key]}
      </p>
    ) : null;

  const describedBy = (key: string) => (errors[key] ? `${uid}-${key}-error` : undefined);

  const headingId = `${uid}-question`;
  const distance = reduce ? 0 : 36;
  const stepVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * distance }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -distance }),
  };

  /* ------------------------------------------------------------------------ */
  /*  Step bodies                                                             */
  /* ------------------------------------------------------------------------ */

  const renderStep = (s: LeadStep) => {
    switch (s.kind) {
      case 'choice':
        return (
          <>
            <div
              role="group"
              aria-labelledby={headingId}
              aria-describedby={describedBy(s.id)}
              className={`grid grid-cols-1 gap-3 ${
                density === 'regular' ? choiceColumns[s.columns ?? 2] : 'sm:grid-cols-2'
              }`}
            >
              {s.options.map((o, i) => {
                const selected = values[s.id] === o.value;
                return (
                  <button
                    key={o.value}
                    id={i === 0 ? `${uid}-${s.id}` : undefined}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => choose(s, o.value)}
                    className={`group flex min-h-[64px] w-full items-center justify-between gap-4 rounded-md border px-5 py-4 text-left transition-[border-color,background-color,box-shadow] duration-300 ease-premium sm:min-h-[76px] sm:px-6 ${
                      selected
                        ? 'border-orange bg-orange-50 shadow-[inset_0_0_0_0.5px_#f47b49]'
                        : 'border-line bg-white hover:border-charcoal/30 hover:bg-cream/60'
                    }`}
                  >
                    <span className="text-base font-light text-charcoal sm:text-[17px]">
                      {o.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                        selected
                          ? 'border-orange bg-orange text-white'
                          : 'border-line text-transparent group-hover:border-charcoal/30'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                  </button>
                );
              })}
            </div>
            {errorText(s.id)}
          </>
        );

      case 'select':
        return (
          <>
            <AreaSelect
              inputId={`${uid}-${s.id}`}
              labelledBy={headingId}
              describedBy={describedBy(s.id)}
              invalid={!!errors[s.id]}
              options={s.options}
              placeholder={s.placeholder}
              otherPlaceholder={s.otherPlaceholder}
              other={values[otherKey(s.id)] === true}
              value={String(values[s.id] ?? '')}
              onPick={(v) => {
                setValue(otherKey(s.id), false);
                setValue(s.id, v);
              }}
              onOther={() => {
                setValue(otherKey(s.id), true);
                setValue(s.id, '');
              }}
              onType={(v) => setValue(s.id, v)}
            />
            {errorText(s.id)}
          </>
        );

      case 'text':
        return (
          <>
            <input
              id={`${uid}-${s.id}`}
              name={s.id}
              type="text"
              autoComplete="off"
              aria-labelledby={headingId}
              aria-describedby={describedBy(s.id)}
              aria-invalid={!!errors[s.id]}
              placeholder={s.placeholder}
              value={String(values[s.id] ?? '')}
              onChange={(e) => setValue(s.id, e.target.value)}
              className={`w-full border-0 border-b bg-transparent pb-3 pt-2 text-lg font-light text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal-muted/60 focus:border-orange ${
                errors[s.id] ? 'border-orange' : 'border-line'
              }`}
            />
            {errorText(s.id)}
          </>
        );

      case 'contact':
        return (
          <div className="space-y-9">
            {/* Name */}
            <div className="relative">
              <input
                id={`${uid}-name`}
                name="name"
                type="text"
                autoComplete="name"
                placeholder=" "
                value={String(values.name ?? '')}
                onChange={(e) => setValue('name', e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={describedBy('name')}
                className={`${inputBase} ${errors.name ? 'border-orange' : ''}`}
              />
              <label htmlFor={`${uid}-name`} className={labelBase}>
                Name
              </label>
              {errorText('name')}
            </div>

            <div className={`grid grid-cols-1 gap-9 ${density === 'compact' ? '' : 'sm:grid-cols-2'}`}>
              <PhoneField
                id={`${uid}-phone`}
                dial={String(values.dialCode ?? DEFAULT_DIAL)}
                onDialChange={(v) => setValue('dialCode', v)}
                value={String(values.phone ?? '')}
                onChange={(v) => setValue('phone', v)}
                error={errors.phone}
                errorId={`${uid}-phone-error`}
              />

              {/* Email */}
              <div className="relative">
                <input
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder=" "
                  value={String(values.email ?? '')}
                  onChange={(e) => setValue('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={describedBy('email')}
                  className={`${inputBase} ${errors.email ? 'border-orange' : ''}`}
                />
                <label htmlFor={`${uid}-email`} className={labelBase}>
                  Email
                </label>
                {errorText('email')}
              </div>
            </div>

            {s.message ? (
              <div className="relative">
                <textarea
                  id={`${uid}-message`}
                  name="message"
                  rows={3}
                  placeholder=" "
                  value={String(values.message ?? '')}
                  onChange={(e) => setValue('message', e.target.value)}
                  aria-invalid={!!errors.message}
                  aria-describedby={describedBy('message')}
                  className={`${inputBase} resize-none ${errors.message ? 'border-orange' : ''}`}
                />
                <label htmlFor={`${uid}-message`} className={labelBase}>
                  {s.message.label}
                  {s.message.optional ? ' (optional)' : ''}
                </label>
                {errorText('message')}
              </div>
            ) : null}

            {s.checkbox ? (
              <label className="flex cursor-pointer items-start gap-4 py-1">
                <input
                  type="checkbox"
                  name={s.checkbox.id}
                  checked={values[s.checkbox.id] === true}
                  onChange={(e) => setValue(s.checkbox!.id, e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded border border-charcoal/30 bg-white text-transparent transition-colors duration-300 peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="text-[15px] font-light leading-relaxed text-charcoal">
                  {s.checkbox.label}
                </span>
              </label>
            ) : null}
          </div>
        );
    }
  };

  /* ------------------------------------------------------------------------ */
  /*  Layout                                                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      ref={cardRef}
      className={`scroll-mt-24 bg-white px-5 py-8 shadow-[0_24px_70px_-30px_rgba(26,26,26,0.18)] sm:px-10 sm:py-12 lg:px-14 lg:py-14 ${className}`}
    >
      {/* ---------- Progress (hidden on single-step forms) ---------- */}
      <div className={`flex items-baseline justify-between gap-4 ${single ? 'hidden' : ''}`}>
        <p className="eyebrow text-orange">
          {sent ? 'Complete' : `Step ${stepIndex + 1} of ${steps.length}`}
        </p>
        {!sent ? (
          <p className="truncate text-[10px] uppercase tracking-eyebrow text-charcoal-muted sm:text-[11px]">
            {step.label}
          </p>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-label="Form progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className={`mt-4 h-[2px] w-full overflow-hidden bg-line ${single ? 'hidden' : ''}`}
      >
        <div
          className="h-full origin-left bg-orange transition-transform duration-700 ease-premium"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <SuccessState
            key="success"
            title={config.successTitle}
            body={config.successBody}
            headingRef={headingRef}
            onReset={reset}
          />
        ) : (
          <motion.form
            key="form"
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            onSubmit={onSubmit}
            noValidate
            aria-labelledby={headingId}
            className="overflow-x-clip"
          >
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={step.id}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={single ? '' : 'pt-10 sm:pt-12'}
              >
                <h2
                  id={headingId}
                  ref={headingRef}
                  tabIndex={-1}
                  className="heading-display text-[clamp(1.75rem,3.4vw,2.6rem)] text-charcoal outline-none"
                >
                  {step.question}
                </h2>
                {step.helper ? (
                  <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-charcoal-muted">
                    {step.helper}
                  </p>
                ) : null}

                <div className="mt-8 sm:mt-10">{renderStep(step)}</div>
              </motion.div>
            </AnimatePresence>

            {failed ? (
              <div className="mt-8">
                <SendError />
              </div>
            ) : null}

            {/* ---------- Back / Skip / Next ---------- */}
            <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6 sm:mt-12">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={() => goTo(stepIndex - 1)}
                  className="group -ml-1 inline-flex h-12 items-center gap-2 px-1 text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted transition-colors duration-300 hover:text-charcoal"
                >
                  <ArrowLeft
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-x-1"
                  />
                  Back
                </button>
              ) : (
                <span aria-hidden="true" />
              )}

              <div className="flex items-center gap-5 sm:gap-7">
                {step.kind === 'text' && step.optional ? (
                  <button
                    type="button"
                    onClick={() => {
                      setValue(step.id, '');
                      goTo(stepIndex + 1);
                    }}
                    className="link-underline h-12 text-[11px] font-medium text-charcoal-muted transition-colors duration-300 hover:text-charcoal"
                  >
                    Skip
                  </button>
                ) : null}
                <button
                  type="submit"
                  disabled={sending}
                  className="group inline-flex h-12 items-center gap-3 whitespace-nowrap bg-orange px-6 text-[11px] font-medium uppercase tracking-eyebrow text-white transition-colors duration-300 hover:bg-orange-600 disabled:cursor-wait disabled:opacity-70 sm:h-14 sm:px-9"
                >
                  {isLast ? (sending ? 'Sending…' : config.submitLabel) : 'Next'}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-500 ease-premium group-hover:translate-x-1.5"
                  >
                    &rarr;
                  </span>
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dropdown with "Other"                                                     */
/* -------------------------------------------------------------------------- */

const OTHER = 'Other';

type AreaSelectProps = {
  inputId: string;
  labelledBy: string;
  describedBy?: string;
  invalid: boolean;
  options: string[];
  placeholder: string;
  otherPlaceholder: string;
  other: boolean;
  value: string;
  onPick: (value: string) => void;
  onOther: () => void;
  onType: (value: string) => void;
};

/**
 * A native dropdown (so phones show their own picker) with an "Other" at the
 * end. Choosing it opens a text field to type an area that is not in the list.
 */
function AreaSelect({
  inputId,
  labelledBy,
  describedBy,
  invalid,
  options,
  placeholder,
  otherPlaceholder,
  other,
  value,
  onPick,
  onOther,
  onType,
}: AreaSelectProps) {
  const typeRef = useRef<HTMLInputElement>(null);
  const underline = `border-b transition-colors duration-300 focus-within:border-orange ${
    invalid ? 'border-orange' : 'border-line'
  }`;

  return (
    <div className="space-y-6">
      <div className={`relative flex items-center ${underline}`}>
        <select
          id={inputId}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-invalid={invalid && !other}
          value={other ? OTHER : value}
          onChange={(e) => {
            if (e.target.value === OTHER) {
              onOther();
              /* The field mounts on the next render */
              window.setTimeout(() => typeRef.current?.focus(), 0);
            } else onPick(e.target.value);
          }}
          className={`w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent pb-3 pt-2 pr-8 text-lg font-light outline-none focus-visible:outline-none ${
            value || other ? 'text-charcoal' : 'text-charcoal-muted/60'
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value={OTHER}>{OTHER}</option>
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className="pointer-events-none absolute right-0 h-5 w-5 text-charcoal-muted"
        />
      </div>

      {other ? (
        <div className={underline}>
          <input
            ref={typeRef}
            type="text"
            autoComplete="off"
            aria-label={otherPlaceholder}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            placeholder={otherPlaceholder}
            value={value}
            onChange={(e) => onType(e.target.value)}
            className="w-full min-w-0 border-0 bg-transparent pb-3 pt-2 text-lg font-light text-charcoal outline-none placeholder:text-charcoal-muted/60 focus-visible:outline-none"
          />
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Success                                                                   */
/* -------------------------------------------------------------------------- */

/** Animated check, title and body shown after a form is sent. Shared with other forms. */
export function SuccessState({
  title,
  body,
  headingRef,
  onReset,
  resetLabel = 'Start a new enquiry',
}: {
  title: string;
  body: string;
  headingRef: (el: HTMLHeadingElement | null) => void;
  onReset: () => void;
  resetLabel?: string;
}) {
  const reduce = useReducedMotion();
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 0.7, delay, ease: [0.65, 0, 0.35, 1] as const },
        };
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.3 }}
      role="status"
      aria-live="polite"
      className="py-10 sm:py-14"
    >
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-16 w-16 text-orange sm:h-[72px] sm:w-[72px]">
        <motion.circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.1)}
        />
        <motion.path
          d="M20 33 l8 8 l16 -18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...draw(0.6)}
        />
      </svg>

      <motion.h2
        ref={headingRef}
        tabIndex={-1}
        {...rise(0.75)}
        className="heading-display mt-8 text-[clamp(2rem,4vw,3rem)] text-charcoal outline-none"
      >
        {title}
      </motion.h2>
      <motion.p
        {...rise(0.85)}
        className="mt-4 max-w-md text-[15px] font-light leading-relaxed text-charcoal-muted sm:text-base"
      >
        {body}
      </motion.p>

      <motion.div {...rise(0.95)} className="mt-10 border-t border-line pt-6">
        <button
          type="button"
          onClick={onReset}
          className="link-underline group text-[11px] font-medium text-charcoal"
        >
          {resetLabel}
          <span
            aria-hidden="true"
            className="transition-[transform,color] duration-500 ease-premium group-hover:translate-x-1.5 group-hover:text-orange"
          >
            &rarr;
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
}
