# damn.js — DevTools Error Insight Assistant  
_A part of my **Idea Series**_

![Status](https://img.shields.io/badge/status-under_development-yellow)
![Category](https://img.shields.io/badge/type-devtools_extension-blue)
![Stage](https://img.shields.io/badge/stage-idea_to_mvp-purple)
![License](https://img.shields.io/badge/license-undecided-lightgrey)

---

## 🚀 Overview
**damn.js** is a Chrome DevTools extension built to make debugging easier and more intuitive.  
It does **not** auto-fix your errors.  
It simply helps you gain a clearer understanding of what went wrong — right inside the DevTools environment.

Developers often switch between:
- Console  
- Search engines  
- ChatGPT/Claude  
- Server logs  
- Docs  

The goal here is to reduce friction by providing contextual error insight **directly inside DevTools**, next to the errors themselves.

---

## 🎯 Purpose
> **Place error explanations exactly where errors appear — inside the browser DevTools.**

This significantly reduces context switching and helps developers quickly reason about issues without leaving the console.

damn.js is meant to be an assistive debugging tool, not a replacement for developer judgment or IDE tooling.

---

## 🧩 Core Idea
- A **custom DevTools panel** (`damn.js`) appears alongside Console.  
- Clicking a console error auto-loads the message and stack trace into the panel.  
- Developers can hit the **Explain** button to get a concise, contextual description of the error.  
- A backend endpoint provides the explanation, powered by an LLM.  
- The developer uses this insight to debug faster.

It focuses on **clarity**, not automation.

---

## 🚧 Development Status
![Progress](https://img.shields.io/badge/phase-concept_&_planning-orange)

This project is **actively being shaped**, and features may:
- evolve  
- be modified  
- be added or removed  
- be completely restructured as development continues  

The main goal right now is to establish a solid MVP foundation.

---

## 🔍 MVP Feature Set
**Planned for the first working version:**

### ✔ DevTools Panel  
A lightweight UI loaded inside Chrome DevTools.

### ✔ Error Auto-Capture  
When an error is selected in the console, its message/stack trace is automatically injected into the damn.js panel.

### ✔ Explanation Engine  
A backend endpoint receives the error and returns a human-readable explanation.

### ✔ Minimal UI  
Textbox → Explain → Output section.  
Simple, consistent, and distraction-free.

### ✔ Local History  
Recent explanations stored locally for quick reference.

---

## 🛠️ Tech Stack (Planned)
**Extension:**
- HTML  
- CSS  
- Vanilla JavaScript  
- Manifest V3  
- Chrome DevTools APIs  
- chrome.runtime messaging  

**Backend:**
- Node.js or Cloudflare Worker  
- Secure LLM API integration  
- Error cleanup and formatting layer  

---

## 📂 Project Structure (Planned)

# DamnJS Extension

## Project Structure
```
damnjs-extension/
│
├── manifest.json
├── devtools/
│   ├── devtools.html
│   ├── devtools.js
│
├── panel/
│   ├── panel.html
│   ├── panel.js
│   ├── panel.css
│
├── background/
│   ├── service-worker.js
│
└── icons/
```

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
The project is in the **concept and planning** stage.  
Development will start soon, and the structure or feature list may evolve as the idea matures.

---

