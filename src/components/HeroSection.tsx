import { mockScanResult } from '../data/mockData'
import SecurityScoreRing from './SecurityScoreRing'

export default function HeroSection() {
    return (
        <section className="hero animate-fade-in-up">
            <div className="hero-tag">
                <span>🏁</span> Powered by Archestra MCP
            </div>
            <h2>
                <span className="text-gradient">Multi-Agent DevSecOps</span>
                <br />
                Pipeline Dashboard
            </h2>
            <p>
                4 specialized AI agents scan, audit, analyze, and auto-remediate
                security vulnerabilities in your codebase — orchestrated and governed
                through Archestra's MCP platform.
            </p>
            <div className="hero-stats">
                <SecurityScoreRing score={mockScanResult.securityScore} />
                <div className="hero-stat animate-fade-in-up delay-200">
                    <div className="hero-stat-value" style={{ color: 'var(--accent-cyan)' }}>
                        {mockScanResult.scannedFiles.toLocaleString()}
                    </div>
                    <div className="hero-stat-label">Files Scanned</div>
                </div>
                <div className="hero-stat animate-fade-in-up delay-300">
                    <div className="hero-stat-value" style={{ color: 'var(--accent-red)' }}>
                        {mockScanResult.totalVulnerabilities}
                    </div>
                    <div className="hero-stat-label">Vulnerabilities</div>
                </div>
                <div className="hero-stat animate-fade-in-up delay-400">
                    <div className="hero-stat-value" style={{ color: 'var(--accent-green)' }}>
                        {mockScanResult.fixedCount}
                    </div>
                    <div className="hero-stat-label">Auto-Fixed</div>
                </div>
                <div className="hero-stat animate-fade-in-up delay-500">
                    <div className="hero-stat-value" style={{ color: 'var(--accent-purple)' }}>
                        {mockScanResult.scanDuration}
                    </div>
                    <div className="hero-stat-label">Scan Duration</div>
                </div>
            </div>
        </section>
    )
}
