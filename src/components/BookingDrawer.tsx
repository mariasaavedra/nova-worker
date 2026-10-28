import { useMemo, useRef, useState } from 'react';
import {
  addDays,
  buildBookingUrl,
  MAX_GUESTS,
  today,
  validate,
  type BookingInput,
} from '../lib/booking';
import { useDrawerBehavior } from '../hooks/useDrawerBehavior';

interface Props {
  open: boolean;
  onClose: () => void;
  /** The shadow root, needed to resolve focus inside the shadow tree. */
  root: ShadowRoot;
}

export function BookingDrawer({ open, onClose, root }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<BookingInput>({ checkin: '', checkout: '', guests: '2' });
  const [showErrors, setShowErrors] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;
  const minCheckin = today();
  const minCheckout = form.checkin ? addDays(form.checkin, 1) : addDays(minCheckin, 1);

  useDrawerBehavior(open, panelRef, root, onClose);

  const setCheckin = (checkin: string) =>
    setForm((f) => ({
      ...f,
      checkin,
      checkout: checkin && f.checkout <= checkin ? addDays(checkin, 1) : f.checkout,
    }));

  const shown = showErrors ? errors : {};

  return (
    <div className="nb-root" hidden={!open}>
      <div className="nb-backdrop" onClick={onClose} />
      <div
        className="nb-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nb-title"
      >
        <header className="nb-header">
          <h2 id="nb-title">Book your stay</h2>
          <button type="button" className="nb-close" aria-label="Close booking panel" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="nb-form" noValidate onSubmit={(e) => e.preventDefault()}>
          <Field label="Check-in" error={shown.checkin} id="nb-checkin">
            <input
              id="nb-checkin"
              type="date"
              min={minCheckin}
              value={form.checkin}
              aria-invalid={!!shown.checkin}
              onChange={(e) => setCheckin(e.target.value)}
            />
          </Field>
          <Field label="Check-out" error={shown.checkout} id="nb-checkout">
            <input
              id="nb-checkout"
              type="date"
              min={minCheckout}
              value={form.checkout}
              aria-invalid={!!shown.checkout}
              onChange={(e) => setForm((f) => ({ ...f, checkout: e.target.value }))}
            />
          </Field>
          <Field label="Guests" error={shown.guests} id="nb-guests">
            <input
              id="nb-guests"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_GUESTS}
              step={1}
              value={form.guests}
              aria-invalid={!!shown.guests}
              onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))}
            />
          </Field>

          {isValid ? (
            <a
              className="nb-search"
              href={buildBookingUrl(form)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Search availability
            </a>
          ) : (
            <button type="button" className="nb-search" onClick={() => setShowErrors(true)}>
              Search availability
            </button>
          )}
          <p className="nb-note">You’ll see rooms and prices on our secure booking page.</p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="nb-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p className="nb-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
