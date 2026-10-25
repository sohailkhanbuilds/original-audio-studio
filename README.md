# Original Audio Studio

A browser-based procedural game-music prototype. It creates original note patterns and synthesized tones with the Web Audio API; it does not load existing songs or recordings.

## Project structure

- `index.html` — page structure and controls
- `style.css` — responsive interface
- `js/app.js` — genre controls, playback and WAV export UI
- `js/music-engine.js` — seeded procedural composition, motifs, chord movement, genre-specific rhythm, synthesis and WAV rendering

## Run it

Because the JavaScript uses ES modules, use a local static server rather than opening the HTML directly from a `file://` URL.

For example, if Python is installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in Chrome. Choose a genre, instruments, mood, tempo and duration; click **Generate original music**, then **Play** or **Export WAV**.

No build step, API key, or paid service is required.

## Current limits

- This is a procedural prototype, not a trained AI music model.
- Instrument sounds are synthesized approximations, not realistic recorded instrument libraries.
- The engine now uses a fresh seed per generation, a recurring motif with variations, genre-specific scales/progressions, changing section density and different percussion patterns. These changes increase variation but do not guarantee every track will sound professional or completely unlike every other track.
- Generated music does not guarantee legal exclusivity or zero similarity risk.
- Next steps: improve musical phrasing and transitions, richer sound synthesis/sample options, longer compositions, saveable project settings, loop-safe game music and dedicated sound-effects generation.

## Deploy with GitHub Pages

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch `main` and folder `/(root)`, then save.
