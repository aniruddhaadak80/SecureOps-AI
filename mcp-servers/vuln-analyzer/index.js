import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "secureops-vuln-analyzer",
    version: "1.0.0",
});

// ============ CVSS Calculator ============
const CVSS_WEIGHTS = {
    attackVector: { network: 0.85, adjacent: 0.62, local: 0.55, physical: 0.20 },
    attackComplexity: { low: 0.77, high: 0.44 },
    privilegesRequired: { none: 0.85, low: 0.62, high: 0.27 },
    userInteraction: { none: 0.85, required: 0.62 },
    scope: { unchanged: 1.0, changed: 1.08 },
    confidentiality: { none: 0, low: 0.22, high: 0.56 },
    integrity: { none: 0, low: 0.22, high: 0.56 },
    availability: { none: 0, low: 0.22, high: 0.56 },
};

function calculateCVSS(metrics) {
    const av = CVSS_WEIGHTS.attackVector[metrics.attackVector] || 0.85;
    const ac = CVSS_WEIGHTS.attackComplexity[metrics.attackComplexity] || 0.77;
    const pr = CVSS_WEIGHTS.privilegesRequired[metrics.privilegesRequired] || 0.85;
    const ui = CVSS_WEIGHTS.userInteraction[metrics.userInteraction] || 0.85;
    const s = CVSS_WEIGHTS.scope[metrics.scope] || 1.0;
    const c = CVSS_WEIGHTS.confidentiality[metrics.confidentiality] || 0;
    const i = CVSS_WEIGHTS.integrity[metrics.integrity] || 0;
    const a = CVSS_WEIGHTS.availability[metrics.availability] || 0;

    const exploitability = 8.22 * av * ac * pr * ui;
    const impact = 1 - (1 - c) * (1 - i) * (1 - a);
    const impactScore = impact <= 0 ? 0 : s * (6.42 * impact);

    if (impactScore <= 0) return 0;
    const score = Math.min(10, exploitability + impactScore);
    return Math.round(score * 10) / 10;
}

function getSeverityFromScore(score) {
    if (score >= 9.0) return "critical";
    if (score >= 7.0) return "high";
    if (score >= 4.0) return "medium";
    if (score > 0) return "low";
    return "none";
}

// ============ Vulnerability Analysis Templates ============
const VULN_ANALYSIS = {
    "sql-injection": {
        attackVector: "network",
        attackComplexity: "low",
        privilegesRequired: "none",
        userInteraction: "none",
        scope: "changed",
        confidentiality: "high",
        integrity: "high",
        availability: "low",
        exploitScenario: "An attacker can craft malicious SQL in user input fields (search, login, etc.) to extract, modify, or delete database records. In severe cases, this can lead to full database takeover.",
        attackChain: [
            "1. Attacker identifies input field connected to SQL query",
            "2. Crafts SQL payload (e.g. ' OR 1=1--)",
            "3. Application concatenates payload into query",
            "4. Database executes attacker-controlled SQL",
            "5. Data exfiltrated or modified",
        ],
        businessImpact: "High — Full data breach possible. Customer data, credentials, and business logic exposed.",
        compliance: ["GDPR Article 32", "PCI DSS Requirement 6.5.1", "OWASP Top 10 A03:2021"],
    },
    "hardcoded-secret": {
        attackVector: "network",
        attackComplexity: "low",
        privilegesRequired: "none",
        userInteraction: "none",
        scope: "changed",
        confidentiality: "high",
        integrity: "high",
        availability: "high",
        exploitScenario: "Hardcoded credentials in source code can be extracted by anyone with access to the repository, including through leaked .git directories, public repos, or compromised CI artifacts.",
        attackChain: [
            "1. Repository accessed (public, leaked, or insider)",
            "2. Grep/scan reveals hardcoded API keys or passwords",
            "3. Attacker uses credentials to access cloud services",
            "4. Full infrastructure compromise",
        ],
        businessImpact: "Critical — Cloud infrastructure takeover, data theft, financial loss from unauthorized resource usage.",
        compliance: ["SOC 2 CC6.1", "NIST SP 800-53 IA-5", "CIS Benchmark"],
    },
    "xss": {
        attackVector: "network",
        attackComplexity: "low",
        privilegesRequired: "none",
        userInteraction: "required",
        scope: "changed",
        confidentiality: "low",
        integrity: "low",
        availability: "none",
        exploitScenario: "An attacker injects malicious JavaScript into user content that is rendered without sanitization, allowing session hijacking, credential theft, or defacement.",
        attackChain: [
            "1. Attacker submits malicious script via user input",
            "2. Application stores/reflects unsanitized content",
            "3. Victim's browser executes attacker's JavaScript",
            "4. Session cookies or credentials stolen",
        ],
        businessImpact: "Medium — User account compromise, potential data theft, reputation damage.",
        compliance: ["OWASP Top 10 A07:2021", "CWE-79"],
    },
    "insecure-crypto": {
        attackVector: "network",
        attackComplexity: "high",
        privilegesRequired: "none",
        userInteraction: "none",
        scope: "unchanged",
        confidentiality: "high",
        integrity: "low",
        availability: "none",
        exploitScenario: "Weak hashing algorithms (MD5, SHA1) or insecure random number generation can be exploited to forge signatures, crack passwords, or predict tokens.",
        attackChain: [
            "1. Attacker obtains hashed passwords or tokens",
            "2. Weak algorithm allows efficient brute-force or collision attacks",
            "3. Plaintext credentials recovered",
            "4. Account takeover achieved",
        ],
        businessImpact: "Medium-High — Password compromise, token forgery.",
        compliance: ["NIST SP 800-131A", "PCI DSS Requirement 3.4"],
    },
};

// ============ Tools ============

server.tool(
    "analyze_vulnerability",
    "Perform deep analysis on a vulnerability finding, computing CVSS score, attack scenarios, and business impact",
    {
        vulnType: z.string().describe("Vulnerability type (e.g., sql-injection, hardcoded-secret, xss, insecure-crypto)"),
        file: z.string().optional().describe("File path where the vulnerability was found"),
        line: z.number().optional().describe("Line number of the vulnerability"),
        context: z.string().optional().describe("Additional context about the finding"),
    },
    async ({ vulnType, file, line, context }) => {
        const template = VULN_ANALYSIS[vulnType];
        if (!template) {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        vulnType,
                        message: `No detailed analysis template for '${vulnType}'. Available types: ${Object.keys(VULN_ANALYSIS).join(", ")}`,
                    }),
                }],
            };
        }

        const cvss = calculateCVSS(template);
        const severity = getSeverityFromScore(cvss);

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    analysis: {
                        vulnType,
                        file,
                        line,
                        cvssScore: cvss,
                        severity,
                        cvssMetrics: {
                            attackVector: template.attackVector,
                            attackComplexity: template.attackComplexity,
                            privilegesRequired: template.privilegesRequired,
                            userInteraction: template.userInteraction,
                            scope: template.scope,
                            confidentiality: template.confidentiality,
                            integrity: template.integrity,
                            availability: template.availability,
                        },
                        exploitScenario: template.exploitScenario,
                        attackChain: template.attackChain,
                        businessImpact: template.businessImpact,
                        complianceImpact: template.compliance,
                        context: context || null,
                    },
                }, null, 2),
            }],
        };
    }
);

server.tool(
    "risk_score",
    "Calculate an overall security risk score for a set of findings",
    {
        findings: z.array(z.object({
            severity: z.string(),
            count: z.number(),
        })).describe("Array of { severity, count } objects"),
    },
    async ({ findings }) => {
        const weights = { critical: 10, high: 7, medium: 4, low: 1 };
        let totalRisk = 0;
        let totalFindings = 0;

        for (const f of findings) {
            totalRisk += (weights[f.severity] || 1) * f.count;
            totalFindings += f.count;
        }

        const maxPossibleRisk = totalFindings * 10;
        const riskPercentage = maxPossibleRisk > 0
            ? Math.round((totalRisk / maxPossibleRisk) * 100)
            : 0;
        const securityScore = Math.max(0, 100 - riskPercentage);

        let grade;
        if (securityScore >= 90) grade = "A";
        else if (securityScore >= 80) grade = "B";
        else if (securityScore >= 70) grade = "C";
        else if (securityScore >= 60) grade = "D";
        else grade = "F";

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    riskAssessment: {
                        totalFindings,
                        weightedRiskScore: totalRisk,
                        riskPercentage,
                        securityScore,
                        grade,
                        recommendation: securityScore >= 80
                            ? "Security posture is acceptable. Address remaining medium/low findings."
                            : securityScore >= 60
                                ? "Security posture needs improvement. Prioritize critical and high severity findings."
                                : "Security posture is poor. Immediate action required on critical findings.",
                        breakdown: findings,
                    },
                }, null, 2),
            }],
        };
    }
);

server.tool(
    "impact_assessment",
    "Assess the potential impact of exploiting a specific vulnerability on the system",
    {
        vulnType: z.string().describe("Type of vulnerability"),
        environment: z.string().optional().describe("Deployment environment (production, staging, dev)"),
        dataClassification: z.string().optional().describe("Type of data at risk (PII, financial, public)"),
    },
    async ({ vulnType, environment, dataClassification }) => {
        const env = environment || "production";
        const dataClass = dataClassification || "unknown";

        const envMultiplier = { production: 1.0, staging: 0.5, development: 0.2 };
        const dataMultiplier = { PII: 1.0, financial: 1.0, internal: 0.6, public: 0.2, unknown: 0.7 };

        const baseImpact = VULN_ANALYSIS[vulnType] ? 8 : 5;
        const adjustedImpact = Math.round(
            baseImpact * (envMultiplier[env] || 0.5) * (dataMultiplier[dataClass] || 0.7) * 10
        ) / 10;

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    impactAssessment: {
                        vulnType,
                        environment: env,
                        dataClassification: dataClass,
                        baseImpactScore: baseImpact,
                        environmentMultiplier: envMultiplier[env] || 0.5,
                        dataMultiplier: dataMultiplier[dataClass] || 0.7,
                        adjustedImpactScore: adjustedImpact,
                        severity: adjustedImpact >= 7 ? "critical" : adjustedImpact >= 5 ? "high" : adjustedImpact >= 3 ? "medium" : "low",
                        urgency: adjustedImpact >= 7 ? "Fix immediately" : adjustedImpact >= 5 ? "Fix within 24 hours" : adjustedImpact >= 3 ? "Fix within 1 week" : "Fix in next sprint",
                    },
                }, null, 2),
            }],
        };
    }
);

// ============ Start Server ============
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SecureOps Vulnerability Analyzer MCP server running on stdio");
}

main().catch(console.error);
