import type { PipelineStage } from '../types'

interface Props {
    stages: PipelineStage[]
}

export default function PipelineView({ stages }: Props) {
    return (
        <section className="pipeline-section animate-fade-in-up delay-300">
            <h3 className="section-title">
                <span className="icon">⚙️</span>
                Agent Pipeline
                <span className="badge badge-success">COMPLETED</span>
            </h3>
            <div className="glass-card">
                <div className="pipeline">
                    {stages.map((stage, i) => (
                        <div key={stage.id}>
                            <div className={`pipeline-stage ${stage.status}`}>
                                <div className="stage-icon">{stage.icon}</div>
                                <div className="stage-name">{stage.name}</div>
                                <div className="stage-agent">{stage.agent}</div>
                                <div className="stage-progress-bar">
                                    <div
                                        className="stage-progress-fill"
                                        style={{ width: `${stage.progress}%` }}
                                    />
                                </div>
                                <div className="stage-stats">
                                    <span>📋 {stage.findings} found</span>
                                    <span>⏱ {stage.duration}</span>
                                </div>
                            </div>
                            {i < stages.length - 1 && (
                                <div className={`pipeline-connector ${stage.status === 'completed' ? 'active' : ''}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
