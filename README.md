# 🛡️ SecureOps AI — Privacy-First DevSecOps Pipeline

> **4 Local MCP Agents** that scan, audit, analyze, and auto-remediate security vulnerabilities in your codebase without sending a single line of code to the cloud.

Built for the **[2 Fast 2 MCP](https://www.wemakedevs.org/hackathons/2fast2mcp)** hackathon.

---

## 🌟 Why SecureOps AI?

Most security tools are wrappers around cloud APIs (OpenAI/Gemini). **SecureOps AI is different.**
*   **🔒 100% Private:** Runs entirely on `localhost`. Your code never leaves your machine.
*   **⚡ Blazing Fast:** Scans typically finish in < 5 seconds.
*   **💸 Free Forever:** No API keys, no tokens, no credit cards.
*   **🔌 MCP Native:** Built on the **Model Context Protocol**, meaning our agents are compatible with Claude Desktop, Cursor, and Archestra.

---

## 🏗️ Architecture

We replaced the "Mock Data" with a **Real Local Intelligence Backend**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SecureOps AI Dashboard                       │
│         (React + TypeScript • Real-time Interactive UI)         │
└──────────────┬──────────────────────────────────────────────────┘
               │  REST API (localhost:3001)
┌──────────────▼──────────────────────────────────────────────────┐
│                   Local Node.js Backend Server                  │
│       (Orchestrates the 4 Agents on your file system)           │
└──────────────┬──────────────────────────────────────────────────┘
               │  MCP Protocol
   ┌───────────┼──────────────────────────────────────┐
   ▼           ▼              ▼                        ▼
┌────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐
│  Code  │ │   Dep    │ │   Vuln    │ │   Remediation    │
│Scanner │ │ Auditor  │ │ Analyzer  │ │     Agent        │
│ (Regex)│ │ (CVE DB) │ │ (CVSS)    │ │   (Heuristic)    │
└────────┘ └──────────┘ └───────────┘ └──────────────────┘
```

---

## 🚀 Interactive Demo

### 1. Prerequisites
- Node.js (v18+)
- Git installed (for cloning repos)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/aniruddhaadak80/SecureOps-AI.git
cd SecureOps-AI

# Install dependencies for Frontend, Backend, and Agents
npm install
```

### 3. Run the App
You need two terminals (or use a split terminal):

**Terminal 1: Backend API**
```bash
npm run server
# Starts the scanning engine on http://localhost:3001
# You should see: 🛡️ SecureOps AI API running...
```

**Terminal 2: Frontend Dashboard**
```bash
npm run dev
# Starts the UI on http://localhost:5173
```

### 4. Use It!
1. Open **[http://localhost:5173](http://localhost:5173)**
2. Click **"New Scan"**.
3. **Option A:** Enter a local path (e.g., `C:\Users\You\Project`).
4. **Option B:** Enter a **GitHub URL** (e.g., `https://github.com/facebook/react`).
5. Watch the agents clone, scan, and analyze in real-time!

---

## 🤖 The 4 MCP Agents

### 1. Code Scanner (`code-scanner`)
Scans source code for dangerous patterns using advanced regex and AST logic.
- **Detects:** Hardcoded Secrets (`AWS_KEY`), SQL Injection, XSS, `eval()`, weak crypto.
- **Supports:** JS, TS, Python, Go, Java, PHP, Ruby.

### 2. Dependency Auditor (`dependency-auditor`)
Checks your `package.json` or `requirements.txt` against a local CVE database.
- **Detects:** Known vulnerable versions of `lodash`, `express`, `axios`, etc.

### 3. Vulnerability Analyzer (`vuln-analyzer`)
Calculates **Risk Scores** (CVSS) and business impact.
- **Logic:** `Risk = Severity * Impact * Exploitability`.

### 4. Remediation Agent (`remediation`)
Auto-generates fix suggestions.
- **Features:** Provides specific code patches (e.g., "Change `md5` to `sha256`").

---

## 📁 Project Structure

```
SecureOps-AI/
├── server/                    # Express.js Backend (The Brain)
│   ├── index.js               # Main API & Agent Orchestration
│   └── temp_scans/            # Temp folder for GitHub clones
├── src/                       # React Frontend
│   ├── components/            # Dashboard UI Components
│   └── App.tsx                # Main Logic
├── mcp-servers/               # The 4 MCP Agents
│   ├── code-scanner/
│   ├── dependency-auditor/
│   ├── vuln-analyzer/
│   └── remediation/
└── README.md
```

---

## 🏆 Hackathon Context
This project was built for **2 Fast 2 MCP**.
- **Challenge:** Use the Model Context Protocol.
- **Our Twist:** We used MCP to build a **Local-First**, **Privacy-Centric** security tool that solves a real enterprise problem (uploading code to the cloud).

---

## 📜 License
MIT
