import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import type { Range } from '../utils/ranges';
import { clamp } from '../utils/ranges';

interface CounterProps {
  label: string;
  text: ReactNode;
  onLess: () => void;
  onMore: () => void;
  lessLabel: string;
  moreLabel: string;
  lessDisabled?: boolean;
  moreDisabled?: boolean;
}

/** − value + for whole steps (pizzas, sizes). */
export function Counter({ label, text, onLess, onMore, lessLabel, moreLabel, lessDisabled, moreDisabled }: CounterProps) {
  const id = useId();
  return (
    <div className="field">
      <span className="field-label" id={id}>{label}</span>
      <div className="counter" role="group" aria-labelledby={id}>
        <button type="button" onClick={onLess} disabled={lessDisabled} aria-label={lessLabel}>−</button>
        <output className="num" aria-live="polite">{text}</output>
        <button type="button" onClick={onMore} disabled={moreDisabled} aria-label={moreLabel}>+</button>
      </div>
    </div>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  range: Range;
  onChange: (value: number) => void;
  /** What the value means, shown beside the label: "2.8% · 13 g". */
  valueText: ReactNode;
  ends?: [string, string];
  note?: ReactNode;
}

export function RangeField({ label, value, range: [min, max, step], onChange, valueText, ends, note }: RangeFieldProps) {
  const id = useId();
  const shown = clamp(value, min, max);
  return (
    <div className="field">
      <div className="field-top">
        <label className="field-label" htmlFor={id}>{label}</label>
        <output className="field-value num" htmlFor={id}>{valueText}</output>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={shown}
        // Snap to the step and trim float noise (0.30000000000000004).
        onChange={(e) => onChange(+clamp(Math.round(+e.target.value / step) * step, min, max).toFixed(2))}
        style={{ '--p': `${((shown - min) / (max - min)) * 100}%` } as CSSProperties}
      />
      {ends && <div className="range-ends"><span>{ends[0]}</span><span>{ends[1]}</span></div>}
      {note && <p className="field-note">{note}</p>}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div className="field">
      <span className="field-label" id={id}>{label}</span>
      <div className="seg" role="group" aria-labelledby={id}>
        {options.map((o) => (
          <button type="button" key={o.value} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DisclosureProps {
  title: string;
  subtitle?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** A section that folds. Built from a button and a panel (not <details>) so the height can animate in every browser. */
export function Disclosure({ title, subtitle, defaultOpen = false, children }: DisclosureProps) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="disc" data-open={open}>
      <h3 className="disc-head">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          <span className="disc-text">
            <span className="disc-title">{title}</span>
            {subtitle && <span className="disc-sub">{subtitle}</span>}
          </span>
          <span className="disc-icon" aria-hidden="true" />
        </button>
      </h3>
      <div className="disc-panel" id={id}>
        <div className="disc-inner">{children}</div>
      </div>
    </section>
  );
}
