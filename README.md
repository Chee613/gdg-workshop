# GDG Workshops

Slides and materials from workshops run with GDG on Campus Universiti Malaya. Each workshop lives in its own folder, and every folder is published to GitHub Pages at its own address.

**All slides:** https://chee613.github.io/gdg-workshop/

| Workshop | Folder | Slides |
| --- | --- | --- |
| Agentic AI Workshop (Nov 2026) | [`agentic-ai/`](agentic-ai/) | [/agentic-ai/](https://chee613.github.io/gdg-workshop/agentic-ai/) |
| Hackathon Masterclass (Oct 2026) | [`hackathon/`](hackathon/) | [/hackathon/](https://chee613.github.io/gdg-workshop/hackathon/) |
| Gesture Lamp & AI Hardware (Sep 2026) | [`agentic-hardware/`](agentic-hardware/) | [/agentic-hardware/](https://chee613.github.io/gdg-workshop/agentic-hardware/) |

## Folder layout

```
index.html            landing page with a card for each workshop
agentic-ai/           decks, role-play cards, setup guide, venue plan
hackathon/            slides, live idea-challenge server, build scripts
agentic-hardware/     gesture-lamp demo, slides, wiring, guides
.github/workflows/    publishes the slides to GitHub Pages
```

Each workshop folder keeps its own `index.html` (the page its address opens), an `assets/` folder and a `README.md`.

## Add a new workshop

1. Create a folder with a short, lowercase, hyphenated name, for example `cloud-run/`. The name becomes the address: `/cloud-run/`.
2. Put the main deck in it as `index.html`, with images and videos under `cloud-run/assets/`. Use relative paths such as `assets/cover.png`, never paths starting with `/`.
3. Add a card to the root `index.html` and a row to the table above.
4. Add the folder to the **Assemble site** step in `.github/workflows/pages.yml`.

## Publishing

Every push to `main` runs the Pages workflow, which publishes only the landing page and the workshop slides. Build tools, server code and the venue plan are left out.

The Hackathon live board and submission form need a running server, so they stay on Railway. GitHub Pages serves static files only. See [`hackathon/RAILWAY.md`](hackathon/RAILWAY.md).

## Preview locally

From the repository root:

```powershell
python -m http.server 8000
```

Then open http://localhost:8000/. A local server is needed because the decks load videos and modules that browsers block when opened straight from a file.
