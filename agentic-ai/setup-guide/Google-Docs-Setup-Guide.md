# Agentic AI Workshop — Participant Setup Guide

**GDG on Campus Universiti Malaya × Robotics Engineering Club | "Let Him Cook"**

Get your laptop ready to build and run your personal productivity agent with **Google ADK** and **Gemini**. Total setup time is about **10 minutes**.

---

## ⚡ Choose Your Setup Path

Choose the setup method that fits how you work:

* **🤖 Option 1: The "Lazy Way" (Agent Auto-Setup):** Have Antigravity, Claude Code, or Codex? Drop the prompt into your agent and let it configure Python, dependencies, and files automatically.
* **🛠️ Option 2: The Manual Way (VS Code / Terminal):** Follow the step-by-step guide to clone, install, and run locally in VS Code or Antigravity's terminal.
* **☁️ Plan B: 1-Click Cloud (GitHub Codespaces):** No local Python installation required; runs 100% in your browser (ideal for Chromebooks, iPads, or locked laptops).

---

## Pre-Workshop Checklist

| Requirement | Supported Version | Verification Command | Official Link |
| :--- | :--- | :--- | :--- |
| **Python** | 3.11 or 3.12 (avoid 3.13) | `py --list` (Win) or `python3 --version` (Mac) | [python.org/downloads](https://www.python.org/downloads/release/python-31210/) |
| **Code Editor** | VS Code or Antigravity | Open application from Start / Applications | [code.visualstudio.com](https://code.visualstudio.com/download) |
| **Git** *(Optional)* | Any recent version | `git --version` | [git-scm.com](https://git-scm.com/downloads) |
| **Gemini API Key** | Free tier | [Google AI Studio](https://aistudio.google.com/app/apikey) | **Personal `@gmail.com` account required** |

> ⚠️ **CRITICAL — Use a Personal Google Account:**  
> You **must** generate your Gemini API key using a **personal `@gmail.com` account**. Do **not** use your student campus email (`@siswa.um.edu.my`), as university administrators disable external AI API key creation.

> 🔒 **Privacy Note:** Use fictional or non-sensitive details for tasks and schedules. Prompts and tool outputs are processed by Gemini. Keep your API key private.

---

## 🤖 Option 1: The "Lazy Way" (Agent Auto-Setup)

If you are using **Antigravity**, **Claude Code**, **Codex**, **Cursor**, or any coding agent with terminal access, you do not need to type commands manually.

### How to Auto-Setup:
1. Open your agent's chat interface or CLI.
2. Copy and paste this exact prompt:

```text
Please set up the gdg-personal-productivity-agent project for me:
1. Clone https://github.com/faizmibadurrahman/gdg-personal-productivity-agent.git into my documents folder.
2. Create an isolated Python virtual environment (.venv) using Python 3.11 or 3.12.
3. Install dependencies from requirements.txt into .venv.
4. Copy productivity_agent/.env.example to productivity_agent/.env.
5. Ask me for my Gemini API key to insert into .env.
6. Verify everything is ready and tell me the command to launch adk web.
```

3. When your agent prompts you for your Gemini API key, paste your key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Launch the web dashboard with the command provided by your agent (or run `.\.venv\Scripts\adk.exe web` / `.venv/bin/adk web`).

---

## 🛠️ Option 2: Manual Terminal Setup

### 📋 Streamlined Command Table

| Step | Action | Windows (PowerShell) | macOS / Linux (Terminal) |
| :---: | :--- | :--- | :--- |
| **1** | **Get Project** | `git clone https://github.com/faizmibadurrahman/gdg-personal-productivity-agent.git`<br>`cd gdg-personal-productivity-agent` | `git clone https://github.com/faizmibadurrahman/gdg-personal-productivity-agent.git`<br>`cd gdg-personal-productivity-agent` |
| **2** | **macOS Fix** *(One-time)* | *(Not applicable on Windows)* | `open "/Applications/Python 3.12/Install Certificates.command"` |
| **3** | **Create venv** | `py -3.12 -m venv .venv` *(or `-3.11`)* | `python3 -m venv .venv` |
| **4** | **Install ADK** | `.\.venv\Scripts\python.exe -m pip install -r requirements.txt` | `.venv/bin/python -m pip install -r requirements.txt` |
| **5** | **Config file** | `Copy-Item productivity_agent\.env.example productivity_agent\.env` | `cp productivity_agent/.env.example productivity_agent/.env` |
| **6** | **Launch Agent** | `.\.venv\Scripts\adk.exe web` | `.venv/bin/adk web` |
| **7** | **Alt Port** *(if 8000 busy)* | `.\.venv\Scripts\adk.exe web --port 8080` | `.venv/bin/adk web --port 8080` |

---

### Step-by-Step Instructions

#### Step 1: Install Python 3.11 or 3.12
* Verify with `py --list` (Windows) or `python3 --version` (macOS/Linux).
* If missing, download Python 3.12 from [python.org](https://www.python.org/downloads/release/python-31210/).
* **Windows Users:** Tick **"Add python.exe to PATH"** on the first installer screen.
* **Windows Alias Warning:** If typing `python` opens the Microsoft Store, use the `py` launcher instead (`py -3.12 -m venv .venv`).
* **macOS Users:** Double-click `/Applications/Python 3.12/Install Certificates.command` to prevent SSL errors.
* **Linux Users:** Run `sudo apt update && sudo apt install -y python3-venv python3-pip`.

#### Step 2: Install VS Code (or Antigravity)
* Download from [code.visualstudio.com](https://code.visualstudio.com/download).
* On Windows, choose the **x64 User Installer** (requires no administrator password).

#### Step 3: Get the Workshop Code
* **Option A (Git):** Run `git clone https://github.com/faizmibadurrahman/gdg-personal-productivity-agent.git`
* **Option B (ZIP):** Download ZIP from [GitHub](https://github.com/faizmibadurrahman/gdg-personal-productivity-agent) and extract it.
* **Double-Folder Check:** Open the extracted folder in your editor. Ensure **`requirements.txt`** and **`productivity_agent/`** are directly visible at the top level of the Explorer sidebar.

#### Step 4: Get Your Free Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and sign in with a **personal Google account**.
2. Click **+ Create API key** and copy your key (`AIzaSy...`).
3. If using a VPN, set your location to Malaysia or Singapore to prevent country-restriction errors.

#### Step 5: Install Dependencies & Configure `.env`
Run the setup commands from the table above in your editor's terminal. Then open `productivity_agent/.env` and replace `YOUR_API_KEY`:

```env
GOOGLE_GENAI_USE_ENTERPRISE=FALSE
GOOGLE_API_KEY=AIzaSy_your_actual_key_here
GEMINI_MODEL=gemini-3.5-flash
```

> 💡 **Formatting Tip:** Do **not** put quotes (`"` or `'`) or extra spaces around your key.  
> 💡 **Model Fallback:** If `gemini-3.5-flash` returns a 404 or quota error, change to `GEMINI_MODEL=gemini-2.0-flash`.

#### Step 6: Launch the Agent
Run `.\.venv\Scripts\adk.exe web` (Windows) or `.venv/bin/adk web` (macOS/Linux).  
When you see **`ADK Web Server started at http://localhost:8000`**, your agent is live!

> ⚠️ **Keep Terminal Running:** Do not close the terminal window while testing in your browser. Press `Ctrl + C` only when stopping or restarting the server.

---

## 🧪 Testing Your Agent in Browser

1. Open [http://localhost:8000](http://localhost:8000) (or `http://127.0.0.1:8000`).
2. In the top-left dropdown, select **`productivity_agent`**.
3. Click **Start Session** and run these test prompts in sequence:

| Step | Test Prompt to Send | Tool Invoked | Expected Output |
| :---: | :--- | :--- | :--- |
| **1** | `What tasks do I have?` | `get_tasks()` | Lists your sample assignments from `data.json`. |
| **2** | `Plan my day on 27 November 2026 around my schedule and deadlines, taking my preferences into account.` | `get_tasks()` + `get_schedule()` | Generates a structured daily schedule aligned with your personal profile. |
| **3** | `Add a task called Submit group assignment, due 2026-11-29, priority high.` | `add_task()` | Saves the task to your local disk. |
| **4** | `Show my tasks again.` | `get_tasks()` | Confirms the new task appears in your task list. |

---

## 🛠️ Troubleshooting & Problem Solving

| Problem / Error Message | Root Cause | Immediate Fix |
| :--- | :--- | :--- |
| **`py` or `python` not recognized** | Python not added to PATH | Re-run Python 3.12 installer, choose **Modify**, check **"Add Python to PATH"**, restart terminal. |
| **`python` opens Microsoft Store** | Windows execution aliases | Use `py` launcher (`py -3.12 -m venv .venv`) or disable store alias in Windows Settings. |
| **`SSL: CERTIFICATE_VERIFY_FAILED`** | macOS Python missing root certs | In Terminal, run `open "/Applications/Python 3.12/Install Certificates.command"`. |
| **`Could not open requirements.txt`** | Terminal in wrong directory | Check VS Code Explorer. If nested, use **File → Open Folder** to open the inner project folder. |
| **`productivity_agent` missing in dropdown** | Server started inside subfolder | Press `Ctrl + C`, run `cd ..` to return to project root, and rerun `adk web`. |
| **`401 Unauthorized: API_KEY_INVALID`** | Quotes or spaces in `.env` | Ensure `GOOGLE_API_KEY=AIzaSy...` has no quotes or spaces. Save and restart server. |
| **`Google AI Studio not available`** | Campus account used | Sign in with personal `@gmail.com` at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey). |
| **`Address already in use` (Port 8000)** | Port occupied | Run on port 8080: `adk web --port 8080` (open `http://localhost:8080`). |
| **Edits to `agent.py` not updating** | Server caches code in memory | Save file, press `Ctrl + C` in terminal, rerun `adk web`, and start a **New Session**. |
| **Corrupted sample data** | Malformed JSON in `data.json` | Stop server (`Ctrl + C`), delete `productivity_agent/data.json`, and restart. |

---

## ☁️ Plan B: 1-Click Cloud Setup (GitHub Codespaces)

*If your laptop runs into unresolvable errors, has no administrator rights, or if you use an iPad / Chromebook, use this 100% cloud setup:*

| Step | Action | Instructions / Commands |
| :---: | :--- | :--- |
| **1** | **Open Repository** | Open [github.com/faizmibadurrahman/gdg-personal-productivity-agent](https://github.com/faizmibadurrahman/gdg-personal-productivity-agent) |
| **2** | **Launch Codespace** | Click green **Code** button → **Codespaces** tab → **Create codespace on main** |
| **3** | **Wait 30 Seconds** | Full VS Code environment loads in browser with Python 3.12 pre-installed. |
| **4** | **Install & Configure** | In bottom terminal, run:<br>`pip install -r requirements.txt`<br>`cp productivity_agent/.env.example productivity_agent/.env` |
| **5** | **Add API Key** | Open `productivity_agent/.env` in the left file tree and paste your Gemini key. |
| **6** | **Launch Agent** | In terminal, run `adk web` → click the blue **"Open in Browser"** popup! |

---

**You are all set!** Bring your laptop and charger to the workshop and get ready to **Let Him Cook**!
