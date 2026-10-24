# GDG live idea challenge

Run `python server.py` from this folder. The presenter dashboard is at **http://127.0.0.1:8776/host**. Keep the computer and server running during the workshop.

1. Set the theme and weighted criteria; save the challenge. Each line uses `Criterion | Weight | Private guidance` (the third part is optional). Only the theme, criterion names and weights reach participants; guidance stays in presenter controls and the Gemini request.
2. Connect Gemini using the password field on the presenter computer. The key stays in server memory. Alternatively, set `GEMINI_API_KEY` before starting the server. `GEMINI_MODEL` overrides the default model.
3. Participants join on the same Wi-Fi using the QR on the challenge slide or beside the live submission count. They enter only a project title and brief introduction of up to **200 words**. The form shows a word counter; the server also enforces the limit. The QR and participant address are generated from this computer’s network address at startup.
4. Collect at least three ideas. **Analyse all ideas** closes submissions and scores every entry against the rubric. The server validates coverage and computes the weighted totals.
5. Review the scores, then **Reveal top three** for the countdown and podium. The public board shows no scores before this action.
6. **New round** opens another challenge. Earlier submissions remain archived in `.data/session.sqlite3`.

Local presenter controls accept requests only from this computer unless `WORKSHOP_HOST_PASSWORD` is set. When it is set, sign in as `presenter` using that password. A real Gemini key and network access are required for real AI judging; no simulated rankings are used in the live app. The tests use an isolated temporary database and test provider.

The slide’s **Open dashboard** link plays the dinosaur’s warp-pipe jump and opens `/board`, the audience view. It shows only project titles in floating GDG-coloured bubbles; incoming titles nudge their neighbours. Reduced motion uses a still layout. Brief introductions remain in presenter controls and are used for judging. The presenter dashboard stays at `/host`; it is not linked from the audience board.

The default theme is **AI for Everyday Life**. Its rubric totals 100%: Impact & Sustainability Value (25%), Innovation & Differentiation (20%), Feasibility & Deliverability (20%), Strategic Fit & Theme Relevance (15%), and Commercial & Value Multiplication (20%). Private guidance combines measurable benefits, useful differentiation, realistic pilots, people/planet relevance, lasting value and scalability. The judge reads both fields, considers clarity without an extra weight, and does not treat unsupported originality or e-waste claims as evidence. SDP/township examples are contextual rather than required partnerships. Startup upgrades only the old, unevaluated 40/30/30 default; custom rubrics and evaluated rounds remain intact.

The local address is available on the workshop network. Follow [the Railway guide](../RAILWAY.md) for public hosting. The server accepts `PORT`, saves data under `WORKSHOP_DATA_DIR` when configured, and generates a public QR from `RAILWAY_PUBLIC_DOMAIN` or `WORKSHOP_PUBLIC_URL`. Setting a URL alone does not publish the app. The Docker image requires a presenter password of at least 16 characters.

Gemini request format: [Google’s structured-output documentation](https://ai.google.dev/gemini-api/docs/generate-content/structured-output).

Validation from the workspace root:

```powershell
node .hack-build/verify-html.mjs
node .hack-build/verify-workshop.mjs
```
