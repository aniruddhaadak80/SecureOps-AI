import type { ScanResult } from '../types'
import SecurityScoreRing from './SecurityScoreRing'

interface Props {
    stats: ScanResult
}

export default function StatsGrid({ stats }: Props) {
    const cards = [
        { icon: '🎯', value: stats.securityScore.toString(), label: 'Security Score', color: stats.securityScore >= 70 ? 'green' : stats.securityScore >= 40 ? 'orange' : 'red', isScore: true },
        { icon: '📄', value: stats.scannedFiles.toLocaleString(), label: 'Files Scanned', color: 'cyan' },
        { icon: '🔴', value: stats.critical.toString(), label: 'Critical', color: 'red' },
        { icon: '🟠', value: stats.high.toString(), label: 'High', color: 'orange' },
        { icon: '🟡', value: stats.medium.toString(), label: 'Medium', color: 'blue' },
        { icon: '✅', value: stats.fixedCount.toString(), label: 'Auto-Fixable', color: 'green' },
    ]

    return (
        <div className="stats-grid">
            <div className="glass-card stat-card-score animate-fade-in-up stagger-1">
                <SecurityScoreRing score={stats.securityScore} />
            </div>
            {cards.filter(c => !c.isScore).map((stat, i) => (
                <div
                    key={stat.label}
                    className={`glass-card stat-card ${stat.color} animate-fade-in-up stagger-${i + 2}`}
                >
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
    )
}
