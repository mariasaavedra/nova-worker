# Nova booking widget

Self-contained React sidebar that collects check-in, check-out and guests, then opens the Cloudbeds booking page in a new tab. Static, frontend-only.

## Develop

```
npm install
npm run dev        # harness at src/index.html using live source
npm run build      # typecheck + emit dist/widget.js
npm run preview    # harness against the built dist/widget.js
```

The harness has hostile global CSS (to prove Shadow DOM isolation), a "Load script again" button and an "Open/close x50" button; the host-element counter must stay at 1.

## Embed

```html
<script src="https://YOUR-PAGES-DOMAIN/widget.js"></script>
```

Then wire the existing Book Now button to `NovaBooking.open()` instead of `window.open(...)`. Make sure the handler also calls `preventDefault()` if the button is a link or inside a form.

API: `NovaBooking.open()`, `NovaBooking.close()`, `NovaBooking.destroy()`.

## Booking URL

`https://us2.cloudbeds.com/en/reservation/PtD8BD/?currency=usd&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&guests=N`

Constants live in `src/lib/booking.ts`.

## Deploy

Upload `dist/widget.js` to Cloudflare Pages (or any static host).

## Manual test checklist

- Drawer opens/closes via button, Escape, backdrop and × ; focus returns to Book Now
- Tab/Shift+Tab stay inside the drawer; page doesn't scroll behind it
- Past check-in, check-out <= check-in, and guests of 0/blank/1.5 block Search with messages
- Valid input: Search opens Cloudbeds in a new tab with the right parameters (confirm Cloudbeds honors them)
- Mobile width: drawer is full-width
