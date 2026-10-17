# GDG live idea challenge

Run `python server.py` from this folder. The presenter dashboard is at **http://127.0.0.1:8776/host**. Keep the computer and server running during the workshop.

1. Set the theme and weighted criteria; save the challenge.
2. Connect Gemini using the password field on the presenter computer. The key stays in server memory. Alternatively, set `GEMINI_API_KEY` before starting the server. `GEMINI_MODEL` overrides the default model.
3. Participants join on the same Wi-Fi using the QR on the challenge slide or beside the live submission count. They enter only a project title and brief introduction. The QR and participant address are generated from this computer’s network address at startup.
4. Collect at least three ideas. **Analyse all ideas** closes submissions and scores every entry against the rubric. The server validates coverage and computes the weighted totals.
5. Review the scores, then **Reveal top three** for the countdown and podium. The public board shows no scores before this action.
6. **New round** opens another challenge. Earlier submissions remain archived in `.data/session.sqlite3`.

Presenter controls accept requests only from this computer. A real Gemini key and network access are required for real AI judging; no simulated rankings are used in the live app. The tests use an isolated temporary database and test provider.

The slide’s **Open dashboard** link plays the dinosaur’s warp-pipe jump and opens `/board`, the audience view. It shows only project titles in floating GDG-coloured bubbles; incoming titles nudge their neighbours. Reduced motion uses a still layout. Brief introductions remain in presenter controls and are used for judging. The presenter dashboard stays at `/host`; it is not linked from the audience board.

The address is local to the workshop network. A public hosted version requires separate deployment. `WORKSHOP_PUBLIC_URL` can override the QR target when an actual public URL or tunnel is available; setting it alone does not publish the app.

Gemini request format: [Google’s structured-output documentation](https://ai.google.dev/gemini-api/docs/generate-content/structured-output).

Validation from the workspace root:

```powershell
node .hack-build/verify-html.mjs
node .hack-build/verify-workshop.mjs
```
