import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

const server = new McpServer({
    name: "secureops-dependency-auditor",
    version: "1.0.0",
});

// ============ Known Vulnerable Packages Database ============
const VULN_DB = {
    "lodash": {
        affectedVersions: ["<4.17.21"],
        vulnerabilities: [
            {
                cve: "CVE-2020-8203",
                severity: "high",
                cvss: 7.4,
                title: "Prototype Pollution",
                description: "lodash before 4.17.21 is vulnerable to Prototype Pollution via merge, mergeWith, and defaultsDeep functions.",
                fixVersion: "4.17.21",
            },
            {
                cve: "CVE-2021-23337",
                severity: "high",
                cvss: 7.2,
                title: "Command Injection via template",
                description: "lodash versions before 4.17.21 are vulnerable to Command Injection via the template function.",
                fixVersion: "4.17.21",
            },
        ],
    },
    "express": {
        affectedVersions: ["<4.21.0"],
        vulnerabilities: [
            {
                cve: "CVE-2024-29041",
                severity: "medium",
                cvss: 6.5,
                title: "Open Redirect",
                description: "Express.js before 4.21.0 allows open redirect via malicious URL.",
                fixVersion: "4.21.0",
            },
        ],
    },
    "axios": {
        affectedVersions: ["<1.6.0"],
        vulnerabilities: [
            {
                cve: "CVE-2023-45857",
                severity: "medium",
                cvss: 6.1,
                title: "CSRF Token Exposure",
                description: "axios before 1.6.0 may expose CSRF tokens via cross-site requests.",
                fixVersion: "1.6.0",
            },
        ],
    },
    "jsonwebtoken": {
        affectedVersions: ["<9.0.0"],
        vulnerabilities: [
            {
                cve: "CVE-2022-23529",
                severity: "critical",
                cvss: 9.8,
                title: "Insecure Key Handling",
                description: "jsonwebtoken before 9.0.0 allows attackers to forge tokens via key confusion.",
                fixVersion: "9.0.0",
            },
        ],
    },
    "minimist": {
        affectedVersions: ["<1.2.6"],
        vulnerabilities: [
            {
                cve: "CVE-2021-44906",
                severity: "critical",
                cvss: 9.8,
                title: "Prototype Pollution",
                description: "minimist before 1.2.6 is vulnerable to Prototype Pollution.",
                fixVersion: "1.2.6",
            },
        ],
    },
    "node-fetch": {
        affectedVersions: ["<2.6.7"],
        vulnerabilities: [
            {
                cve: "CVE-2022-0235",
                severity: "medium",
                cvss: 6.1,
                title: "Exposure of Sensitive Information",
                description: "node-fetch before 2.6.7 may forward authorization headers to third-party domains on redirect.",
                fixVersion: "2.6.7",
            },
        ],
    },
    "tar": {
        affectedVersions: ["<6.1.9"],
        vulnerabilities: [
            {
                cve: "CVE-2021-37713",
                severity: "high",
                cvss: 8.6,
                title: "Arbitrary File Creation/Overwrite",
                description: "tar before 6.1.9 is vulnerable to arbitrary file creation/overwrite via insufficient symlink protection.",
                fixVersion: "6.1.9",
            },
        ],
    },
    "shell-quote": {
        affectedVersions: ["<1.7.3"],
        vulnerabilities: [
            {
                cve: "CVE-2021-42740",
                severity: "critical",
                cvss: 9.8,
                title: "Command Injection",
                description: "shell-quote before 1.7.3 is vulnerable to command injection via malicious input.",
                fixVersion: "1.7.3",
            },
        ],
    },
};

function compareVersions(current, required) {
    // Simple version comparison: check if current < required
    const c = current.replace(/[^0-9.]/g, "").split(".").map(Number);
    const r = required.replace(/[^0-9.<>=]/g, "").split(".").map(Number);
    for (let i = 0; i < Math.max(c.length, r.length); i++) {
        const cv = c[i] || 0;
        const rv = r[i] || 0;
        if (cv < rv) return true;
        if (cv > rv) return false;
    }
    return false;
}

// ============ Tools ============

server.tool(
    "audit_npm",
    "Audit npm dependencies in a project by reading its package.json for known vulnerabilities",
    {
        projectDir: z.string().describe("Absolute path to the project directory containing package.json"),
    },
    async ({ projectDir }) => {
        const pkgPath = path.join(projectDir, "package.json");
        if (!fs.existsSync(pkgPath)) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "package.json not found" }) }],
            };
        }

        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const allDeps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
        };

        const vulnerablePackages = [];
        const safePackages = [];

        for (const [name, version] of Object.entries(allDeps)) {
            const cleanVersion = String(version).replace(/[\^~>=<]/g, "");
            if (VULN_DB[name]) {
                const entry = VULN_DB[name];
                const fixVersion = entry.vulnerabilities[0].fixVersion;
                if (compareVersions(cleanVersion, fixVersion)) {
                    vulnerablePackages.push({
                        package: name,
                        currentVersion: cleanVersion,
                        vulnerabilities: entry.vulnerabilities,
                        fixVersion,
                    });
                } else {
                    safePackages.push({ package: name, version: cleanVersion });
                }
            } else {
                safePackages.push({ package: name, version: cleanVersion });
            }
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        summary: {
                            totalDependencies: Object.keys(allDeps).length,
                            vulnerableCount: vulnerablePackages.length,
                            safeCount: safePackages.length,
                        },
                        vulnerablePackages,
                    }, null, 2),
                },
            ],
        };
    }
);

server.tool(
    "audit_python",
    "Audit Python dependencies from a requirements.txt file for known vulnerabilities",
    {
        requirementsPath: z.string().describe("Absolute path to the requirements.txt file"),
    },
    async ({ requirementsPath }) => {
        if (!fs.existsSync(requirementsPath)) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "requirements.txt not found" }) }],
            };
        }

        const content = fs.readFileSync(requirementsPath, "utf-8");
        const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
        const deps = lines.map((l) => {
            const match = l.match(/^([a-zA-Z0-9_-]+)\s*[=<>!]*\s*([\d.]*)/);
            return match ? { name: match[1], version: match[2] || "unknown" } : null;
        }).filter(Boolean);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        totalDependencies: deps.length,
                        dependencies: deps,
                        note: "Python dependency auditing uses a limited local DB. For comprehensive analysis, combine with pip-audit or safety.",
                    }, null, 2),
                },
            ],
        };
    }
);

server.tool(
    "check_cve",
    "Look up details for a specific CVE identifier in the local vulnerability database",
    {
        cveId: z.string().describe("CVE identifier (e.g., CVE-2020-8203)"),
    },
    async ({ cveId }) => {
        const results = [];
        for (const [pkg, entry] of Object.entries(VULN_DB)) {
            for (const vuln of entry.vulnerabilities) {
                if (vuln.cve.toLowerCase() === cveId.toLowerCase()) {
                    results.push({ package: pkg, ...vuln });
                }
            }
        }

        return {
            content: [
                {
                    type: "text",
                    text: results.length > 0
                        ? JSON.stringify({ cve: cveId, matches: results }, null, 2)
                        : JSON.stringify({ cve: cveId, message: "CVE not found in local database" }),
                },
            ],
        };
    }
);

// ============ Start Server ============
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SecureOps Dependency Auditor MCP server running on stdio");
}

main().catch(console.error);
