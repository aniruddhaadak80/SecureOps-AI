# 🛡️ SecureOps AI — Multi-Agent DevSecOps Pipeline

> **4 AI-powered MCP agents** that scan, audit, analyze, and auto-remediate security vulnerabilities in your codebase — orchestrated and governed through **[Archestra](https://archestra.ai)**.

Built for the **[2 Fast 2 MCP](https://www.wemakedevs.org/hackathons/2fast2mcp)** hackathon by WeMakeDevs.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SecureOps AI Dashboard                       │
│         (React + TypeScript • Real-time Pipeline View)          │
└──────────────┬──────────────────────────────────────────────────┘
               │ MCP Gateway
┌──────────────┴──────────────────────────────────────────────────┐
│                   Archestra Platform                            │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │ Registry │ │Orchestrator│ │ Security │ │  Observability  │  │
│  │          │ │   (K8s)   │ │ (DualLLM)│ │  (Traces/Logs)  │  │
│  └──────────┘ └───────────┘ └──────────┘ └─────────────────┘  │
│  ┌──────────┐ ┌───────────┐                                    │
│  │Cost Mgmt │ │MCP Gateway│                                    │
│  └──────────┘ └───────────┘                                    │
└──────────────┬──────────────────────────────────────────────────┘
               │
   ┌───────────┼──────────────────────────────────────┐
   │           │                                       │
   ▼           ▼              ▼                        ▼
┌────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐
│  Code  │ │   Dep    │ │   Vuln    │ │   Remediation    │
│Scanner │ │ Auditor  │ │ Analyzer  │ │     Agent        │
│ (MCP)  │ │  (MCP)   │ │  (MCP)    │ │     (MCP)        │
└────────┘ └──────────┘ └───────────┘ └──────────────────┘
```

---

## 🚀 Quick Start

### 1. Run the Dashboard

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/SecureOps-AI.git
cd SecureOps-AI
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the dashboard.

### 2. Run with Archestra (Docker)

```bash
# Start Archestra + all 4 MCP servers
docker compose up -d

# Dashboard: http://localhost:3000
# API:       http://localhost:9000
```

### 3. Use MCP Servers Standalone

Each MCP server can be run independently:

```bash
# Install deps for a server
cd mcp-servers/code-scanner
npm install

# Run it
node index.js
```

### 4. Register with Claude or other MCP clients

Use the `mcp-config.json` to add all 4 servers:

```json
{
  "mcpServers": {
    "secureops-code-scanner": {
      "command": "node",
      "args": ["mcp-servers/code-scanner/index.js"]
    },
    "secureops-dependency-auditor": {
      "command": "node",
      "args": ["mcp-servers/dependency-auditor/index.js"]
    },
    "secureops-vuln-analyzer": {
      "command": "node",
      "args": ["mcp-servers/vuln-analyzer/index.js"]
    },
    "secureops-remediation": {
      "command": "node",
      "args": ["mcp-servers/remediation/index.js"]
    }
  }
}
```

---

## 🤖 MCP Servers

### 1. Code Scanner (`secureops-code-scanner`)

Scans repositories for security vulnerabilities using regex-based pattern matching.

| Tool | Description |
|------|-------------|
| `scan_repository` | Scan entire repo for secrets, SQLi, XSS, and 8+ patterns |
| `scan_file` | Scan a single file |
| `list_security_rules` | List all available scanning rules |

**Detects:** Hardcoded secrets, SQL injection, XSS, insecure crypto, open redirects, eval() usage, missing auth, info exposure.

### 2. Dependency Auditor (`secureops-dependency-auditor`)

Audits project dependencies against known CVE databases.

| Tool | Description |
|------|-------------|
| `audit_npm` | Audit npm dependencies from package.json |
| `audit_python` | Audit Python deps from requirements.txt |
| `check_cve` | Look up a specific CVE identifier |

### 3. Vulnerability Analyzer (`secureops-vuln-analyzer`)

Deep analysis with CVSS scoring and business impact assessment.

| Tool | Description |
|------|-------------|
| `analyze_vulnerability` | CVSS scoring, attack scenarios, compliance impact |
| `risk_score` | Calculate overall security risk score |
| `impact_assessment` | Assess exploitation impact by environment |

### 4. Remediation Agent (`secureops-remediation`)

Auto-generates fix suggestions with before/after code examples.

| Tool | Description |
|------|-------------|
| `suggest_fix` | Detailed fix with code examples |
| `generate_patch` | Generate unified diff patch |
| `prioritize_fixes` | Prioritized remediation order |

---

## 📊 Dashboard Features

- **🔄 Pipeline View** — Animated 4-stage agent pipeline (Scan → Audit → Analyze → Fix)
- **🎯 Security Score** — Animated ring chart with overall score
- **🚨 Vulnerability Table** — Sortable table with severity badges and status tracking
- **🗺️ Heatmap** — Severity distribution across file categories
- **📡 Agent Trace** — Real-time activity log from all 4 agents
- **💰 Cost Monitor** — Archestra cost tracking with budget bars
- **🌙 Dark Theme** — Cyberpunk-inspired glassmorphism design

---

## 🏁 Archestra Integration

SecureOps AI leverages these Archestra platform features:

| Feature | How We Use It |
|---------|---------------|
| **Private MCP Registry** | Register all 4 MCP servers org-wide |
| **MCP Orchestrator** | Run servers in Kubernetes with managed state |
| **Security Sub-agents** | Dual LLM prevents prompt injection in scanning |
| **Dynamic Tools** | Prevent data exfiltration from scanned repos |
| **Cost Monitoring** | Per-scan budget limits + dynamic optimization |
| **Observability** | Traces, logs, and metrics for all agent activity |
| **MCP Gateway** | Expose the full pipeline as a single API endpoint |

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **MCP Servers:** Node.js + `@modelcontextprotocol/sdk`
- **Orchestration:** Archestra Platform
- **Containerization:** Docker + Docker Compose
- **Styling:** Custom CSS with glassmorphism + dark theme

---

## 📁 Project Structure

```
SecureOps-AI/
├── src/                       # React dashboard
│   ├── components/            # UI components
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── SecurityScoreRing.tsx
│   │   ├── PipelineView.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── VulnerabilityTable.tsx
│   │   ├── HeatmapSection.tsx
│   │   ├── AgentTraceViewer.tsx
│   │   ├── CostMonitor.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   └── mockData.ts        # Dashboard demo data
│   ├── App.tsx
│   ├── App.css
│   ├── index.css              # Design system
│   └── main.tsx
├── mcp-servers/
│   ├── code-scanner/          # Security pattern scanner
│   ├── dependency-auditor/    # CVE dependency checker
│   ├── vuln-analyzer/         # CVSS scoring engine
│   └── remediation/           # Auto-fix generator
├── docker-compose.yml         # Archestra + MCP servers
├── mcp-config.json            # MCP client configuration
└── README.md
```

---

## 📜 License

MIT — Built with ❤️ for the **2 Fast 2 MCP** hackathon.
