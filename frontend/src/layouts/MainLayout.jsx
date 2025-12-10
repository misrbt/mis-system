import { Outlet } from 'react-router-dom'
import NavBar from '../components/navigation/NavBar'
import Sidebar from '../components/navigation/Sidebar'
import Footer from '../components/navigation/Footer'

function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      <NavBar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout
