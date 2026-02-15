import { mockScanResult } from '../data/mockData'

export default function StatsGrid() {
    const stats = [
        { icon: '📄', value: mockScanResult.scannedFiles.toLocaleString(), label: 'Files Scanned', color: 'cyan' },
        { icon: '🔴', value: mockScanResult.critical.toString(), label: 'Critical', color: 'red' },
        { icon: '🟠', value: mockScanResult.high.toString(), label: 'High', color: 'orange' },
        { icon: '🟡', value: mockScanResult.medium.toString(), label: 'Medium', color: 'blue' },
        { icon: '✅', value: mockScanResult.fixedCount.toString(), label: 'Auto-Fixed', color: 'green' },
        { icon: '🤖', value: '4', label: 'Active Agents', color: 'purple' },
    ]

    return (
        <div className="stats-grid">
            {stats.map((stat, i) => (
                <div
                    key={stat.label}
                    className={`glass-card stat-card ${stat.color} animate-fade-in-up stagger-${i + 1}`}
                >
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
    )
}
