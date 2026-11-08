import './App.css'
import { Footer } from './components/footer_card'
import { Header } from './components/header_card'
import { DealPage } from './pages/deal_page'
function App() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <Header />
      <DealPage />
      <Footer />
    </div>
  )
}
export default App