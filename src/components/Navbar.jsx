// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Wallet, LayoutDashboard, ArrowLeftRight, Target, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); toast.success('À bientôt !'); navigate('/') }

  const navLink = (to, Icon, label) => {
    const active = location.pathname === to
    return (
      <Link to={to}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors
          ${active ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
        <Icon size={15} />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    )
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Wallet size={26} className="text-yellow-400" />
          <span className="text-white">BudgetCam</span>
        </Link>

        {/* Navigation */}
        {isAuthenticated && (
          <div className="flex items-center gap-1">
            {navLink('/dashboard', LayoutDashboard, 'Dashboard')}
            {navLink('/transactions', ArrowLeftRight, 'Transactions')}
            {navLink('/budgets', Target, 'Budgets')}
            {navLink('/profil', User, 'Profil')}
          </div>
        )}

        {/* Droite */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Solde rapide affiché si dispo */}
              <span className="hidden md:flex items-center gap-1.5 text-sm text-slate-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {user?.firstName}
              </span>
              <button onClick={handleLogout}
                className="text-slate-500 hover:text-red-400 transition-colors p-1.5">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                Connexion
              </Link>
              <Link to="/register"
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                Commencer
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
