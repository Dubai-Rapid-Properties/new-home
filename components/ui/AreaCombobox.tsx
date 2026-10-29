'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
};

/**
 * A field to type an area in, with the whole list to pick from as it opens and
 * the matching areas as you type. An area that is not on the list is kept as typed.
 */
export default function AreaCombobox({ id, value, onChange, options, placeholder, labelledBy, describedBy, invalid }: Props) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    // A picked area shows the whole list again, to change it.
    if (!q || options.some((o) => o.toLowerCase() === q)) return options;
    const hits = options.filter((o) => o.toLowerCase().includes(q));
    return [...hits.filter((o) => o.toLowerCase().startsWith(q)), ...hits.filter((o) => !o.toLowerCase().startsWith(q))];
  }, [value, options]);

  const pick = (area: string) => {
    onChange(area);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div
      className={`relative border-b transition-colors duration-300 focus-within:border-orange ${
        invalid ? 'border-orange' : 'border-line'
      }`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <div className="flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          placeholder={placeholder}
          value={value}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setOpen(true);
              const step = e.key === 'ArrowDown' ? 1 : -1;
              setActive((i) => Math.max(0, Math.min(matches.length - 1, i + step)));
            } else if (e.key === 'Enter' && open && active >= 0 && matches[active]) {
              e.preventDefault();
              pick(matches[active]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="w-full min-w-0 border-0 bg-transparent pb-3 pt-2 pr-8 text-lg font-light text-charcoal outline-none placeholder:text-charcoal-muted/60 focus-visible:outline-none"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? 'Close the list of areas' : 'Show all areas'}
          onClick={() => {
            setOpen((o) => !o);
            inputRef.current?.focus();
          }}
          className="absolute right-0 flex h-10 w-8 items-center justify-end text-charcoal-muted"
        >
          <ChevronDown aria-hidden="true" strokeWidth={1.5} className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Areas"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto border border-line bg-white py-1 shadow-lg"
        >
          {matches.map((area, i) => (
            <li
              key={area}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={area === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(area)}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-4 py-2.5 text-[15px] ${i === active ? 'bg-cream text-charcoal' : 'text-charcoal'} ${
                area === value ? 'font-medium' : 'font-light'
              }`}
            >
              {area}
            </li>
          ))}
          {!matches.length ? (
            <li role="presentation" className="px-4 py-2.5 text-[14px] font-light text-charcoal-muted">
              Not on the list: we&rsquo;ll use &ldquo;{value.trim()}&rdquo;.
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
