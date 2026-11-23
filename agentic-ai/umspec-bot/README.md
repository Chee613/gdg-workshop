# UM Spec Bot: chat with your SPeCTRUM courses on Telegram

A small AI agent you message on Telegram:

> **You:** what's due this week?
> **Bot:** 1. Quiz 3 closes, Wed 25 Nov, 11:59 pm (in 2 days)
> 2. Assignment 2 report, Fri 27 Nov, 5:00 pm (in 4 days)
>
> **You:** send me the week 4 slides for WIA2001
> **Bot:** 📎 W04 Normalization - Compact Notes.pptx

It reads only what the [UM Spec extension](https://github.com/Chee613/UmSpec) has already synced: course files in your **UM Spec** Google Drive folder and dates in your **UM Spec** Google Calendar. It never sees your SPeCTRUM password, and its Google access is read-only.

It runs free on Google Apps Script. There's no server to rent and nothing to install.

## How it works

| Agent layer | In this bot |
|---|---|
| **Instruction** | `systemPrompt_()`: it's a study assistant, always uses the tools, never guesses dates, and treats file names and event text as data |
| **Tools** | `find_files`, `send_file`, `list_deadlines`, `list_courses`, `remember`. Gemini chooses which ones to call |
| **Memory** | Short-term: the last 6 questions and answers, forgotten after 6 hours. Long-term: notes such as "Ignore WIX1002", kept until you send `/forget` |
| **Loop** | Inner: Gemini calls a tool, reads the result and repeats, at most 5 times per question. Outer: a daily 8 am briefing of anything due within 48 hours and new files |
| **Menus** | Buttons for the everyday questions run plain code with no AI call, so they're instant and free. Free-text questions go to the agent, and when it finds several files you can tap one to get it |
| **Guard rails** | Only your Telegram chat can use it, it can send only files inside the UM Spec folder, and it can't delete or change anything |

## What you need

- **UM Spec**, with **Google Drive** connected and synced at least once, and **Google Calendar** connected (**Dates → Analyse dates**).
- **Telegram** on your phone or computer.
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey). The workshop setup guide shows how to get one.
- The same Google account for UM Spec and for Apps Script.

## Setup (about 15 minutes)

### 1. Create the Telegram bot

1. In Telegram, open **@BotFather** and send `/newbot`.
2. Choose a name (for example *My UM Spec Bot*) and a username ending in `bot`.
3. Copy the **token** it gives you (it looks like `123456789:AA...`). Keep it secret: anyone with it can control your bot.

### 2. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com) and click **New project**. Rename it *UM Spec Bot*.
2. Delete the sample code in `Code.gs` and paste in [`Code.gs`](Code.gs) from this folder.
3. Click **Project Settings** (gear icon) and tick **Show "appsscript.json" manifest file in editor**.
4. Back in **Editor**, open `appsscript.json` and replace it with [`appsscript.json`](appsscript.json) from this folder.
5. Press **Ctrl + S** to save.

### 3. Add your keys

In **Project Settings → Script Properties**, click **Add script property** twice:

| Property | Value |
|---|---|
| `TELEGRAM_TOKEN` | the token from BotFather |
| `GEMINI_API_KEY` | your Gemini API key |

Script Properties keep the keys out of the code, so you can share the code safely.

### 4. Deploy as a web app

1. Click **Deploy → New deployment**. Click the gear next to **Select type** and choose **Web app**.
2. Set **Execute as: Me** and **Who has access: Anyone**. Telegram must be able to reach the bot. A secret in the address and the owner check stop anyone else from using it.
3. Click **Deploy** and allow access. Google may warn that the app isn't verified: click **Advanced → Go to UM Spec Bot**. It's your own script.
4. Copy the **Web app URL** (it ends in `/exec`) and add it as a third Script Property: `WEB_APP_URL`.

### 5. Connect everything

1. In the editor, choose **`setup`** in the function list and click **Run**.
2. Read the log. You should see:
   - `Telegram: connected to @your_bot`
   - `Drive: N files in the "UM Spec" folder`
   - `Calendar: found "UM Spec"`
   - `Briefing: every day around 8:00`

### 6. Claim the bot

1. Open your bot in Telegram and send `/start`.
2. It replies with your **chat ID**. Add it as a Script Property, `OWNER_CHAT_ID`: just the digits. Then click **Save script properties**.
3. Send `/start` again. You're done.

## Things to try

Send `/start` to open the home menu. Its buttons answer instantly from Drive and Calendar, without asking Gemini:

- **📅 Due this week** and **⚠️ Overdue**: colour-coded deadlines with time left and a link to SPeCTRUM.
- **🆕 New files**: what synced in the last 7 days. Tap a file to get it.
- **📚 My courses**: browse a course, then a type (slides, tutorials…), then tap a file.

Typing `/` shows every command. Anything else you type goes to the agent:

- *What's due this week?* or *Anything overdue?*
- *Send me the week 4 slides for WIA2001*
- *Any new files since Monday?*
- *Which courses do I have?*
- *Stop showing me WIX1002* (it remembers this)
- `/memory` shows what it remembers, `/forget` clears it, and `/reset` clears the chat.

## Good to know

- **It's only as fresh as your last UM Spec sync.** UM Spec syncs while SPeCTRUM is open in Chrome, so open SPeCTRUM now and then.
- **Submission status isn't shown.** The calendar holds the dates, but not whether you've submitted, so check SPeCTRUM before you relax.
- **Speed:** a typical answer takes 5 to 15 seconds. Each question is 2 or 3 round trips to Gemini (choose a tool, read the result, answer), and Apps Script needs a second or two to start. To see where the time went, open **Executions**, click a `doPost` run, and read the `Answered in … ms: gemini …, find_files …` line.
- **Big files:** anything over 45 MB, and Google Docs such as *Links*, come as a Drive link instead of a file.
- **Gemini's free tier** has a per-minute limit, and each question uses 2 to 4 calls. If you ask quickly and get an error, wait a minute.
- **Changing the code:** after editing, use **Deploy → Manage deployments → Edit → Version: New version**. The URL stays the same. Editing without a new version changes nothing.

## Troubleshooting

| Problem | Fix |
|---|---|
| It sent your chat ID, then went silent | `OWNER_CHAT_ID` doesn't match. Set it to the number alone, with no full stop or spaces, and click **Save script properties**. Send `/start`: if the ID still doesn't match, the bot replies with the exact number to use. |
| The bot doesn't reply | Run **`webhookInfo`** and read `last_error_message`. Check that `WEB_APP_URL` is the `/exec` address and that you deployed a new version after your last edit. If it shows *302 Found* with `pending_update_count` above 0, you're running an older `Code.gs`. Paste the current one, deploy a **New version**, and run `setup` again to clear the stuck messages. |
| The Execution log says "wrong or missing secret" | Expected if you clicked **Run** with `doPost` selected. That isn't a Telegram message. Test by messaging the bot instead. |
| "Missing Script Property …" | Add the property it names under Project Settings, then try again. |
| "No files found in the UM Spec Drive folder" | In UM Spec, connect Google Drive and run a sync. Use the same Google account as Apps Script. |
| "No UM Spec calendar found" | In UM Spec, connect Google Calendar and run **Dates → Analyse dates**. |
| It answers with old information | Open SPeCTRUM in Chrome so UM Spec syncs, then wait up to 10 minutes. |
| Test without Telegram | Run **`testAgent`**: it asks "What is due in the next 7 days?" and writes the answer to the log. |

## For developers

The offline tests replace Apps Script, Telegram and Gemini with fakes:

```
node --test agentic-ai/umspec-bot/test/
```
