# Checks, Captures, Threats: handoff brief

A chess trainer for one user (Deola): 18 lessons, 12 puzzles, and a sparring bot with a pre-move blunder check. It was built and hosted as a Claude artifact. **The goal now is to host it independently so it installs on his iPhone from the home screen, with no Claude involved.**

## The job

1. Put `site/` on any static HTTPS host. GitHub Pages is the default suggestion (free, and he already uses GitHub); Netlify, Vercel or Cloudflare Pages work the same. No build step: deploy the folder as it is.
2. Confirm it installs: on the iPhone open the URL in **Safari**, Share, Add to Home Screen. It should open full screen with the knight icon, and still open with the phone in aeroplane mode.
3. Hand him the URL and those three install steps. That is done.

Ask him which host and whether the repo should be public or private before creating anything. If a custom path is wanted (for example under deoladaramola.com), all paths in `site/` are relative, so a subfolder works.

## What is already done

- PWA pieces are in place: `site/manifest.webmanifest`, `site/sw.js` (offline cache), icons in `site/icons/`, iOS meta tags and safe-area padding in `site/index.html`.
- Service worker registers only on HTTPS or localhost.
- The Claude account sync in `app.js` (`initRemote`) does nothing when `window.claude` is absent. Progress then saves to `localStorage` only and the footer reads "Progress is saved in this browser."
- Tests pass (`npm test`).

## Not yet verified

- **Install and offline on a real iPhone.** Checked only in desktop Chrome against localhost. This is the first thing to confirm after deploying.
- Google Fonts load from the network on first launch and are cached by the service worker after that. On a first launch with no signal the page falls back to system fonts. If he wants it fully self-contained, download the three families into `site/fonts/` and replace the `<link>` in `index.html` with `@font-face` rules.

## Layout

```
site/            everything that gets deployed
  index.html     markup, all CSS, the "Club" piece symbols
  app.js         interface: routing, board, lesson and puzzle runner, play mode, saving
  engine.js      search and evaluation for the bot and coach (own 0x88 engine)
  content.js     lessons, puzzles, drill positions
  pieces.js      the other piece sets; "pebble" is the active default
  chess.js       chess.js 0.10.3 (BSD licence, keep the header): rules and notation for the UI
  sw.js, manifest.webmanifest, icons/
tools/
  test.js        checks every lesson and puzzle move is legal and is the engine's choice
  perft.js       checks engine move generation against known perft counts
```

Plain scripts, no framework, no bundler, no dependencies at runtime.

## Run and test

```
npm start        # serves site/ on http://localhost:8080
npm test         # content checks + perft; expect "ALL OK" and five "ok" lines
```

## Rules for changes

- **Bump `CACHE` in `site/sw.js` on every deploy** (`cct-v1` to `cct-v2`, and so on). Without it an installed copy keeps serving the old files.
- Any edit to `content.js` must pass `npm test`. Positions are FEN, moves are SAN; `'#'` in `solve` means any checkmate.
- `chess.js` is slow for search, which is why `engine.js` has its own move generator. Do not route the bot through chess.js.
- Saved progress lives under the `localStorage` key `cct-progress-v1`. Keep that key and shape, or his progress is wiped.
- The layout must never exceed the viewport width (an earlier bug let the move list widen the page and stretch the board). `.stage` uses `minmax(0,1fr)` for this; keep it.
- He chooses designs from samples before anything is built. Show options first for any visual change.

## Things he should know

- Progress does not carry over from the Claude-hosted version, and an installed iPhone app keeps its own storage separate from Safari. He starts at zero on the installed copy.
- iOS can clear a home-screen app's storage if it goes unused for weeks. If losing progress matters, the next step is an export and import button, or a small sync backend.

## Possible next steps (not requested yet)

- Darker or wood board option to match the Pebble pieces.
- Remove the unused piece sets and the picker if he settles on Pebble.
- Drag-to-move in addition to tap-tap.
