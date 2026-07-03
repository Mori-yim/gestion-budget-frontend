// src/pages/BudgetsPage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Target, Plus, X, Trash2, Bell, BellOff } from 'lucide-react'
import { budgetApi, categorieApi } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const formatFCFA = (v) => v ? Number(v).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'

/**
 * ================================================================
 * PAGE BUDGETS
 * ================================================================
 * Permet de définir un plafond de dépenses par catégorie et par mois.
 * Quand le plafond est dépassé → Spring Mail envoie une alerte email.
 * ================================================================
 */
export default function BudgetsPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)

  // Mois/Année courants
  const now = new Date()
  const mois = now.getMonth() + 1
  const annee = now.getFullYear()

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', mois, annee],
    queryFn: () => budgetApi.getAll(mois, annee),
  })

  const { data: catData } = useQuery({
    queryKey: ['categories-depenses'],
    queryFn: () => categorieApi.getParType('DEPENSE'),
  })

  const budgets = data?.data?.data || []
  const categoriesDepenses = catData?.data?.data || []

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { mois, annee }
  })

  const { mutate: createBudget, isPending } = useMutation({
    mutationFn: (data) => budgetApi.create({
      categorieId: parseInt(data.categorieId),
      mois: parseInt(data.mois),
      annee: parseInt(data.annee),
      montantPlafond: parseFloat(data.montantPlafond),
    }),
    onSuccess: () => {
      toast.success('Budget défini ! Une alerte email sera envoyée si dépassé. 📧')
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setShowModal(false); reset()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  })

  const { mutate: deleteBudget } = useMutation({
    mutationFn: (id) => budgetApi.delete(id),
    onSuccess: () => {
      toast.success('Budget supprimé')
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })

  // Nom du mois courant
  const nomMois = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target size={28} className="text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Budgets</h1>
            <p className="text-slate-500 text-sm capitalize">{nomMois} · {budgets.length} budget(s)</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors">
          <Plus size={18} /> Nouveau budget
        </button>
      </div>

      {/* Info Spring Mail */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Bell size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-300">Alertes email automatiques</p>
          <p className="text-xs text-blue-400 mt-0.5">
            Quand une dépense fait dépasser le budget d'une catégorie,
            BudgetCam envoie automatiquement un email d'alerte via Spring Mail.
          </p>
        </div>
      </div>

      {/* Liste des budgets */}
      {isLoading ? (
        <LoadingSpinner />
      ) : budgets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <p className="font-semibold text-slate-300 mb-2">Aucun budget défini</p>
          <p className="text-slate-500 text-sm mb-6">
            Définissez des budgets par catégorie pour recevoir des alertes email.
          </p>
          <button onClick={() => setShowModal(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">
            Créer mon premier budget
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map(budget => {
            const pct = Math.min(budget.pourcentageUtilise, 100)
            const couleurBarre = budget.depasse ? 'bg-red-500' :
                                 budget.pourcentageUtilise > 80 ? 'bg-orange-500' : 'bg-green-500'
            return (
              <div key={budget.id}
                className={`bg-slate-900 border rounded-2xl p-5 ${budget.depasse ? 'border-red-500/30' : 'border-slate-800'}`}>

                {/* En-tête budget */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{budget.categorie?.icone}</div>
                    <div>
                      <p className="font-bold text-white text-lg">{budget.categorie?.nom}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {budget.depasse ? (
                          <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                            <BellOff size={12} /> Budget dépassé — alerte email envoyée
                          </span>
                        ) : budget.alerteEnvoyee ? (
                          <span className="flex items-center gap-1 text-xs text-orange-400">
                            <Bell size={12} /> Alerte déjà envoyée
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Bell size={12} /> Alerte active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.confirm('Supprimer ce budget ?') && deleteBudget(budget.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1.5">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Montants */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-800 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">Budget fixé</p>
                    <p className="font-bold text-yellow-400 text-sm">{formatFCFA(budget.montantPlafond)}</p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">Dépensé</p>
                    <p className={`font-bold text-sm ${budget.depasse ? 'text-red-400' : 'text-white'}`}>
                      {formatFCFA(budget.totalDepense)}
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">
                      {budget.depasse ? 'Dépassement' : 'Reste'}
                    </p>
                    <p className={`font-bold text-sm ${budget.depasse ? 'text-red-400' : 'text-green-400'}`}>
                      {budget.depasse
                        ? '+' + formatFCFA(Math.abs(budget.resteADepenser))
                        : formatFCFA(budget.resteADepenser)}
                    </p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Progression</span>
                    <span className={`font-semibold ${budget.depasse ? 'text-red-400' : 'text-slate-300'}`}>
                      {budget.pourcentageUtilise}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${couleurBarre}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal création budget */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="font-bold text-white text-lg">Nouveau budget</h2>
              <button onClick={() => { setShowModal(false); reset() }}
                className="text-slate-500 hover:text-white"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit(createBudget)} className="p-5 space-y-4">

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Catégorie de dépense *
                </label>
                <select {...register('categorieId', { required: 'Obligatoire' })}
                  className={`w-full px-3 py-2.5 rounded-xl bg-slate-800 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 ${errors.categorieId ? 'border-red-500' : 'border-slate-700'}`}>
                  <option value="">Choisir une catégorie</option>
                  {categoriesDepenses.map(c => (
                    <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>
                  ))}
                </select>
                {errors.categorieId && <p className="text-red-400 text-xs mt-1">{errors.categorieId.message}</p>}
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Plafond mensuel (FCFA) *
                </label>
                <input type="number" min="1000" step="1000" placeholder="Ex: 80000"
                  {...register('montantPlafond', { required: 'Obligatoire', min: { value: 1000, message: 'Min 1 000 FCFA' } })}
                  className={`w-full px-3 py-2.5 rounded-xl bg-slate-800 border text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 ${errors.montantPlafond ? 'border-red-500' : 'border-slate-700'}`}
                />
                {errors.montantPlafond && <p className="text-red-400 text-xs mt-1">{errors.montantPlafond.message}</p>}
              </div>

              {/* Mois et Année */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Mois</label>
                  <select {...register('mois')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>
                        {new Date(2025, m - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Année</label>
                  <select {...register('annee')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500">
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>
              </div>

              {/* Info alerte */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
                <Bell size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300">
                  Un email d'alerte sera automatiquement envoyé si vos dépenses dépassent ce plafond.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); reset() }}
                  className="flex-1 border border-slate-700 text-slate-400 font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-slate-900 font-bold py-3 rounded-xl transition-colors">
                  {isPending ? 'Création...' : 'Créer le budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
