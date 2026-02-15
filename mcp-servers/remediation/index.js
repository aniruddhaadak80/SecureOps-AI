import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "secureops-remediation",
    version: "1.0.0",
});

// ============ Fix Templates ============
const FIX_TEMPLATES = {
    "hardcoded-secret": {
        title: "Move Secrets to Environment Variables",
        steps: [
            "1. Create a .env file in project root (add to .gitignore)",
            "2. Move the hardcoded secret value to .env",
            "3. Update the source file to read from process.env",
            "4. Add the variable to your deployment environment (Archestra, CI/CD, etc.)",
            "5. Rotate the exposed key/secret immediately",
        ],
        before: `// ❌ INSECURE: Hardcoded secret
const AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE";
const client = new S3Client({ credentials: { secretAccessKey: AWS_SECRET_KEY } });`,
        after: `// ✅ SECURE: Read from environment
const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
if (!AWS_SECRET_KEY) throw new Error("AWS_SECRET_ACCESS_KEY not set");
const client = new S3Client({ credentials: { secretAccessKey: AWS_SECRET_KEY } });`,
        envExample: `# .env
AWS_SECRET_ACCESS_KEY=your-secret-key-here`,
        gitignoreAdd: ".env\n.env.local\n.env.*.local",
        priority: "immediate",
        effort: "low",
    },
    "sql-injection": {
        title: "Use Parameterized Queries",
        steps: [
            "1. Replace string concatenation with parameterized queries",
            "2. Use the database driver's built-in parameterization",
            "3. Validate and sanitize input types",
            "4. Consider using an ORM for complex queries",
        ],
        before: `// ❌ INSECURE: String concatenation
const query = \`SELECT * FROM users WHERE id = '\${req.params.id}'\`;
db.query(query);`,
        after: `// ✅ SECURE: Parameterized query
const query = "SELECT * FROM users WHERE id = $1";
db.query(query, [req.params.id]);`,
        priority: "immediate",
        effort: "medium",
    },
    "xss": {
        title: "Sanitize User-Supplied HTML",
        steps: [
            "1. Install DOMPurify: npm install dompurify",
            "2. Sanitize all user-supplied content before rendering",
            "3. Prefer textContent over innerHTML when possible",
            "4. Use React's built-in escaping (avoid dangerouslySetInnerHTML)",
        ],
        before: `// ❌ INSECURE: Unsanitized HTML
<div dangerouslySetInnerHTML={{ __html: userComment }} />`,
        after: `// ✅ SECURE: Sanitized HTML
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />

// OR even better: use plain text
<div>{userComment}</div>`,
        priority: "high",
        effort: "low",
    },
    "insecure-crypto": {
        title: "Upgrade Cryptographic Algorithms",
        steps: [
            "1. Replace MD5/SHA1 with SHA-256 or better",
            "2. Replace Math.random() with crypto.randomBytes()",
            "3. For passwords, use bcrypt with 12+ salt rounds",
            "4. Audit all crypto usage in the codebase",
        ],
        before: `// ❌ INSECURE: Weak hash + PRNG
const hash = crypto.createHash('md5').update(data).digest('hex');
const token = Math.random().toString(36);`,
        after: `// ✅ SECURE: Strong hash + CSPRNG
import crypto from 'crypto';
const hash = crypto.createHash('sha256').update(data).digest('hex');
const token = crypto.randomBytes(32).toString('hex');`,
        priority: "high",
        effort: "low",
    },
    "open-redirect": {
        title: "Validate Redirect URLs",
        steps: [
            "1. Create an allowlist of valid redirect destinations",
            "2. Validate the redirect URL against the allowlist",
            "3. Use relative paths instead of absolute URLs when possible",
            "4. Never use user input directly as redirect target",
        ],
        before: `// ❌ INSECURE: Unvalidated redirect
app.get('/login', (req, res) => {
  res.redirect(req.query.returnTo);
});`,
        after: `// ✅ SECURE: Validated redirect
const ALLOWED_ORIGINS = ['https://myapp.com', 'https://app.myapp.com'];

app.get('/login', (req, res) => {
  const returnTo = req.query.returnTo || '/';
  try {
    const url = new URL(returnTo, 'https://myapp.com');
    if (!ALLOWED_ORIGINS.includes(url.origin)) {
      return res.redirect('/');
    }
    res.redirect(url.pathname);
  } catch {
    res.redirect('/');
  }
});`,
        priority: "medium",
        effort: "low",
    },
    "eval-usage": {
        title: "Remove Dynamic Code Execution",
        steps: [
            "1. Replace eval() with safe alternatives (JSON.parse, etc.)",
            "2. Replace new Function() with proper function definitions",
            "3. Use structured data instead of code strings",
            "4. If dynamic evaluation is truly needed, use a sandboxed environment",
        ],
        before: `// ❌ INSECURE: Dynamic code execution
const result = eval(userExpression);
const fn = new Function('x', userCode);`,
        after: `// ✅ SECURE: Safe alternatives
// For JSON parsing:
const result = JSON.parse(userInput);

// For math expressions, use a safe parser:
// npm install mathjs
import { evaluate } from 'mathjs';
const result = evaluate(userExpression);`,
        priority: "high",
        effort: "medium",
    },
    "missing-auth": {
        title: "Add Authentication Middleware",
        steps: [
            "1. Create an authentication middleware function",
            "2. Apply it to all protected routes",
            "3. Implement role-based access control for admin routes",
            "4. Add tests to verify auth is enforced",
        ],
        before: `// ❌ INSECURE: No auth check
app.get('/api/admin/users', async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});`,
        after: `// ✅ SECURE: Auth middleware applied
import { requireAuth, requireRole } from './middleware/auth';

app.get('/api/admin/users', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});`,
        priority: "high",
        effort: "medium",
    },
    "info-exposure": {
        title: "Remove Sensitive Information from Outputs",
        steps: [
            "1. Remove stack traces from production error responses",
            "2. Scrub sensitive values from log statements",
            "3. Use structured logging with redaction",
            "4. Configure NODE_ENV-aware error handlers",
        ],
        before: `// ❌ INSECURE: Stack trace exposed
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});`,
        after: `// ✅ SECURE: Generic error in production
app.use((err, req, res, next) => {
  console.error(err); // Log for debugging (server-side only)
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message,
  });
});`,
        priority: "low",
        effort: "low",
    },
};

// ============ Tools ============

server.tool(
    "suggest_fix",
    "Generate a detailed fix suggestion for a specific vulnerability type, including before/after code examples",
    {
        vulnType: z.string().describe("Vulnerability type (e.g., hardcoded-secret, sql-injection, xss)"),
        file: z.string().optional().describe("File path where the vulnerability was found"),
        line: z.number().optional().describe("Line number of the vulnerability"),
    },
    async ({ vulnType, file, line }) => {
        const template = FIX_TEMPLATES[vulnType];
        if (!template) {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        vulnType,
                        message: `No fix template for '${vulnType}'. Available: ${Object.keys(FIX_TEMPLATES).join(", ")}`,
                    }),
                }],
            };
        }

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    fix: {
                        vulnType,
                        title: template.title,
                        file,
                        line,
                        priority: template.priority,
                        effort: template.effort,
                        steps: template.steps,
                        codeExample: {
                            before: template.before,
                            after: template.after,
                        },
                        ...(template.envExample && { envExample: template.envExample }),
                        ...(template.gitignoreAdd && { gitignoreAdd: template.gitignoreAdd }),
                    },
                }, null, 2),
            }],
        };
    }
);

server.tool(
    "generate_patch",
    "Generate a unified diff patch for a vulnerability fix",
    {
        vulnType: z.string().describe("Vulnerability type"),
        originalCode: z.string().describe("The original vulnerable code"),
        file: z.string().optional().describe("File path for the patch"),
    },
    async ({ vulnType, originalCode, file }) => {
        const template = FIX_TEMPLATES[vulnType];
        if (!template) {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ error: `No fix template for '${vulnType}'` }),
                }],
            };
        }

        const patch = `--- a/${file || "file"}
+++ b/${file || "file"}
@@ -1,${originalCode.split("\n").length} +1,${template.after.split("\n").length} @@
${originalCode.split("\n").map((l) => `- ${l}`).join("\n")}
${template.after.split("\n").map((l) => `+ ${l}`).join("\n")}`;

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    patch: {
                        vulnType,
                        file,
                        diff: patch,
                        instructions: template.steps,
                    },
                }, null, 2),
            }],
        };
    }
);

server.tool(
    "prioritize_fixes",
    "Given a list of vulnerability types, return a prioritized remediation order based on severity and effort",
    {
        vulnTypes: z.array(z.string()).describe("Array of vulnerability types to prioritize"),
    },
    async ({ vulnTypes }) => {
        const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
        const effortOrder = { low: 0, medium: 1, high: 2 };

        const items = vulnTypes
            .map((vt) => {
                const template = FIX_TEMPLATES[vt];
                return template
                    ? { vulnType: vt, title: template.title, priority: template.priority, effort: template.effort }
                    : { vulnType: vt, title: "Unknown", priority: "medium", effort: "medium" };
            })
            .sort((a, b) => {
                const pd = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
                if (pd !== 0) return pd;
                return (effortOrder[a.effort] || 1) - (effortOrder[b.effort] || 1);
            });

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    prioritizedFixes: items.map((item, idx) => ({
                        rank: idx + 1,
                        ...item,
                        rationale:
                            item.priority === "immediate"
                                ? "Critical security risk — fix before deployment"
                                : item.priority === "high"
                                    ? "Significant risk — fix within current sprint"
                                    : "Moderate risk — schedule for upcoming work",
                    })),
                }, null, 2),
            }],
        };
    }
);

// ============ Start Server ============
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SecureOps Remediation MCP server running on stdio");
}

main().catch(console.error);
