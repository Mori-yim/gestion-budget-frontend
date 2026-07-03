// src/pages/LoginPage.jsx
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Content de vous revoir ! 💰')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold">
            <Wallet size={32} className="text-yellow-400" />
            <span className="text-white">BudgetCam</span>
          </div>
          <p className="text-slate-500 mt-2">Accédez à votre espace budget</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input type="email" placeholder="votre@email.cm"
                {...register('email', { required: "L'email est obligatoire" })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 ${errors.email ? 'border-red-500' : 'border-slate-700'}`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
              <input type="password" placeholder="••••••••"
                {...register('password', { required: 'Obligatoire' })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 ${errors.password ? 'border-red-500' : 'border-slate-700'}`}
              />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-slate-900 font-bold py-3 rounded-xl transition-colors">
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-5 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-xs text-slate-500">
            <p className="font-semibold text-slate-400 mb-1.5">Compte de démo :</p>
            <p>💰 jean.kamga@budgetcam.cm / Demo123!</p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-yellow-400 hover:underline font-medium">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
