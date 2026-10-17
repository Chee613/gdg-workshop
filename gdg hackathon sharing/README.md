# GDG Hackathon Masterclass

Twelve interactive slides, an animated Chrome dinosaur, and a live idea challenge.

For online hosting, follow the [Railway deployment guide](RAILWAY.md). It uses one service, a persistent volume, and password-protected presenter controls.

## Run the workshop

From the repository root, with Python 3 installed:

```powershell
python -m pip install pillow opencv-python
python "gdg hackathon sharing/workshop/server.py"
```

- Slides: <http://127.0.0.1:8776/Hackathon-Tips.html>
- Audience board: <http://127.0.0.1:8776/board>
- Presenter controls: <http://127.0.0.1:8776/host>

In presenter controls, open **Connect Gemini**, paste the API key, and click **Use this connection**. The key stays in server memory. Set the theme and judging criteria before the session. Participants use the generated QR code on the same Wi-Fi and submit a project title and brief introduction. Only titles appear on the public wall.

The slides' **Open dashboard** link plays a warp-pipe jump into the audience board. Press the GDG **Reveal rankings** button on the challenge slide to judge and reveal the top three. Use the browser's Back command to return from the board to the slides. See [workshop instructions](workshop/README.md) for judging and round controls.

## Edit and rebuild

The current HTML and its assets are included in `output/`. Node.js 20+ is needed only for rebuilding and browser checks:

```powershell
npm --prefix "gdg hackathon sharing/remotion" ci
npm --prefix .hack-build ci
python .hack-build/rearrange-deck.py
node .hack-build/bundle-motion.mjs
node .hack-build/build-html.mjs
```

Edit `.hack-build/rearrange-deck.py` for content, `.hack-build/build-html.mjs` for slide interactions, `remotion/dino-motion.jsx` for the dinosaur, and `output/session/` for the live challenge. Original workshop photos and the source deck are in `hack/` and `Hack.pptx`.

With Chrome installed and the workshop server running, verify from the repository root:

```powershell
node .hack-build/verify-html.mjs
node .hack-build/verify-workshop.mjs
```

The workshop checks use a temporary database and synthetic judging provider. Real AI judging requires your own Gemini connection. Keys, session submissions, dependency folders, and local test captures are excluded from Git.
