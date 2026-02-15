// Mock data for the SecureOps AI dashboard

export interface Vulnerability {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    file: string;
    line: number;
    description: string;
    cve?: string;
    cvss?: number;
    status: 'open' | 'fixing' | 'fixed';
    agent: string;
    detectedAt: string;
}

export interface AgentActivity {
    id: string;
    agent: string;
    action: string;
    target: string;
    status: 'running' | 'completed' | 'warning' | 'error';
    timestamp: string;
    duration?: string;
    details?: string;
}

export interface ScanResult {
    totalFiles: number;
    scannedFiles: number;
    totalVulnerabilities: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    fixedCount: number;
    securityScore: number;
    scanDuration: string;
    costUsd: number;
    tokensUsed: number;
}

export interface PipelineStage {
    id: string;
    name: string;
    icon: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    agent: string;
    progress: number;
    findings: number;
    duration: string;
}

export const mockScanResult: ScanResult = {
    totalFiles: 1247,
    scannedFiles: 1247,
    totalVulnerabilities: 23,
    critical: 3,
    high: 7,
    medium: 9,
    low: 4,
    fixedCount: 15,
    securityScore: 78,
    scanDuration: '2m 34s',
    costUsd: 0.42,
    tokensUsed: 84200,
};

export const mockPipelineStages: PipelineStage[] = [
    {
        id: 'scan',
        name: 'Code Scan',
        icon: '🔍',
        status: 'completed',
        agent: 'code-scanner',
        progress: 100,
        findings: 12,
        duration: '45s',
    },
    {
        id: 'audit',
        name: 'Dep Audit',
        icon: '📦',
        status: 'completed',
        agent: 'dependency-auditor',
        progress: 100,
        findings: 8,
        duration: '32s',
    },
    {
        id: 'analyze',
        name: 'Vuln Analysis',
        icon: '🧠',
        status: 'running',
        agent: 'vuln-analyzer',
        progress: 67,
        findings: 3,
        duration: '1m 12s',
    },
    {
        id: 'fix',
        name: 'Auto-Fix',
        icon: '🔧',
        status: 'pending',
        agent: 'remediation',
        progress: 0,
        findings: 0,
        duration: '--',
    },
];

export const mockVulnerabilities: Vulnerability[] = [
    {
        id: 'VULN-001',
        title: 'Hardcoded AWS Secret Key',
        severity: 'critical',
        category: 'Secrets',
        file: 'src/config/aws.ts',
        line: 23,
        description: 'AWS secret access key found hardcoded in source code. This exposes cloud infrastructure to unauthorized access.',
        status: 'fixing',
        agent: 'code-scanner',
        detectedAt: '2m ago',
    },
    {
        id: 'VULN-002',
        title: 'SQL Injection in Query Builder',
        severity: 'critical',
        category: 'Injection',
        file: 'src/api/users.ts',
        line: 87,
        description: 'User input directly concatenated into SQL query without parameterization.',
        cve: 'CWE-89',
        cvss: 9.8,
        status: 'open',
        agent: 'code-scanner',
        detectedAt: '2m ago',
    },
    {
        id: 'VULN-003',
        title: 'Prototype Pollution in lodash',
        severity: 'critical',
        category: 'Dependency',
        file: 'package.json',
        line: 15,
        description: 'lodash@4.17.15 is vulnerable to prototype pollution via merge, mergeWith, and defaultsDeep functions.',
        cve: 'CVE-2020-8203',
        cvss: 7.4,
        status: 'fixed',
        agent: 'dependency-auditor',
        detectedAt: '3m ago',
    },
    {
        id: 'VULN-004',
        title: 'Cross-Site Scripting (XSS)',
        severity: 'high',
        category: 'XSS',
        file: 'src/components/Comment.tsx',
        line: 42,
        description: 'User-supplied HTML rendered with dangerouslySetInnerHTML without sanitization.',
        cve: 'CWE-79',
        cvss: 6.1,
        status: 'open',
        agent: 'code-scanner',
        detectedAt: '2m ago',
    },
    {
        id: 'VULN-005',
        title: 'Insecure JWT Verification',
        severity: 'high',
        category: 'Auth',
        file: 'src/middleware/auth.ts',
        line: 15,
        description: 'JWT tokens verified with algorithm set to "none", allowing token forgery.',
        cvss: 8.2,
        status: 'fixing',
        agent: 'vuln-analyzer',
        detectedAt: '1m ago',
    },
    {
        id: 'VULN-006',
        title: 'Outdated express@4.17.1',
        severity: 'high',
        category: 'Dependency',
        file: 'package.json',
        line: 8,
        description: 'Express 4.17.1 has known vulnerabilities. Update to 4.21.0+.',
        cve: 'CVE-2024-29041',
        cvss: 6.5,
        status: 'fixed',
        agent: 'dependency-auditor',
        detectedAt: '3m ago',
    },
    {
        id: 'VULN-007',
        title: 'Open Redirect',
        severity: 'medium',
        category: 'Redirect',
        file: 'src/api/login.ts',
        line: 55,
        description: 'Unvalidated redirect URL allows phishing attacks via redirect parameter.',
        cve: 'CWE-601',
        cvss: 5.4,
        status: 'open',
        agent: 'code-scanner',
        detectedAt: '2m ago',
    },
    {
        id: 'VULN-008',
        title: 'Missing Rate Limiting',
        severity: 'medium',
        category: 'DoS',
        file: 'src/api/index.ts',
        line: 1,
        description: 'No rate limiting on authentication endpoints. Vulnerable to brute-force attacks.',
        status: 'open',
        agent: 'vuln-analyzer',
        detectedAt: '1m ago',
    },
    {
        id: 'VULN-009',
        title: 'Weak bcrypt Rounds',
        severity: 'medium',
        category: 'Crypto',
        file: 'src/utils/hash.ts',
        line: 8,
        description: 'bcrypt salt rounds set to 4 (minimum). Recommended minimum is 12.',
        status: 'fixing',
        agent: 'vuln-analyzer',
        detectedAt: '1m ago',
    },
    {
        id: 'VULN-010',
        title: 'Information Disclosure in Error',
        severity: 'low',
        category: 'Info Leak',
        file: 'src/middleware/error.ts',
        line: 12,
        description: 'Stack traces exposed in production error responses.',
        status: 'fixed',
        agent: 'code-scanner',
        detectedAt: '2m ago',
    },
];

export const mockAgentActivities: AgentActivity[] = [
    {
        id: 'act-1',
        agent: 'code-scanner',
        action: 'Scanning repository',
        target: 'src/**/*.ts',
        status: 'completed',
        timestamp: '20:45:12',
        duration: '45s',
        details: 'Scanned 1,247 files across 89 directories',
    },
    {
        id: 'act-2',
        agent: 'code-scanner',
        action: 'Detected hardcoded secret',
        target: 'src/config/aws.ts:23',
        status: 'warning',
        timestamp: '20:45:18',
        details: 'AWS_SECRET_ACCESS_KEY found in plaintext',
    },
    {
        id: 'act-3',
        agent: 'dependency-auditor',
        action: 'Auditing npm dependencies',
        target: 'package-lock.json',
        status: 'completed',
        timestamp: '20:45:30',
        duration: '32s',
        details: 'Checked 342 packages against CVE database',
    },
    {
        id: 'act-4',
        agent: 'dependency-auditor',
        action: 'Found vulnerable dependency',
        target: 'lodash@4.17.15',
        status: 'warning',
        timestamp: '20:45:38',
        details: 'CVE-2020-8203: Prototype Pollution (CVSS 7.4)',
    },
    {
        id: 'act-5',
        agent: 'vuln-analyzer',
        action: 'Analyzing SQL injection risk',
        target: 'src/api/users.ts:87',
        status: 'running',
        timestamp: '20:46:02',
        details: 'Tracing data flow from request.query to database query',
    },
    {
        id: 'act-6',
        agent: 'vuln-analyzer',
        action: 'Computing CVSS scores',
        target: 'VULN-002, VULN-004',
        status: 'running',
        timestamp: '20:46:15',
        details: 'Evaluating attack vector, complexity, and impact',
    },
    {
        id: 'act-7',
        agent: 'remediation',
        action: 'Generating fix for secret exposure',
        target: 'VULN-001',
        status: 'completed',
        timestamp: '20:46:30',
        duration: '8s',
        details: 'Created .env migration + updated aws.ts to use env vars',
    },
    {
        id: 'act-8',
        agent: 'remediation',
        action: 'Updating lodash to 4.17.21',
        target: 'VULN-003',
        status: 'completed',
        timestamp: '20:46:45',
        duration: '5s',
        details: 'Updated package.json and regenerated lock file',
    },
];

// Heatmap data: severity counts per file category
export const heatmapData = [
    { category: 'API Routes', critical: 2, high: 3, medium: 2, low: 1 },
    { category: 'Auth', critical: 0, high: 2, medium: 1, low: 0 },
    { category: 'Config', critical: 1, high: 0, medium: 0, low: 1 },
    { category: 'Components', critical: 0, high: 1, medium: 2, low: 0 },
    { category: 'Utils', critical: 0, high: 0, medium: 2, low: 1 },
    { category: 'Middleware', critical: 0, high: 1, medium: 1, low: 1 },
    { category: 'Dependencies', critical: 1, high: 1, medium: 1, low: 0 },
];
