import { mockScanResult } from '../data/mockData'

export default function CostMonitor() {
    const budgetLimit = 5.0
    const usagePercent = (mockScanResult.costUsd / budgetLimit) * 100

    return (
        <section className="cost-section animate-fade-in-up delay-600">
            <h3 className="section-title">
                <span className="icon">💰</span>
                Archestra Cost Monitor
            </h3>
            <div className="glass-card cost-wrap">
                <div className="cost-grid">
                    <div className="cost-item">
                        <div className="cost-value" style={{ color: 'var(--accent-green)' }}>
                            ${mockScanResult.costUsd.toFixed(2)}
                        </div>
                        <div className="cost-label">Scan Cost</div>
                    </div>
                    <div className="cost-item">
                        <div className="cost-value" style={{ color: 'var(--accent-cyan)' }}>
                            {(mockScanResult.tokensUsed / 1000).toFixed(1)}K
                        </div>
                        <div className="cost-label">Tokens Used</div>
                    </div>
                    <div className="cost-item">
                        <div className="cost-value" style={{ color: 'var(--accent-purple)' }}>
                            96%
                        </div>
                        <div className="cost-label">Cost Savings</div>
                    </div>
                    <div className="cost-item">
                        <div className="cost-value" style={{ color: 'var(--accent-blue)' }}>
                            4
                        </div>
                        <div className="cost-label">Agents Active</div>
                    </div>
                </div>

                <div className="cost-bar">
                    <div className="cost-bar-label">
                        <span>Budget Usage</span>
                        <span className="mono">${mockScanResult.costUsd.toFixed(2)} / ${budgetLimit.toFixed(2)}</span>
                    </div>
                    <div className="cost-bar-track">
                        <div className="cost-bar-fill" style={{ width: `${usagePercent}%` }} />
                    </div>
                </div>

                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span>💡</span>
                    Dynamic optimizer saved $11.58 by routing simple tasks to cheaper models
                </div>
            </div>
        </section>
    )
}
