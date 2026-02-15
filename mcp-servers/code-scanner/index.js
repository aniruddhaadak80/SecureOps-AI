import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

const server = new McpServer({
    name: "secureops-code-scanner",
    version: "1.0.0",
});

// ============ Security Patterns ============
const SECURITY_PATTERNS = [
    {
        id: "hardcoded-secret",
        name: "Hardcoded Secret",
        severity: "critical",
        patterns: [
            /(?:aws_secret_access_key|aws_secret_key)\s*[=:]\s*['"][A-Za-z0-9/+=]{20,}['"]/gi,
            /(?:api_key|apikey|api_secret)\s*[=:]\s*['"][A-Za-z0-9]{16,}['"]/gi,
            /(?:password|passwd|pwd)\s*[=:]\s*['"][^'"]{4,}['"]/gi,
            /(?:private_key|secret_key|access_token)\s*[=:]\s*['"][A-Za-z0-9/+=_-]{16,}['"]/gi,
            /ghp_[A-Za-z0-9]{36}/g,
            /sk-[A-Za-z0-9]{32,}/g,
        ],
        description: "Hardcoded credentials or API keys found in source code",
        remediation: "Move secrets to environment variables or a secrets manager",
    },
    {
        id: "sql-injection",
        name: "SQL Injection",
        severity: "critical",
        patterns: [
            /(?:query|execute|raw)\s*\(\s*['"`].*\$\{/gi,
            /(?:query|execute|raw)\s*\(\s*['"`].*\+\s*(?:req|request|params|query|body)/gi,
            /\.query\s*\(\s*`[^`]*\$\{/gi,
        ],
        description: "User input directly concatenated into SQL queries",
        remediation: "Use parameterized queries or an ORM",
    },
    {
        id: "xss",
        name: "Cross-Site Scripting (XSS)",
        severity: "high",
        patterns: [
            /dangerouslySetInnerHTML/gi,
            /innerHTML\s*=/gi,
            /document\.write\s*\(/gi,
            /\.html\s*\(\s*(?:req|request|params|query|body|user)/gi,
        ],
        description: "User-supplied content rendered without sanitization",
        remediation: "Sanitize user input with DOMPurify or similar library",
    },
    {
        id: "insecure-crypto",
        name: "Insecure Cryptography",
        severity: "high",
        patterns: [
            /createHash\s*\(\s*['"]md5['"]\)/gi,
            /createHash\s*\(\s*['"]sha1['"]\)/gi,
            /Math\.random\s*\(/g,
        ],
        description: "Use of weak cryptographic algorithms or PRNG",
        remediation: "Use SHA-256+ for hashing and crypto.randomBytes for randomness",
    },
    {
        id: "open-redirect",
        name: "Open Redirect",
        severity: "medium",
        patterns: [
            /res\.redirect\s*\(\s*(?:req|request)\.(?:query|params|body)/gi,
            /location\.href\s*=\s*(?:req|request|params|query)/gi,
            /window\.location\s*=\s*(?:req|request|params|query)/gi,
        ],
        description: "Unvalidated redirect based on user input",
        remediation: "Validate redirect URLs against an allowlist",
    },
    {
        id: "eval-usage",
        name: "Dangerous eval() Usage",
        severity: "high",
        patterns: [
            /\beval\s*\(/g,
            /new\s+Function\s*\(/g,
            /setTimeout\s*\(\s*['"`]/g,
        ],
        description: "Dynamic code execution that may lead to code injection",
        remediation: "Avoid eval() and use safe alternatives",
    },
    {
        id: "missing-auth",
        name: "Missing Authentication Check",
        severity: "medium",
        patterns: [
            /app\.(?:get|post|put|delete|patch)\s*\(\s*['"]\/admin/gi,
            /router\.(?:get|post|put|delete|patch)\s*\(\s*['"]\/api\/.*['"],\s*(?:async\s*)?\(/gi,
        ],
        description: "API endpoint potentially missing authentication middleware",
        remediation: "Add authentication middleware before route handlers",
    },
    {
        id: "info-exposure",
        name: "Information Exposure",
        severity: "low",
        patterns: [
            /console\.log\s*\(\s*(?:.*password|.*secret|.*key|.*token)/gi,
            /stack\s*:\s*(?:err|error)\.stack/gi,
        ],
        description: "Sensitive information potentially exposed in logs or responses",
        remediation: "Remove sensitive data from logs and error responses in production",
    },
];

const SCAN_EXTENSIONS = [
    ".js", ".ts", ".jsx", ".tsx", ".py", ".rb", ".java",
    ".go", ".php", ".cs", ".vue", ".svelte",
];

// ============ Tools ============

server.tool(
    "scan_repository",
    "Scan an entire repository directory for security vulnerabilities, hardcoded secrets, and insecure code patterns",
    {
        directory: z.string().describe("Absolute path to the repository directory to scan"),
        extensions: z.array(z.string()).optional().describe("File extensions to scan (default: common source files)"),
        maxDepth: z.number().optional().describe("Maximum directory depth to scan (default: 10)"),
    },
    async ({ directory, extensions, maxDepth }) => {
        const exts = extensions || SCAN_EXTENSIONS;
        const depth = maxDepth || 10;
        const findings = [];
        let filesScanned = 0;

        function scanDir(dir, currentDepth) {
            if (currentDepth > depth) return;
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        scanDir(fullPath, currentDepth + 1);
                    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
                        try {
                            const content = fs.readFileSync(fullPath, "utf-8");
                            const lines = content.split("\n");
                            filesScanned++;

                            for (const pattern of SECURITY_PATTERNS) {
                                for (const regex of pattern.patterns) {
                                    regex.lastIndex = 0;
                                    let match;
                                    while ((match = regex.exec(content)) !== null) {
                                        const lineNum = content.substring(0, match.index).split("\n").length;
                                        findings.push({
                                            id: `${pattern.id}-${findings.length + 1}`,
                                            rule: pattern.id,
                                            name: pattern.name,
                                            severity: pattern.severity,
                                            file: path.relative(directory, fullPath),
                                            line: lineNum,
                                            column: match.index - content.lastIndexOf("\n", match.index),
                                            snippet: lines[lineNum - 1]?.trim().substring(0, 120) || "",
                                            description: pattern.description,
                                            remediation: pattern.remediation,
                                        });
                                    }
                                }
                            }
                        } catch { /* skip unreadable files */ }
                    }
                }
            } catch { /* skip inaccessible dirs */ }
        }

        scanDir(directory, 0);

        const summary = {
            filesScanned,
            totalFindings: findings.length,
            critical: findings.filter((f) => f.severity === "critical").length,
            high: findings.filter((f) => f.severity === "high").length,
            medium: findings.filter((f) => f.severity === "medium").length,
            low: findings.filter((f) => f.severity === "low").length,
        };

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ summary, findings }, null, 2),
                },
            ],
        };
    }
);

server.tool(
    "scan_file",
    "Scan a single file for security vulnerabilities",
    {
        filePath: z.string().describe("Absolute path to the file to scan"),
    },
    async ({ filePath }) => {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        const findings = [];

        for (const pattern of SECURITY_PATTERNS) {
            for (const regex of pattern.patterns) {
                regex.lastIndex = 0;
                let match;
                while ((match = regex.exec(content)) !== null) {
                    const lineNum = content.substring(0, match.index).split("\n").length;
                    findings.push({
                        rule: pattern.id,
                        name: pattern.name,
                        severity: pattern.severity,
                        line: lineNum,
                        snippet: lines[lineNum - 1]?.trim().substring(0, 120) || "",
                        description: pattern.description,
                        remediation: pattern.remediation,
                    });
                }
            }
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        file: filePath,
                        totalFindings: findings.length,
                        findings,
                    }, null, 2),
                },
            ],
        };
    }
);

server.tool(
    "list_security_rules",
    "List all available security scanning rules and their descriptions",
    {},
    async () => {
        const rules = SECURITY_PATTERNS.map((p) => ({
            id: p.id,
            name: p.name,
            severity: p.severity,
            description: p.description,
            remediation: p.remediation,
            patternCount: p.patterns.length,
        }));

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ totalRules: rules.length, rules }, null, 2),
                },
            ],
        };
    }
);

// ============ Start Server ============
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SecureOps Code Scanner MCP server running on stdio");
}

main().catch(console.error);
