import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Footer } from './components/footer_card'
import { Header } from './components/header_card'
import { DealPage } from './pages/deal_page'
import { WeeklyPage } from './pages/weekly_page'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-zinc-100">
        <Header />
        <Routes>
          <Route path="/" element={<DealPage />} />
          <Route path="/weekly" element={<WeeklyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
