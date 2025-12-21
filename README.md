# damn.js — DevTools Error Insight Assistant  
_A part of my **Idea Series**_

![Status](https://img.shields.io/badge/status-under_development-yellow)
![Category](https://img.shields.io/badge/type-devtools_extension-blue)
![Stage](https://img.shields.io/badge/stage-idea_to_mvp-purple)
![License](https://img.shields.io/badge/license-undecided-lightgrey)

---

## 🚀 Overview
**damn.js** is a Chrome DevTools extension that mirrors console errors in real time and provides AI-powered explanations plus structured debugging prompts.  
It does **not** auto-fix your errors.  
Instead, it helps you understand what went wrong and generates ready-to-use prompts for AI assistants like Claude, Cursor, or ChatGPT.

**What it does:**
- Mirrors `console.error`, `window.onerror`, and unhandled promise rejections in real time
- Provides AI-powered explanations with relevant documentation references
- Generates structured, copy-paste-ready debugging prompts for AI agents
- Keeps a local history of recent errors for quick reference

The goal is to reduce friction by providing contextual error insights **directly inside DevTools**, eliminating constant context switching between console, search engines, and AI tools.

---

## 🎯 Purpose
> **Mirror errors in real time, explain them with AI, and generate perfect debugging prompts — all inside DevTools.**

This significantly reduces context switching and helps developers debug faster without leaving the console. damn.js acts as a bridge between your errors and AI-powered assistance, making debugging more efficient and less frustrating.

---

## 🧩 Core Idea
**Real-time Error Pipeline:**
- An **injected script** hooks into `console.error`, `window.onerror`, and promise rejections
- Errors are forwarded via `window.postMessage` → **content script** → **DevTools panel**
- A **custom DevTools panel** (`damn.js`) displays all errors in real time with filtering options

**AI-Powered Features:**
- **Explain Button** 💡: Calls backend API to get AI-powered explanation, likely causes, and fixes with documentation references
- **Spell Button** ✨: Generates a structured, detailed debugging prompt optimized for AI assistants
- Developers can copy the generated "spell" and paste it directly into Claude, Cursor, ChatGPT, etc.

**Backend:**
- Serverless API (Vercel + Express) powered by AI models

---

## 📸 Screenshots

<div align="center">
  <img width="775" alt="damn.js Panel Overview" src="https://github.com/user-attachments/assets/29081820-1a0d-478f-bccc-9589502f0d62" />
  <p><em>The damn.js panel showing captured errors in real-time</em></p>
</div>

<div align="center">
  <img width="646" alt="AI Explanation Feature" src="https://github.com/user-attachments/assets/076d4006-c3b3-4c0b-bd04-f93b8de3df57" />
  <p><em>AI-powered error explanation with documentation references</em></p>
</div>

<div align="center">
  <img width="671" alt="Spell Generator" src="https://github.com/user-attachments/assets/f688c54f-e668-443b-8cab-9a1ec98a8e9f" />
  <p><em>Generated debugging prompt ready to copy</em></p>
</div>

---

## ✅ Try v1 (Working Version)

**v1 of damn.js is fully functional!**  
The backend is already hosted and ready to use.

### Quick Start with v1:
1. Clone the `vercel-version` branch:
```bash
git clone -b vercel-version https://github.com/yourusername/damnjs.git
cd damnjs
```

2. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `extension/` folder

3. Start using damn.js immediately — no backend setup needed!

> **Note:** v1 is not published on the Chrome Web Store due to developer registration fee constraints. However, it works perfectly via the "Load unpacked" method.

---

## ⚠️ Development Status

![Status](https://img.shields.io/badge/status-under_development-orange)

⚠️ **This project is under active development.**  
File structure, features, and implementation details **may change at any time** without notice.

Expect:
- Refactoring and restructuring
- Feature additions/removals
- API changes
- UI/UX iterations
- Architecture evolution

The codebase is fluid and experimental as we work toward a stable MVP.

![Status](https://img.shields.io/badge/status-under_development-orange)

This project is **actively being shaped**, and features may:
- evolve  
- be modified  
- be added or removed  
- be completely restructured as development continues  

---

## 🎁 Feature Set
**Current implementation (subject to change):**

### ✔ Real-time Error Mirroring  
Automatically captures `console.error`, `window.onerror`, and unhandled promise rejections from any webpage.

### ✔ Custom DevTools Panel  
Dedicated "damn.js" panel with dark theme, filtering options, and clean error cards.

### ✔ AI-Powered Explanations  
Click "💡 Explain" on any error to get:
- Clear explanation of what the error means
- Likely causes
- Practical fixes and debugging steps
- Documentation references (MDN, Stack Overflow, etc.)

### ✔ Spell Generator  
Click "✨ Spell" to generate a structured debugging prompt that includes:
- Error details and context
- Stack trace
- Recent error history
- Specific questions for AI assistants

---

## 🧰 Tech Stack
> **Note:** Tech stack may evolve during development

**Frontend (Chrome Extension):**
- Manifest V3
- Vanilla JavaScript + CSS
- Chrome DevTools APIs (`chrome.devtools.panels`)
- `chrome.runtime` messaging
- `window.postMessage` for page ↔ extension communication

**Backend (Serverless API):**
- Vercel + Express
- OpenAI GPT-4 Turbo (or Google Gemini)
- Node.js
- CORS + dotenv

**Architecture:**
- Injected script (page context) → Content script (bridge) → DevTools panel (UI)
- DevTools panel → Backend API → AI model → Response

---

## 🛠️ Local Setup & Installation

> **⚠️ UNDER ACTIVE DEVELOPMENT**  
> These setup instructions are subject to change at any time as the project evolves.  
> Dependencies, configuration steps, and file structure may be modified without notice.  
> If you encounter issues, check for updates or open an issue.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Chrome Browser** (latest version)
- **API Key** for AI service (OpenAI or Google Gemini)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/damnjs.git
cd damnjs
```

### 2. Backend Setup
```bash
cd damnjs_extension/api
npm install
```

Create a `.env` file in the `api/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Backend Locally (Development)
```bash
# In the api/ directory
node index.js
```

The API should be running at `http://localhost:3000` (or the port Vercel assigns).

### 4. Load Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `damnjs_extension/extension/` folder
5. The damn.js extension should now appear in your extensions list

### 5. Configure API Endpoint (Development)
Update the API endpoint in `extension/panel/api-client.js` to point to your local backend:
```javascript
const API_BASE_URL = 'http://localhost:3000'; // Change as needed
```

### 6. Test the Extension
1. Open any webpage in Chrome
2. Open DevTools (`F12` or `Ctrl+Shift+I`)
3. Look for the **damn.js** tab in DevTools
4. Trigger an error on the page (e.g., open console and type: `throw new Error('test')`)
5. The error should appear in the damn.js panel
6. Test the "💡 Explain" and "✨ Spell" buttons

### Development Notes
- **Hot Reload:** After making changes to extension files, click the reload icon on `chrome://extensions/` for the damn.js extension
- **Backend Changes:** Restart the dev server after modifying backend code
- **API Keys:** Never commit your `.env` file. It's included in `.gitignore`
- **CORS:** The backend is configured for development. For production, update CORS settings accordingly

### Troubleshooting
- **Extension not appearing:** Ensure you selected the correct folder (`extension/` not the root)
- **API errors:** Check that your API key is valid and the backend is running
- **No errors showing:** Check browser console for messaging errors between scripts
- **DevTools panel blank:** Refresh the page and reopen DevTools

> **Remember:** This is an experimental project. Setup steps, dependencies, and configuration may change as development progresses.

---

## 📁 Project Structure

> **⚠️ Subject to change** — File structure is being actively developed and may be reorganized
```
damnjs_extension/
│
├── api/                          # Backend (Vercel Serverless)
│   ├── index.js                  # Main Express app
│   ├── package.json              
│   └── handlers/
│       ├── explain.js            # AI error explanation logic
│       └── generatePrompt.js     # Debugging prompt generator
│
├── landing_page/                 # Landing Page (Separate from Extension)
│   ├── Page.html                 # Marketing page for damn.js
│   ├── Page.css                  # Styling
│   ├── vercel.json               # Vercel deployment config
│   └── images/                   # Assets
│
│   **Note:** This is just a landing page for the project.
│   It is NOT part of the browser extension functionality.
│
└── extension/                    # Chrome Extension
    ├── manifest.json             # Extension manifest (V3)
    │
    ├── icons/
    │   ├── icon16.png
    │   ├── icon48.png
    │   └── icon128.png
    │
    ├── scripts/
    │   └── injected.js           # Injected into page (captures errors)
    │
    ├── devtools/
    │   ├── devtools.html         # DevTools entry point
    │   └── devtools.js           # Creates damn.js panel
    │
    ├── content/
    │   └── content.js            # Content script (bridges page → extension)
    │
    └── panel/                    # damn.js Panel UI
        ├── panel.html            # Panel markup
        ├── panel.js              # Core panel logic
        ├── panel.css             # Styling (dark theme)
        ├── api-client.js         # Backend API calls
        └── utils.js              # Helper functions
```

---

## 🗺️ Development Roadmap
> **Note:** Timeline and features are flexible and may change

### **Phase 1 — Error Mirroring Pipeline** (In Progress)
- ✅ Extension architecture
- ✅ Injected script for error capture
- ✅ Content script bridge
- ✅ DevTools panel UI
- ✅ Real-time error display
- ✅ Error filtering

### **Phase 2 — Backend + AI Integration** (In Progress)
- Backend API setup (Vercel + Express)
- OpenAI/Gemini integration (Gemini focused for now)
- Explain endpoint (error explanations)
- Generate-prompt endpoint (spell generator)
- Error context enhancement

### **Phase 3 — Polish & Deployment** (Planned)
- UI/UX refinements
- Production backend deployment
- Chrome Web Store submission
- Testing on real-world sites
- Documentation

### **Future Enhancements** (Exploration)
- Framework-specific error detection (React, Vue, Next.js)
- Stack Overflow integration
- Source map awareness
- Minified code decoding

---

## 📍 Current Progress

**Active Development** — Building the MVP with error mirroring and AI integration.

**What's Working:**
- Extension structure and manifest
- Error capture pipeline (injected script → content script → panel)
- DevTools panel UI with filtering
- Backend API architecture

**What's Next:**
- Complete AI integration
- Test on real-world applications
- Backend deployment to Vercel
- UI polish and refinements

Expect rapid iteration and frequent changes to code structure, features, and architecture.

---

## 🧭 Roadmap
### **Phase 1 — MVP**
- Create DevTools panel  
- Capture selected console error text  
- Connect to backend API  
- Return & display explanation  
- Local history system  

### **Phase 2 — Enhancements**
- Pattern recognition for common errors (CORS, TypeError, 500)  
- Better UI layout  
- Dark mode sync with DevTools  
- Cleaner error parsing  

### **Phase 3 — Exploration**
- Source map awareness (stretch goal)  
- Enhanced context extraction  
- Optional integration with network failures  

---

## 📝 Idea Series Note
This repository belongs to my **Idea Series** — a personal collection of projects that originate from sudden sparks of inspiration.  
documenting them keeps the ideas alive and allows them to grow into something real over time.

damn.js emerged from debugging experiences during hackathons and everyday development where console errors slowed down productivity.

---

## ⚡ Current Status
The project is under **active development** and continuous improvement. 
Features and structure may evolve as development progresses.

---
