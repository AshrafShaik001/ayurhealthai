import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Consultation from './pages/Consultation'
import Remedies from './pages/Remedies'
import DoshaQuiz from './pages/DoshaQuiz'
import DoshaResult from './pages/DoshaResult'
import RecommendationDashboard from './pages/RecommendationDashboard'
import SymptomChecker from './pages/SymptomChecker'
import DinacharyaPlanner from './pages/DinacharyaPlanner'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                       element={<Home />} />
          <Route path="/about"                  element={<About />} />
          <Route path="/consultation"           element={<Consultation />} />
          <Route path="/remedies"               element={<Remedies />} />
          <Route path="/quiz"                   element={<DoshaQuiz />} />
          <Route path="/quiz/result/:sessionId" element={<DoshaResult />} />
          <Route path="/recommendations"        element={<RecommendationDashboard />} />
          <Route path="/symptoms"              element={<SymptomChecker />} />
          <Route path="/dinacharya"            element={<DinacharyaPlanner />} />
          <Route path="*"                       element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
