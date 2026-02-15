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

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <HeroSection />
        <PipelineView />
        <StatsGrid />
        <div className="two-col-grid">
          <VulnerabilityTable />
          <div className="right-stack">
            <HeatmapSection />
            <CostMonitor />
          </div>
        </div>
        <AgentTraceViewer />
      </main>
      <Footer />
    </div>
  )
}

export default App
