// Types for the SecureOps AI dashboard

export interface Vulnerability {
    id: string
    title: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    category: string
    file: string
    line: number
    snippet?: string
    description: string
    remediation: string
    cve?: string
    cvss?: number
    agent: string
    status: string
    detectedAt: string
}

export interface AgentActivity {
    id: string
    agent: string
    action: string
    target: string
    status: 'running' | 'completed' | 'warning' | 'error'
    timestamp: string
    duration?: string
}

export interface ScanResult {
    totalFiles: number
    scannedFiles: number
    totalVulnerabilities: number
    critical: number
    high: number
    medium: number
    low: number
    fixedCount: number
    securityScore: number
    scanDuration: string
    costUsd: number
    tokensUsed: number
}

export interface PipelineStage {
    id: string
    name: string
    icon: string
    status: 'pending' | 'running' | 'completed' | 'error'
    agent: string
    progress: number
    findings: number
    duration: string
}

export interface HeatmapRow {
    category: string
    critical: number
    high: number
    medium: number
    low: number
}

export interface ScanData {
    scanResult: ScanResult
    pipeline: PipelineStage[]
    vulnerabilities: Vulnerability[]
    activities: AgentActivity[]
    heatmap: HeatmapRow[]
    directory: string
}
