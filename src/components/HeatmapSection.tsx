import type { HeatmapRow } from '../types'

const severities = ['critical', 'high', 'medium', 'low'] as const
const severityColors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6',
}

interface Props {
    data: HeatmapRow[]
}

export default function HeatmapSection({ data }: Props) {
    return (
        <section className="heatmap-section animate-fade-in-up delay-500">
            <h3 className="section-title">
                <span className="icon">🗺️</span>
                Vulnerability Heatmap
            </h3>
            <div className="glass-card heatmap-wrap">
                <div className="heatmap-row" style={{ marginBottom: '8px' }}>
                    <div className="heatmap-label" />
                    <div className="heatmap-cells">
                        {severities.map((s) => (
                            <div
                                key={s}
                                style={{
                                    flex: 1, textAlign: 'center', fontSize: '0.65rem',
                                    fontWeight: 700, color: severityColors[s],
                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                }}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="heatmap-grid">
                    {data.map((row) => (
                        <div key={row.category} className="heatmap-row">
                            <div className="heatmap-label">{row.category}</div>
                            <div className="heatmap-cells">
                                {severities.map((s) => {
                                    const count = row[s]
                                    return (
                                        <div
                                            key={s}
                                            className={`heatmap-cell ${count > 0 ? s : 'none'}`}
                                            title={`${row.category}: ${count} ${s}`}
                                        >
                                            {count > 0 ? count : '—'}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="heatmap-legend">
                    {severities.map((s) => (
                        <div key={s} className="heatmap-legend-item">
                            <div className="heatmap-legend-dot" style={{ background: severityColors[s] }} />
                            <span style={{ textTransform: 'capitalize' }}>{s}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
