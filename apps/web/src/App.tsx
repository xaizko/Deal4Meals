import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import type { Deal } from './components/deal_card'
import { Footer } from './components/footer_card'
import { Header } from './components/header_card'
import { DealPage } from './pages/deal_page'
import { WeeklyPage } from './pages/weekly_page'

function App() {
	const [newDeal, setNewDeal] = useState<Deal | null>(null)

	return (
		<BrowserRouter>
			<div className="flex min-h-screen flex-col bg-zinc-100">
				<Header onDealCreated={setNewDeal} />
				<Routes>
					<Route path="/" element={<DealPage newDeal={newDeal} />} />
					<Route path="/weekly" element={<WeeklyPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
				<Footer />
			</div>
		</BrowserRouter>
	)
}

export default App
