import { mockPipelineStages } from '../data/mockData'

export default function PipelineView() {
    return (
        <section className="pipeline-section animate-fade-in-up delay-300">
            <h3 className="section-title">
                <span className="icon">⚙️</span>
                Agent Pipeline
                <span className="badge badge-success">LIVE</span>
            </h3>
            <div className="glass-card">
                <div className="pipeline">
                    {mockPipelineStages.map((stage, i) => (
                        <>
                            <div
                                key={stage.id}
                                className={`pipeline-stage ${stage.status}`}
                            >
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
                            {i < mockPipelineStages.length - 1 && (
                                <div
                                    className={`pipeline-connector ${stage.status === 'completed' ? 'active' : ''
                                        }`}
                                />
                            )}
                        </>
                    ))}
                </div>
            </div>
        </section>
    )
}
