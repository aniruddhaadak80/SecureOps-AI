import type { AgentActivity } from '../types'

interface Props {
    activities: AgentActivity[]
}

export default function AgentTraceViewer({ activities }: Props) {
    return (
        <section className="trace-section animate-fade-in-up delay-600">
            <h3 className="section-title">
                <span className="icon">📡</span>
                Agent Activity Trace
                <span className="badge badge-success">COMPLETE</span>
            </h3>
            <div className="glass-card trace-wrap">
                <div className="trace-list">
                    {activities.map((act, i) => (
                        <div key={act.id} className={`trace-item animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
                            <div className={`trace-status-dot ${act.status}`} />
                            <div className="trace-time">{act.timestamp}</div>
                            <div className={`trace-agent-badge ${act.agent}`}>
                                {act.agent}
                            </div>
                            <div className="trace-action">{act.action}</div>
                            <div className="trace-target">{act.target}</div>
                            {act.duration && (
                                <span style={{
                                    fontSize: '0.7rem', color: 'var(--text-muted)',
                                    fontFamily: 'var(--font-mono)', flexShrink: 0,
                                }}>
                                    {act.duration}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
