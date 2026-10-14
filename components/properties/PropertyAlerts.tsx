'use client';

import { useId, useState } from 'react';
import { areas } from '@/data/areas';
import { useEnquiry } from '@/lib/enquiry';
import SendError from '../ui/SendError';
import { EMAIL_PATTERN, inputBase, labelBase } from '../ui/formStyles';

const selectBase =
  'w-full appearance-none border-0 border-b border-line bg-transparent pb-2.5 pt-6 text-[15px] font-light text-charcoal outline-none focus:border-orange';
const selectLabel = 'absolute left-0 top-0 text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted';

/**
 * "Tell me when it comes up": the visitor's criteria go to the office, and a
 * DRP specialist sends matching homes as they come in, before the portals.
 */
export default function PropertyAlerts() {
  const uid = useId();
  const { sending, failed, send } = useEnquiry();
  const [offering, setOffering] = useState<'Buy' | 'Rent'>('Buy');
  const [values, setValues] = useState({ name: '', email: '', area: 'Anywhere in Dubai', beds: 'Any', budget: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      ...(values.name.trim() ? {} : { name: 'Please enter your name.' }),
      ...(EMAIL_PATTERN.test(values.email.trim()) ? {} : { email: 'Please enter a valid email address.' }),
    };
    setErrors(next);
    if (Object.keys(next).length) return;
    const ok = await send({
      form: 'property-alert',
      name: values.name.trim(),
      email: values.email.trim(),
      lookingTo: offering,
      area: values.area,
      bedrooms: values.beds,
      budget: values.budget.trim() || 'Not given',
    });
    if (ok) setDone(true);
  };

  return (
    <section aria-labelledby="alerts-heading" className="section-y bg-white">
      <div className="container-drp grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow text-orange">Property Alerts</p>
          <h2 id="alerts-heading" className="heading-display mt-4 text-[clamp(2rem,4vw,3rem)] text-charcoal">
            Hear about new homes first
          </h2>
          <p className="mt-5 max-w-md font-light leading-relaxed text-charcoal-muted">
            Tell us what you are looking for. A D|R|P specialist sends you matching homes as they come in, often before
            they reach the portals.
          </p>
        </div>

        <div className="lg:col-span-7">
          {done ? (
            <div role="status" className="bg-cream p-8 sm:p-10">
              <p className="font-serif text-2xl text-charcoal">Thank you, {values.name.split(' ')[0]}.</p>
              <p className="mt-3 font-light text-charcoal-muted">
                We will email you homes that match, starting with what we have now.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-8">
              <div className="flex gap-2" role="group" aria-label="Looking to">
                {(['Buy', 'Rent'] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={offering === o}
                    onClick={() => setOffering(o)}
                    className={`h-11 border px-6 text-[12px] transition-colors duration-300 ${
                      offering === o ? 'border-charcoal bg-charcoal text-white' : 'border-line text-charcoal hover:border-charcoal'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div className="relative">
                  <select id={`${uid}-area`} value={values.area} onChange={set('area')} className={selectBase}>
                    <option>Anywhere in Dubai</option>
                    {areas.map((a) => (
                      <option key={a.slug}>{a.name}</option>
                    ))}
                  </select>
                  <label htmlFor={`${uid}-area`} className={selectLabel}>Area</label>
                </div>
                <div className="relative">
                  <select id={`${uid}-beds`} value={values.beds} onChange={set('beds')} className={selectBase}>
                    {['Any', 'Studio', '1', '2', '3', '4', '5+'].map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                  <label htmlFor={`${uid}-beds`} className={selectLabel}>Bedrooms</label>
                </div>
                <div className="relative">
                  <input id={`${uid}-budget`} value={values.budget} onChange={set('budget')} placeholder=" " className={inputBase} />
                  <label htmlFor={`${uid}-budget`} className={labelBase}>
                    {offering === 'Rent' ? 'Budget / year (AED)' : 'Budget (AED)'}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="relative">
                  <input
                    id={`${uid}-name`}
                    autoComplete="name"
                    value={values.name}
                    onChange={set('name')}
                    placeholder=" "
                    aria-invalid={Boolean(errors.name)}
                    className={`${inputBase} ${errors.name ? 'border-orange' : ''}`}
                  />
                  <label htmlFor={`${uid}-name`} className={labelBase}>Name</label>
                  {errors.name ? <p className="mt-2 text-xs text-orange-600">{errors.name}</p> : null}
                </div>
                <div className="relative">
                  <input
                    id={`${uid}-email`}
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={set('email')}
                    placeholder=" "
                    aria-invalid={Boolean(errors.email)}
                    className={`${inputBase} ${errors.email ? 'border-orange' : ''}`}
                  />
                  <label htmlFor={`${uid}-email`} className={labelBase}>Email</label>
                  {errors.email ? <p className="mt-2 text-xs text-orange-600">{errors.email}</p> : null}
                </div>
              </div>

              {failed ? <SendError /> : null}

              <button
                type="submit"
                disabled={sending}
                className="h-12 bg-charcoal px-8 text-[11px] font-medium uppercase tracking-eyebrow text-white transition-colors duration-300 hover:bg-orange disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send me matching homes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
