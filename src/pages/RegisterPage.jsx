// src/pages/RegisterPage.jsx
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, Mail } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await registerUser({
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, password: data.password,
        phone: data.phone || undefined,
        salaireMensuel: data.salaireMensuel ? parseFloat(data.salaireMensuel) : undefined,
      })
      toast.success('Compte créé ! Vérifiez votre email 📧')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription")
    } finally { setIsLoading(false) }
  }

  const inputCls = (err) => `w-full px-4 py-2.5 rounded-xl bg-slate-800 border text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 ${err ? 'border-red-500' : 'border-slate-700'}`

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold">
            <Wallet size={32} className="text-yellow-400" />
            <span className="text-white">BudgetCam</span>
          </div>
          <p className="text-slate-500 mt-2">Créez votre compte gratuitement</p>
        </div>

        {/* Info email */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-6 flex items-center gap-2">
          <Mail size={16} className="text-blue-400 flex-shrink-0" />
          <p className="text-xs text-blue-300">Un email de bienvenue vous sera envoyé automatiquement</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Prénom</label>
                <input type="text" placeholder="Jean" {...register('firstName', { required: 'Obligatoire' })} className={inputCls(errors.firstName)} />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom</label>
                <input type="text" placeholder="Kamga" {...register('lastName', { required: 'Obligatoire' })} className={inputCls(errors.lastName)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input type="email" placeholder="votre@email.cm"
                {...register('email', { required: 'Obligatoire', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email invalide' } })}
                className={inputCls(errors.email)} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Téléphone</label>
                <input type="tel" placeholder="+237 6XX XXX XXX" {...register('phone')} className={inputCls(false)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Salaire / mois (FCFA)</label>
                <input type="number" min="0" step="5000" placeholder="350000" {...register('salaireMensuel')} className={inputCls(false)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
              <input type="password" placeholder="••••••••" {...register('password', { required: 'Obligatoire', minLength: { value: 6, message: 'Min 6 caractères' } })} className={inputCls(errors.password)} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmer le mot de passe</label>
              <input type="password" placeholder="••••••••"
                {...register('confirmPassword', { required: 'Obligatoire', validate: v => v === password || 'Les mots de passe ne correspondent pas' })}
                className={inputCls(errors.confirmPassword)} />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-slate-900 font-bold py-3 rounded-xl transition-colors mt-2">
              {isLoading ? 'Création du compte...' : 'Créer mon compte 💰'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-yellow-400 hover:underline font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
