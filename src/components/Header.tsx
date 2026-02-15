interface Props {
    onNewScan: () => void
    isScanning: boolean
    hasData: boolean
}

export default function Header({ onNewScan, isScanning }: Props) {
    return (
        <header className="header">
            <div className="header-inner">
                <div className="header-logo">
                    <div className="logo-icon">🛡️</div>
                    <h1>Secure<span>Ops</span> AI</h1>
                </div>
                <nav className="header-nav">
                    <button className="nav-pill active">Dashboard</button>
                    <button className="nav-pill">Agents</button>
                    <button className="nav-pill">Reports</button>
                    <button className="nav-pill">Settings</button>
                </nav>
                <div className="header-actions">
                    <div className="header-badge">
                        <div className="status-dot"></div>
                        <span>Archestra Connected</span>
                    </div>
                    <button className="btn-scan" onClick={onNewScan} disabled={isScanning}>
                        <span>⚡</span> {isScanning ? 'Scanning...' : 'New Scan'}
                    </button>
                </div>
            </div>
        </header>
    )
}
