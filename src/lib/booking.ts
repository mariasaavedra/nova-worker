export const BOOKING_URL = 'https://us2.cloudbeds.com/en/reservation/PtD8BD/';
export const CURRENCY = 'usd';
export const MAX_GUESTS = 20;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Formats a Date using its local calendar fields (no UTC conversion). */
export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Strictly parses YYYY-MM-DD into a local-midnight Date, or null if invalid. */
export function parseISODate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(y, m - 1, d);
  const valid =
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return valid ? date : null;
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function today(): string {
  return toISODate(new Date());
}

export interface BookingInput {
  checkin: string;
  checkout: string;
  guests: string;
}

export type BookingErrors = Partial<Record<keyof BookingInput, string>>;

export function validate(input: BookingInput, now: string = today()): BookingErrors {
  const errors: BookingErrors = {};

  const checkin = parseISODate(input.checkin);
  const checkout = parseISODate(input.checkout);

  if (!checkin) errors.checkin = 'Choose a check-in date.';
  else if (input.checkin < now) errors.checkin = 'Check-in cannot be in the past.';

  if (!checkout) errors.checkout = 'Choose a check-out date.';
  else if (checkin && input.checkout <= input.checkin) {
    errors.checkout = 'Check-out must be after check-in.';
  }

  const guests = Number(input.guests);
  if (!/^\d+$/.test(input.guests.trim()) || guests < 1) {
    errors.guests = 'Enter a whole number of guests (1 or more).';
  } else if (guests > MAX_GUESTS) {
    errors.guests = `For more than ${MAX_GUESTS} guests, please contact us.`;
  }

  return errors;
}

export function buildBookingUrl(input: BookingInput): string {
  const url = new URL(BOOKING_URL);
  url.searchParams.set('currency', CURRENCY);
  url.searchParams.set('checkin', input.checkin);
  url.searchParams.set('checkout', input.checkout);
  url.searchParams.set('guests', String(Number(input.guests)));
  return url.toString();
}
