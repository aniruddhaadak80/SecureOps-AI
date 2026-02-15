import { useState } from 'react'

interface Props {
    onScan: (directory: string) => void
    onClose: () => void
}

export default function ScanModal({ onScan, onClose }: Props) {
    const [dir, setDir] = useState('')

    const presets = [
        { label: '📂 This project (SecureOps-AI)', path: '.' },
        { label: '🏠 Desktop Projects', path: 'C:\\Users\\ANIRUDDHA\\OneDrive\\Desktop\\Project III' },
    ]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (dir.trim()) onScan(dir.trim())
    }

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="modal glass-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🛡️ Start Security Scan</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <p className="modal-desc">
                    Enter a <strong>local directory path</strong> OR a <strong>GitHub URL</strong>.
                    <br />
                    All 4 AI agents will analyze the target for security vulnerabilities.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="modal-input-group">
                        <label>Project Directory or Repo URL</label>
                        <input
                            type="text"
                            className="modal-input"
                            placeholder="e.g. C:\Projects\MyApp OR https://github.com/user/repo"
                            value={dir}
                            onChange={(e) => setDir(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="modal-presets">
                        <span className="modal-presets-label">Quick picks:</span>
                        {presets.map((p) => (
                            <button
                                key={p.path}
                                type="button"
                                className="preset-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDir(p.path);
                                    onScan(p.path);
                                }}
                            >
                                {p.label}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="preset-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = 'https://github.com/aniruddhaadak80/SecureOps-AI';
                                setDir(url);
                                onScan(url);
                            }}
                        >
                            🌐 This Repo (GitHub)
                        </button>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-scan" disabled={!dir.trim()}>
                            ⚡ Start Scan
                        </button>
                    </div>
                </form>
                <div className="modal-info">
                    <span>🔒 All scanning happens locally. No code leaves your machine.</span>
                </div>
            </div>
        </div>
    )
}
