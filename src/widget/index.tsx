import { createRoot, type Root } from 'react-dom/client';
import { BookingDrawer } from '../components/BookingDrawer';
import css from '../styles/styles.css?inline';

const HOST_ATTR = 'data-nova-booking';

interface NovaBookingApi {
  open(): void;
  close(): void;
  destroy(): void;
}

declare global {
  interface Window {
    NovaBooking?: NovaBookingApi;
  }
}

let host: HTMLElement | null = null;
let root: Root | null = null;
let shadow: ShadowRoot | null = null;
let isOpen = false;

function render() {
  if (!root || !shadow) return;
  root.render(<BookingDrawer open={isOpen} onClose={close} root={shadow} />);
}

// @font-face inside a shadow root is unreliable, so the font is loaded by a
// <link> in the host page's <head>; the shadow tree then resolves it by name.
const FONT_LINK_ID = 'nova-booking-fonts';

function loadFonts() {
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap';
  document.head.appendChild(link);
}

function mount() {
  if (host) return;
  loadFonts();
  host = document.createElement('div');
  host.setAttribute(HOST_ATTR, '');
  // Zero-size fixed host so it never takes part in the page's layout. The
  // z-index must live on the host: z-index inside the shadow root can't lift
  // it above the host page's own stacking contexts (e.g. a sticky nav).
  host.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;';
  shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = css;
  const mountPoint = document.createElement('div');
  shadow.append(style, mountPoint);
  document.body.appendChild(host);
  root = createRoot(mountPoint);
  render();
}

function open() {
  mount();
  isOpen = true;
  render();
}

function close() {
  isOpen = false;
  render();
}

function destroy() {
  root?.unmount();
  host?.remove();
  host = root = shadow = null;
  isOpen = false;
}

// Idempotent: a second load of the script leaves the first instance in place.
if (!window.NovaBooking) {
  window.NovaBooking = { open, close, destroy };
  const init = () => mount();
  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init, { once: true });
}
