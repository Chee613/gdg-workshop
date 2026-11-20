# Personal Productivity Agent — Pre-Workshop Setup Guide

**GDG on Campus Universiti Malaya × Robotics Engineering Club | Let Him Cook**

Follow this step-by-step guide **before the hands-on session** so your laptop is ready to run your own AI agent with **Google ADK** and **Gemini**. Total setup time is about **10–15 minutes**.

---

## Pre-Workshop Checklist (What to Install Beforehand)

Check off each item below before moving to Part 1.

| Requirement | Required Version | How to Check If Already Installed | Download Link |
| --- | --- | --- | --- |
| **Python** | **3.11 or 3.12** (recommended) | Windows: `py --list` / macOS: `python3 --version` | [python.org/downloads/release/python-31210](https://www.python.org/downloads/release/python-31210/) |
| **Visual Studio Code** | Latest stable | Open VS Code from Start Menu / Applications | [code.visualstudio.com/download](https://code.visualstudio.com/download) |
| **Git** *(optional if using ZIP)* | Any recent version | Run `git --version` in terminal | [git-scm.com/downloads](https://git-scm.com/downloads) |
| **Google Account** | Personal Gmail recommended | Used to generate your free Gemini API key | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |

**Important Privacy Note:** During the workshop, use **fictional or non-sensitive** profile details, tasks, and schedule items. Prompts, instructions, and tool outputs are sent to Gemini.

---

## Step 1: Install Python 3.11 or 3.12 (If Not Installed)

First, check whether you already have Python 3.11 or 3.12 by opening **PowerShell** (Windows) or **Terminal** (macOS/Linux) and running:

```bash
# Windows (PowerShell)
py --list

# macOS / Linux
python3 --version
```

If you see **Python 3.11.x** or **Python 3.12.x**, you can skip straight to **Step 2**.

If you do **not** have Python 3.11 or 3.12 installed (or only have a newer/older version):

1. Open [Python 3.12.10 Downloads](https://www.python.org/downloads/release/python-31210/) in your browser.
2. Scroll down to the **Files** section at the bottom of the page:
   - **Windows:** Click **Windows installer (64-bit)**.
   - **macOS:** Click **macOS 64-bit universal2 installer**.
3. Run the downloaded installer.
4. **Windows users — CRITICAL:** On the very first installer screen, tick the checkbox **"Add python.exe to PATH"** at the bottom before clicking **Install Now**.
5. Close and reopen your terminal, then verify with `py --list` (Windows) or `python3 --version` (macOS).

*Figure 1: Downloading Python 3.12 and ticking "Add python.exe to PATH" on Windows.*

---

## Step 2: Install Visual Studio Code (If Not Installed)

You will use **Visual Studio Code (VS Code)** to edit your `.env` API key, explore `agent.py`, and run terminal commands in one place.

1. Go to [code.visualstudio.com/download](https://code.visualstudio.com/download).
2. Click the installer for your operating system:
   - **Windows:** Download **x64 · User Installer** (or Arm64 for Snapdragon laptops).
   - **macOS:** Download **Universal · .dmg**, open it, and drag **Visual Studio Code** into **Applications**.
   - **Linux:** Download **.deb** (Ubuntu/Debian) or **.rpm** (Fedora).
3. Run the installer with the default settings and open VS Code once to confirm it launches cleanly.

*Figure 2: Choosing the Visual Studio Code installer for Windows, macOS, or Linux.*

---

## Step 3: Install Git (Recommended for Cloning the Repo)

Check whether Git is already installed by running `git --version` in your terminal. If you see a version number (for example `git version 2.49.0`), skip to **Step 4**.

If Git is not installed:

1. Go to [git-scm.com/downloads](https://git-scm.com/downloads) and choose your OS (**Windows**, **macOS**, or **Linux**).
2. **Windows:** Download and run the **64-bit Git for Windows Setup**. Keep all default options and click **Next** through to **Install**.
3. **macOS:** Run `xcode-select --install` in Terminal (or install via Homebrew: `brew install git`).
4. Close and open a **new** terminal window, then verify both Git and Python are recognized:

```bash
git --version
```

**No Git? No problem:** You can skip installing Git and use the **Download ZIP** option in Step 5 instead.

*Figure 3: Selecting your OS on git-scm.com and verifying Git and Python in a new terminal.*

---

## Step 4: Get Your Free Gemini API Key (Google AI Studio)

Every participant needs their own Gemini API key so your agent can talk to Gemini.

1. Open [Google AI Studio — API Keys](https://aistudio.google.com/app/apikey) and sign in with your Google account.
2. Click the blue **+ Create API key** button in the top right.
3. Follow the prompt to create a key in a new or existing Google Cloud project.
4. Once created, click **Copy** next to your key (it starts with `AIza...`) and keep the tab open or store it temporarily until Step 8.

**Keep your API key private:** Never paste your key into WhatsApp, Discord, GitHub, or screenshots. Only paste it into your local `productivity_agent/.env` file, which is listed in `.gitignore`.

*Figure 4: Creating and copying your Gemini API key in Google AI Studio.*

---

## Step 5: Clone the Workshop Repository (or Download ZIP)

Open the workshop repository on GitHub: [github.com/faizmibadurrahman/gdg-personal-productivity-agent](https://github.com/faizmibadurrahman/gdg-personal-productivity-agent)

### Option A: Clone with Git (Recommended)

1. On GitHub, click the green **`<> Code`** button.
2. Under **Local → HTTPS**, click the **Copy** icon.
3. Open your terminal, navigate to the folder where you keep projects (for example `Documents`), and run:

```bash
git clone https://github.com/faizmibadurrahman/gdg-personal-productivity-agent.git
cd gdg-personal-productivity-agent
```

### Option B: Download ZIP (If You Don't Have Git)

1. Click the green **`<> Code`** button → click **Download ZIP**.
2. Right-click the downloaded ZIP file and click **Extract All...** (Windows) or double-click to unzip (macOS).
3. Remember the extracted folder location — you will open it in VS Code next.

*Figure 5: Clicking the green Code button on GitHub to copy the HTTPS clone URL or download the ZIP.*

---

## Step 6: Open the Project in VS Code & Launch Terminal

1. Open **VS Code**.
2. Click **File → Open Folder...** (`Ctrl+K Ctrl+O` on Windows / `Cmd+O` on macOS) and select your `gdg-personal-productivity-agent` folder.
3. Check the **Explorer** sidebar on the left — make sure you directly see **`requirements.txt`** and the **`productivity_agent/`** folder (not a nested outer folder).
4. Open VS Code's built-in terminal via **Terminal → New Terminal** (shortcut: `` Ctrl+Shift+` ``).
5. Confirm your terminal prompt path ends with `gdg-personal-productivity-agent`.

*Figure 6: Opening the project root in VS Code and starting the integrated terminal.*

---

## Step 7: Create Your Python Environment & Install Google ADK

Run the following commands **one line at a time** inside the VS Code terminal at the project root folder.

### Windows (PowerShell)

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item productivity_agent\.env.example productivity_agent\.env
```

**Using Python 3.12 on Windows?** Replace `-3.11` with `-3.12` in the first line: `py -3.12 -m venv .venv`.

### macOS / Linux (Terminal)

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp productivity_agent/.env.example productivity_agent/.env
```

**What these 3 commands do:**
1. Create an isolated `.venv` virtual environment for this workshop.
2. Install `google-adk==2.14.0` and all required dependencies (this takes 30–60 seconds).
3. Copy `.env.example` to `.env` so you can add your Gemini API key. *(Skip command 3 if you already created `.env`.)*

*Figure 7: Running the three setup commands for Windows PowerShell or macOS/Linux.*

---

## Step 8: Paste Your Gemini API Key into `.env`

1. In the VS Code **Explorer** sidebar, expand **`productivity_agent/`** and click **`.env`**.
2. Find the line `GOOGLE_API_KEY=YOUR_API_KEY`.
3. Replace `YOUR_API_KEY` with the Gemini API key you copied in Step 4 (no quotes, no extra spaces):

```env
GOOGLE_GENAI_USE_ENTERPRISE=FALSE
GOOGLE_API_KEY=AIzaSy_your_actual_api_key_here
GEMINI_MODEL=gemini-3.5-flash
```

4. Save the file using **Ctrl+S** (Windows) or **Cmd+S** (macOS). Make sure the unsaved dot on the `.env` tab disappears.

*Figure 8: Replacing YOUR_API_KEY in productivity_agent/.env and saving the file.*

---

## Step 9: Launch the Agent with Google ADK Web

From the same VS Code terminal (project root folder), run the launch command for your OS:

```powershell
# Windows (PowerShell)
.\.venv\Scripts\adk.exe web
```

```bash
# macOS / Linux
.venv/bin/adk web
```

When you see **`ADK Web Server started`** with the link **`http://localhost:8000`**, your agent is live! **Keep this terminal window running** while using the agent (press `Ctrl+C` later when you want to stop or restart it).

*Figure 9: Launching ADK Web from the project root and opening localhost:8000.*

---

## Step 10: Test Your Agent in the Browser

1. Open [http://localhost:8000](http://localhost:8000) in your browser.
2. In the top-left dropdown, select **`productivity_agent`**.
3. Start a session and send your first test prompt:

```text
What tasks do I have?
```

4. Check the **Events / Tool Trace** panel on the left — you should see the agent call **`get_tasks()`** and return your sample tasks from `productivity_agent/data.json`!
5. Try the rest of the workshop prompts:
   - `Plan my day on 27 November 2026 around my schedule and deadlines, taking my preferences into account.`
   - `Add a task called Submit group assignment, due 2026-11-29, priority high.`
   - `Show my tasks again.`

*Figure 10: Selecting productivity_agent in ADK Web and verifying the get_tasks() tool call.*

---

## Quick Troubleshooting & Common Fixes

| Issue | Fix |
| --- | --- |
| **`py -3.11` or `python` not recognized** | Re-run the Python 3.12 installer and tick **"Add python.exe to PATH"**, or try `py -3.12 -m venv .venv`. Close and reopen VS Code after installing. |
| **PowerShell script execution error** | We invoke `.\.venv\Scripts\python.exe` and `.\.venv\Scripts\adk.exe` directly so you do **not** need to run `Activate.ps1`. |
| **`productivity_agent` missing in ADK dropdown** | Make sure you ran `adk web` from the **project root** folder (the one containing `requirements.txt`), NOT inside `productivity_agent/`. |
| **API key / quota / authentication error** | Check `productivity_agent/.env` for typos or extra spaces, save the file, restart ADK (`Ctrl+C` then run again), and verify your key & quota in Google AI Studio. |
| **Edits to `agent.py` not taking effect** | Save `agent.py`, stop ADK with `Ctrl+C`, run `adk web` again, and start a **new session** in the browser. |
| **Want to reset sample tasks/schedule?** | Stop ADK and delete only `productivity_agent/data.json`. It will be recreated automatically on your next tool call. |

**You're all set!** See you at the **Let Him Cook** hands-on session!
