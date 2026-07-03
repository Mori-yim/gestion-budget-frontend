// src/pages/TransactionsPage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, ArrowLeftRight, X, Trash2 } from 'lucide-react'
import { transactionApi, categorieApi } from '../services/api'
import { TypeBadge, ModePaiementBadge, Pagination } from '../components/ui/TypeBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const formatFCFA = (v) => v ? Number(v).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [typeFiltre, setTypeFiltre] = useState('TOUS')
  const size = 20

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => transactionApi.getAll(page, size),
    keepPreviousData: true,
  })

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categorieApi.getAll(),
  })

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'DEPENSE', date: new Date().toISOString().split('T')[0] }
  })
  const typeSaisi = watch('type')

  const pageData = data?.data?.data
  const allTx = pageData?.content || []
  const categories = catData?.data?.data || []
  const catsFiltrees = categories.filter(c => typeSaisi === 'REVENU' ? c.type === 'REVENU' : c.type === 'DEPENSE')

  const { mutate: createTx, isPending: isCreating } = useMutation({
    mutationFn: (data) => transactionApi.create({
      ...data,
      montant: parseFloat(data.montant),
      categorieId: parseInt(data.categorieId),
    }),
    onSuccess: () => {
      toast.success('Transaction enregistrée !')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setShowModal(false); reset()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  })

  const { mutate: deleteTx } = useMutation({
    mutationFn: (id) => transactionApi.delete(id),
    onSuccess: () => {
      toast.success('Transaction supprimée')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const txFiltrees = typeFiltre === 'TOUS' ? allTx : allTx.filter(t => t.type === typeFiltre)

  const inputCls = (err) => `w-full px-3 py-2.5 rounded-xl bg-slate-800 border text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 ${err ? 'border-red-500' : 'border-slate-700'}`

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ArrowLeftRight size={28} className="text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-slate-500 text-sm">{pageData?.totalElements || 0} au total</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors">
          <Plus size={18} /> Nouvelle
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {['TOUS', 'REVENU', 'DEPENSE'].map(t => (
          <button key={t} onClick={() => setTypeFiltre(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${typeFiltre === t ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {t === 'TOUS' ? 'Tout' : t === 'REVENU' ? '↑ Revenus' : '↓ Dépenses'}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? <div className="p-8"><LoadingSpinner /></div>
        : txFiltrees.length === 0 ? (
          <div className="p-16 text-center text-slate-600">
            <p className="text-3xl mb-3">💸</p>
            <p>Aucune transaction</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {txFiltrees.map(tx => (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-2xl flex-shrink-0">{tx.categorie?.icone || '💳'}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{tx.libelle}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-500">
                        {tx.date && format(new Date(tx.date), 'dd MMM yyyy', { locale: fr })}
                      </span>
                      <span className="text-xs text-slate-600">{tx.categorie?.nom}</span>
                      {tx.modePaiement && <ModePaiementBadge mode={tx.modePaiement} />}
                    </div>
                    {tx.notes && <p className="text-xs text-slate-600 mt-0.5 truncate">{tx.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className={`font-bold text-lg ${tx.type === 'REVENU' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'REVENU' ? '+' : '-'}{Number(tx.montant).toLocaleString('fr-FR')} F
                    </p>
                    <TypeBadge type={tx.type} />
                  </div>
                  <button onClick={() => window.confirm('Supprimer cette transaction ?') && deleteTx(tx.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {pageData && pageData.totalPages > 1 && (
          <div className="px-5 pb-5">
            <Pagination page={pageData.page} totalPages={pageData.totalPages}
              totalElements={pageData.totalElements} size={size} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modal nouvelle transaction */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="font-bold text-white text-lg">Nouvelle transaction</h2>
              <button onClick={() => { setShowModal(false); reset() }} className="text-slate-500 hover:text-white"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit(createTx)} className="p-5 space-y-4">

              {/* Type */}
              <div className="grid grid-cols-2 gap-2">
                {['REVENU', 'DEPENSE'].map(t => (
                  <label key={t} className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors
                    ${typeSaisi === t
                      ? (t === 'REVENU' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400')
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                    <input type="radio" value={t} {...register('type')} className="sr-only" />
                    <span className="font-semibold text-sm">{t === 'REVENU' ? '↑ Revenu' : '↓ Dépense'}</span>
                  </label>
                ))}
              </div>

              {/* Libellé */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Libellé *</label>
                <input type="text" placeholder="Ex: Courses Supermarché Casino"
                  {...register('libelle', { required: 'Obligatoire' })} className={inputCls(errors.libelle)} />
                {errors.libelle && <p className="text-red-400 text-xs mt-1">{errors.libelle.message}</p>}
              </div>

              {/* Montant + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Montant (FCFA) *</label>
                  <input type="number" min="1" step="100" placeholder="25000"
                    {...register('montant', { required: 'Obligatoire', min: { value: 1, message: 'Montant > 0' } })}
                    className={inputCls(errors.montant)} />
                  {errors.montant && <p className="text-red-400 text-xs mt-1">{errors.montant.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Date *</label>
                  <input type="date" {...register('date', { required: 'Obligatoire' })} className={inputCls(errors.date)} />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Catégorie *</label>
                <select {...register('categorieId', { required: 'Obligatoire' })}
                  className={`w-full px-3 py-2.5 rounded-xl bg-slate-800 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 ${errors.categorieId ? 'border-red-500' : 'border-slate-700'}`}>
                  <option value="">Choisir une catégorie</option>
                  {catsFiltrees.map(c => (
                    <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>
                  ))}
                </select>
                {errors.categorieId && <p className="text-red-400 text-xs mt-1">{errors.categorieId.message}</p>}
              </div>

              {/* Mode de paiement (surtout pour les dépenses) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mode de paiement</label>
                <select {...register('modePaiement')}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500">
                  <option value="">Non précisé</option>
                  <option value="MTN_MOBILE_MONEY">📱 MTN Mobile Money</option>
                  <option value="ORANGE_MONEY">🟠 Orange Money</option>
                  <option value="EXPRESS_UNION">🔵 Express Union</option>
                  <option value="ESPECES">💵 Espèces</option>
                  <option value="CARTE_BANCAIRE">💳 Carte bancaire</option>
                  <option value="VIREMENT">🏦 Virement</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
                <input type="text" placeholder="Notes optionnelles..."
                  {...register('notes')} className={inputCls(false)} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); reset() }}
                  className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-400 font-semibold py-3 rounded-xl transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isCreating}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-slate-900 font-bold py-3 rounded-xl transition-colors">
                  {isCreating ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
