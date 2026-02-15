import { useState, useRef } from 'react'
import './App.css'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import PipelineView from './components/PipelineView'
import StatsGrid from './components/StatsGrid'
import VulnerabilityTable from './components/VulnerabilityTable'
import HeatmapSection from './components/HeatmapSection'
import AgentTraceViewer from './components/AgentTraceViewer'
import CostMonitor from './components/CostMonitor'
import Footer from './components/Footer'
import ScanModal from './components/ScanModal'
import type { ScanData } from './types'

function App() {
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scanLock = useRef(false)

  const handleScan = async (directory: string) => {
    if (scanLock.current) return
    scanLock.current = true

    // Force visible state update
    setIsScanning(true)
    setError(null)
    setShowModal(false)
    setScanData(null) // Reset previous data

    const startTime = Date.now()

    try {
      const res = await fetch('http://localhost:3001/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directory }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scan failed')
      }

      const data = await res.json()

      // UX: Ensure scanning animation plays for at least 2.5 seconds
      const elapsed = Date.now() - startTime
      if (elapsed < 2500) {
        await new Promise(resolve => setTimeout(resolve, 2500 - elapsed))
      }

      setScanData(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to SecureOps API.'
      setError(message)
    } finally {
      setIsScanning(false)
      scanLock.current = false
    }
  }

  return (
    <div className="app">
      <Header onNewScan={() => setShowModal(true)} isScanning={isScanning} hasData={!!scanData} />
      <main>
        {showModal && (
          <ScanModal
            onScan={handleScan}
            onClose={() => setShowModal(false)}
          />
        )}

        {error && (
          <div className="error-banner animate-fade-in-up">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {isScanning && (
          <div className="scanning-overlay animate-fade-in">
            <div className="scanning-content">
              <div className="scanning-spinner" />
              <h3>Scanning in Progress...</h3>
              <p>4 agents are analyzing your codebase</p>
              <div className="scanning-agents">
                <span className="scanning-agent active">🔍 Code Scanner</span>
                <span className="scanning-agent">📦 Dep Auditor</span>
                <span className="scanning-agent">🧠 Vuln Analyzer</span>
                <span className="scanning-agent">🔧 Remediation</span>
              </div>
            </div>
          </div>
        )}

        {!scanData && !isScanning && (
          <HeroSection onScan={() => setShowModal(true)} />
        )}

        {scanData && !isScanning && (
          <>
            <div className="scan-target-banner animate-fade-in-up">
              <span>📂 Scanned: <strong className="mono">{scanData.directory}</strong></span>
              <button className="btn-rescan" onClick={() => setShowModal(true)}>🔄 Scan Another</button>
            </div>
            <PipelineView stages={scanData.pipeline} />
            <StatsGrid stats={scanData.scanResult} />
            <div className="two-col-grid">
              <VulnerabilityTable vulnerabilities={scanData.vulnerabilities} />
              <div className="right-stack">
                <HeatmapSection data={scanData.heatmap} />
                <CostMonitor stats={scanData.scanResult} />
              </div>
            </div>
            <AgentTraceViewer activities={scanData.activities} />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
