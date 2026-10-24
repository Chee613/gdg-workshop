# Judging and ChatGPT CSV format

Both the main workshop and the independent backup support the same three methods. Open the private **`/host`** dashboard and choose **Judging method**.

| Method | What supplies the scores | Needs a Gemini key? |
| --- | --- | --- |
| Gemini analysis | One request containing all titles, full introductions and the complete saved rubric | Yes |
| Manual scoring | The host enters a 0–10 score for each idea and criterion | No |
| ChatGPT / CSV import | Upload an exported prompt to ChatGPT, then import its CSV answer | No |

All methods use the saved theme, criterion order, weights and private guidance. The server calculates totals; neither Gemini nor a CSV can supply the final ranking. The host sees **every** idea from highest to lowest; the audience sees only the top three after a separate **Reveal top three** action. At least three ideas are required.

## Gemini

Set `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) in the server environment, or connect through the host dashboard. `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`. The application reads environment variables directly; it does not automatically load `.env` files.

Choose **Gemini analysis → Analyse all ideas**. This closes submissions and sends the whole round in one request. A provider error returns the round to **Submissions closed**, preserves the ideas and shows the error. You can then choose either fallback without adding a key or calling Gemini again. A configured key still needs working billing/quota and network access.

## Manual fallback

1. **Close submissions**, then choose **Manual scoring**.
2. Read each idea and the saved rubric. Hover a score label for its private guidance; the full guidance also remains in the challenge configuration.
3. Enter every criterion score from **0 to 10**; decimals are allowed. Empty fields and invalid scores block ranking.
4. Click **Calculate ranking**, review the full results, then **Reveal top three**.

Draft scores stay in the host browser across refreshes. Changing the rubric resets those drafts. Calculated results persist in SQLite. An ideas recovery export does not include unsaved manual drafts.

## ChatGPT fallback

1. Collect the final submissions and **Close submissions**. Keep them closed until judging is complete.
2. Choose **ChatGPT / CSV import**.
3. Click **Export ChatGPT prompt (.md)**. This is the recommended export: it includes the exact theme, full criterion names, weights, detailed guidance, every title and complete introduction, original idea IDs, the round fingerprint, and the required answer format.
4. Upload that Markdown file to ChatGPT, or paste its complete contents. Ask: **“Follow the instructions in this file. Evaluate every idea against the supplied rubric and return the complete scores.csv file.”** Do not upload API keys or host passwords; the export does not include them.
5. Download ChatGPT's CSV, or copy its raw CSV answer into a UTF-8 file named `scores.csv`. If the answer is wrapped in Markdown fences, remove the opening/closing fence lines. Ensure the answer includes all ideas, including the lowest scoring ones.
6. Choose the file under **Import judged scores CSV**. The server validates the entire file before saving anything. Review the resulting full ranking, then separately click **Reveal top three**.

**Export ideas + rubric (.csv)** is another complete input for ChatGPT or a spreadsheet. Each row carries its title, description, theme, full rubric JSON and judging instructions, with empty score/feedback fields. ChatGPT can return the compact answer format below, or fill that exported CSV while retaining its exact columns. Descriptions are private exports: share them only with the judging service you choose.

This is a manual file exchange with ChatGPT, not an integrated ChatGPT API call. A ChatGPT account's own file/context limits apply. If an answer is incomplete, ask for the complete file; the application rejects partial imports.

## Exact compact CSV answer

For the default five-criterion rubric, the header must be **exactly**:

```csv
round,snapshot,idea_id,score_1,score_2,score_3,score_4,score_5,strength,improve
```

| Column | Required value |
| --- | --- |
| `round` | Copy the exported round number unchanged into every row |
| `snapshot` | Copy the full exported 64-character fingerprint unchanged into every row |
| `idea_id` | Original numeric idea ID; every current idea exactly once |
| `score_1` | Unweighted 0–10 score for the first saved criterion |
| `score_2` … `score_N` | Unweighted 0–10 scores in the exact saved criterion order |
| `strength` | Nonempty constructive text, at most 300 characters |
| `improve` | Nonempty constructive text, at most 300 characters |

Do not invent a snapshot or copy one from this documentation. The actual values and complete idea list are inside your downloaded export. Row order does not matter: matching uses **idea IDs**, not titles or position. Do not add participant names, rank or total columns.

The default score columns mean:

| Column | Criterion | Weight |
| --- | --- | --- |
| `score_1` | Impact & Sustainability Value | 25% |
| `score_2` | Innovation & Differentiation | 20% |
| `score_3` | Feasibility & Deliverability | 20% |
| `score_4` | Strategic Fit & Theme Relevance | 15% |
| `score_5` | Commercial & Value Multiplication | 20% |

For example, scores `8,7,9,8,6` produce **76/100**, calculated as `8×25/10 + 7×20/10 + 9×20/10 + 8×15/10 + 6×20/10`. Higher totals rank first; equal totals use ascending idea ID for a stable order. The app supports one to eight custom criteria, so use the dynamically generated header in **your export**, not always five score columns.

### Enriched CSV alternative

The exported spreadsheet has this exact five-criterion header:

```csv
round,snapshot,idea_id,score_1,score_2,score_3,score_4,score_5,strength,improve,title,description,theme,rubric,instructions
```

Fill every score and both feedback columns, retaining the header. The trailing context columns are informational; the server matches the original stored ideas and rubric rather than trusting editable context text. Potential spreadsheet formulas in exported titles/descriptions/themes are prefixed with an apostrophe so participant text stays data.

### File rules and rejection cases

- Use UTF-8 CSV (an initial UTF-8 BOM is accepted), comma delimiters and decimal points. Do not use semicolon-delimited CSV, percentages, locale decimal commas, `NaN` or infinity.
- Quote a field containing a comma, quote or newline. Double embedded quotes: the text `Useful, "specific" benefit.` becomes `"Useful, ""specific"" benefit."` in CSV.
- Include exactly one row per current idea. Missing, duplicated, unknown or extra IDs are rejected. Do not insert blank rows or leave scores/feedback empty.
- Preserve the exact header and order from the export. No Markdown fences, extra commentary, rank/total columns or additional headers.
- The file must be smaller than 12 MB. Browser and server both limit imports.
- The fingerprint covers the round, theme, complete rubric and current ideas. Reopening submissions or editing the challenge/ideas may invalidate an earlier export. Export again and judge the updated data.
- Scores can only be imported into a closed, unjudged round. Import does not overwrite a completed ranking and never reveals results automatically. All validation happens before the results are saved.

## Moving between deployments

**Export ideas** downloads a different file: recovery JSON (`gdg-idea-backup-v1`) containing the theme, full rubric and introductions. Both repositories accept this under **Import ideas export**, in an empty round only. Imports are atomic and start closed; old rounds remain archived.

After recovering ideas on the other deployment, **generate a fresh judging export there** before asking ChatGPT for scores. Recovery assigns local IDs, and the other deployment has its own round and fingerprint. A scores CSV from the original deployment must not be assumed compatible.

The deployments do not automatically sync. Each needs its own database, QR/link and optional Gemini key. Both can continue with manual scoring or CSV import when Gemini is unavailable.

## Protected endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/export` | Recovery JSON with ideas and exact rubric |
| `POST /api/import` | Recover JSON into an empty round |
| `GET /api/judging.md` | Complete ChatGPT prompt and CSV instructions |
| `GET /api/judging.csv` | Enriched input CSV with blank score fields |
| `POST /api/import-scores` | JSON body `{"csv":"raw CSV text"}`; validate and prepare ranking |
| `POST /api/rank` | `{"mode":"gemini"}` or `{"mode":"manual","ratings":[...]}` |
| `POST /api/reveal` | Reveal the prepared top three |

All endpoints require presenter access. POST requests also require `X-Workshop-Host: 1`. Manual ratings use `{"id":123,"scores":[8,7,9,8,6],"strength":"Useful.","improve":"Pilot it."}` for every idea. Scores and feedback follow the same validation as imported/Gemini results. Keys and host passwords never appear in judging exports or public state.
