# Deploy the workshop on Railway

The same service hosts the slides, participant form, live wall and judging API. Use one instance and a persistent volume for the existing SQLite database. The container uses Railway's `PORT` automatically.

## 1. Create the service

1. Sign in at <https://railway.com> with GitHub. Check the current plan allowance before deploying.
2. Create a new project and choose **Deploy from GitHub repo**. Authorize access to `Chee613/gdg-workshop` if the private repo is missing.
3. Select the repository. In the service's **Settings → Source**, select branch `main` and set **Root Directory** to `/gdg hackathon sharing`.
4. Railway detects the included `Dockerfile`. Leave custom build and start commands empty. An initial deployment may fail until the root directory and presenter password are configured.

## 2. Add your private variables

In the service's **Variables** tab, add:

| Variable | Value |
|---|---|
| `GEMINI_API_KEY` | Optional Gemini API key; manual scoring and ChatGPT CSV import work without it |
| `WORKSHOP_HOST_PASSWORD` | A unique presenter password of at least 16 characters |
| `GEMINI_MODEL` | Optional; defaults to `gemini-3.5-flash-lite` |

Enter secrets directly in Railway. A configured Gemini key is available at startup. Keep the generated password available for signing in; do not put it in participant links. Both judging fallbacks work without a Gemini key; see the [judging guide](workshop/JUDGING.md).

The container already sets `WORKSHOP_DATA_DIR=/data` and requires presenter authentication. Without a suitable password it refuses to start. The account name is always `presenter`.

## 3. Keep submissions across restarts

Attach a **Volume** to this service, with mount path **`/data`**. Keep **one replica**. The database is `/data/session.sqlite3`; a separate database service is not needed.

In **Settings → Deploy**, set **Healthcheck Path** to **`/healthz`**. Deploy the pending changes. The deployment logs should include `Listening on 0.0.0.0:` followed by Railway's assigned port.

## 4. Generate the public link

In **Settings → Networking → Public Networking**, choose **Generate Domain**. Railway provides an HTTPS address ending in `.up.railway.app`.

**Redeploy once after generating the domain.** The app reads `RAILWAY_PUBLIC_DOMAIN` at startup and regenerates the QR code using that address. A custom address can instead be supplied in `WORKSHOP_PUBLIC_URL`, including `https://`.

## 5. Open your workshop

Replace `YOUR-DOMAIN` with the generated domain:

| Page | URL |
|---|---|
| Presenter controls | `https://YOUR-DOMAIN/host` |
| Slides | `https://YOUR-DOMAIN/Hackathon-Tips.html` |
| Audience board | `https://YOUR-DOMAIN/board` |
| Participant form | `https://YOUR-DOMAIN/join` |

Open `/host` first. At the browser sign-in prompt, use **presenter** and the password you configured. Open the slides in the same browser session so the ranking button uses your presenter login. Participant pages remain public; keep presenter controls off the projector.

The initial theme is **AI for Everyday Life**. Confirm the criteria in presenter controls and choose a **Judging method**. For Gemini, check that it says **Gemini key ready**; the other two methods need no Gemini connection.

## 6. Rehearse

1. Scan the deployed QR on a phone using mobile data. It should open the public participant form.
2. Submit ideas from three separate browsers or private sessions. Confirm their titles appear on the board.
3. In `/host`, close submissions and rehearse the selected judging method. Review the full ranking, then **Reveal top three**. Gemini analysis makes a real provider request; manual scoring and CSV import do not.
4. Restart the Railway deployment and confirm the submissions remain saved.
5. Start a new round before the actual workshop. Keep auto-deploys and planned edits out of the live session; a restart interrupts an active judging run.

Railway's resource usage consumes your plan's credit allowance, and Gemini has its own usage limits and pricing. Check Railway's Usage page before the event. This preparation does not create a Railway project, configure your secrets, or purchase a plan.

## Local verification

From the repository root:

```powershell
python .hack-build/verify-hosting.py
$env:GDG_HOSTED_CHECK = "1"
node .hack-build/verify-workshop.mjs
```

The tests use temporary databases and synthetic judging, never the real workshop's submissions or Gemini key. Docker must be running to additionally build the Linux container:

```powershell
docker build -t gdg-workshop "gdg hackathon sharing"
```

References: [Railway monorepo settings](https://docs.railway.com/deployments/monorepo), [Dockerfiles](https://docs.railway.com/builds/dockerfiles), [volumes](https://docs.railway.com/volumes), [public-domain variables](https://docs.railway.com/variables/reference), [health checks](https://docs.railway.com/deployments/healthchecks), [pricing](https://railway.com/pricing).
