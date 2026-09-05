# Logo assets

The official Smart Bionote Reader logo, uploaded during Phase 3.

- `smart-bionote-reader-original.png` — the source file as supplied, untouched.
- `smart-bionote-reader-logo.png` — full lockup (icon + wordmark + slogan), trimmed. Used for marketing/large-format contexts with a plain background.
- `smart-bionote-reader-icon.png` — icon-only mark (cropped from the original, no text), used by `components/ui/Logo.jsx` for the navbar, sidebar, splash screen, and footer. This is also the source for every generated file in `frontend/public/icons/` (favicon, PWA icons, apple touch icon).

The icon crop and resized app icons were generated once via a script (sharp) and committed as static files — there's no build-time image pipeline. Regenerate them the same way if the source logo ever changes.
