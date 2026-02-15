interface Props {
    onScan: () => void
}

export default function HeroSection({ onScan }: Props) {
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
            <div style={{ marginTop: '32px' }}>
                <button className="btn-scan-hero" onClick={onScan}>
                    ⚡ Scan Your Project Now
                </button>
            </div>
            <div className="hero-features">
                <div className="hero-feature">
                    <span className="hero-feature-icon">🔍</span>
                    <span className="hero-feature-title">Code Scanner</span>
                    <span className="hero-feature-desc">8 security pattern rules</span>
                </div>
                <div className="hero-feature">
                    <span className="hero-feature-icon">📦</span>
                    <span className="hero-feature-title">Dep Auditor</span>
                    <span className="hero-feature-desc">CVE vulnerability database</span>
                </div>
                <div className="hero-feature">
                    <span className="hero-feature-icon">🧠</span>
                    <span className="hero-feature-title">Vuln Analyzer</span>
                    <span className="hero-feature-desc">CVSS risk scoring</span>
                </div>
                <div className="hero-feature">
                    <span className="hero-feature-icon">🔧</span>
                    <span className="hero-feature-title">Remediation</span>
                    <span className="hero-feature-desc">Auto-fix suggestions</span>
                </div>
            </div>
        </section>
    )
}
