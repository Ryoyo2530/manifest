import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Account } from './pages/Account'
import { Compose } from './pages/Compose'
import { Landing } from './pages/Landing'
import { ManifestHome } from './pages/ManifestHome'
import { Missing, Quiet } from './pages/Quiet'
import { Result } from './pages/Result'
import { Ritual } from './pages/Ritual'
import { WishPage } from './pages/WishPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<Compose />} />
        <Route path="/manifest" element={<ManifestHome />} />
        <Route path="/wishes/:id" element={<WishPage />} />
        <Route path="/wishes/:id/envision" element={<Compose />} />
        <Route path="/generating/:id" element={<Ritual />} />
        <Route path="/generations/:id" element={<Result />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<Quiet />} />
        <Route path="/privacy" element={<Quiet />} />
        <Route path="/terms" element={<Quiet />} />
        <Route path="/contact" element={<Quiet />} />
        <Route path="*" element={<Missing />} />
      </Routes>
    </BrowserRouter>
  )
}
