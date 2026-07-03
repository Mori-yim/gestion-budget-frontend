// src/pages/DashboardPage.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, Target,
  ArrowLeftRight, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { dashboardApi } from '../services/api'
import StatCard from '../components/ui/StatCard'
import { TypeBadge, ModePaiementBadge } from '../components/ui/TypeBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Couleurs graphiques (thème sombre)
const COLORS = ['#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#14b8a6', '#f97316', '#ec4899']

// Labels lisibles pour les modes de paiement camerounais
const MODE_LABELS = {
  MTN_MOBILE_MONEY: 'MTN MoMo',
  ORANGE_MONEY: 'Orange Money',
  EXPRESS_UNION: 'Express Union',
  ESPECES: 'Espèces',
  CARTE_BANCAIRE: 'Carte',
  VIREMENT: 'Virement',
  AUTRE: 'Autre',
}

// Formater les montants FCFA
const formatFCFA = (val) => {
  if (!val && val !== 0) return '0'
  return Number(val).toLocaleString('fr-FR') + ' F'
}

/**
 * ================================================================
 * DASHBOARD BUDGETCAM
 * ================================================================
 * Affiche les statistiques financières du mois sélectionné.
 *
 * Graphiques Recharts :
 *   - PieChart   : dépenses par catégorie (donut)
 *   - LineChart  : évolution revenus/dépenses sur 6 mois
 *   - BarChart   : dépenses par mode de paiement (Mobile Money)
 *
 * Navigation : ← mois précédent | mois suivant →
 * ================================================================
 */
export default function DashboardPage() {
  // Navigation entre les mois
  const [moisOffset, setMoisOffset] = useState(0) // 0 = mois courant, -1 = mois précédent...
  const now = new Date()
  const targetDate = new Date(now.getFullYear(), now.getMonth() + moisOffset, 1)
  const mois = targetDate.getMonth() + 1
  const annee = targetDate.getFullYear()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', mois, annee],
    queryFn: () => dashboardApi.getStats(mois, annee),
    staleTime: 1000 * 60,
  })

  const stats = data?.data?.data

  // Formater les données pour Recharts
  const modesData = (stats?.statsParModePaiement || []).map(m => ({
    name: MODE_LABELS[m.mode] || m.mode,
    total: Number(m.total) || 0,
    count: Number(m.count) || 0,
  }))

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <LoadingSpinner message="Chargement de votre dashboard..." />
    </div>
  )

  const soldeMois = stats?.soldeMois || 0
  const isPositif = Number(soldeMois) >= 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── En-tête avec navigation mois ──────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {stats?.moisLabel || format(targetDate, 'MMMM yyyy', { locale: fr })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation mois précédent / suivant */}
          <button onClick={() => setMoisOffset(o => o - 1)}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors text-slate-400">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setMoisOffset(0)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors font-medium
              ${moisOffset === 0 ? 'bg-yellow-500 text-slate-900 border-yellow-500' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
            Ce mois
          </button>
          <button onClick={() => setMoisOffset(o => Math.min(0, o + 1))}
            disabled={moisOffset === 0}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40 transition-colors text-slate-400">
            <ChevronRight size={18} />
          </button>
          <button onClick={() => refetch()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors text-slate-400 ml-1">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Revenus"
          value={formatFCFA(stats?.totalRevenus)}
          icon={<TrendingUp size={20} />}
          color="green"
          subtitle="entrées du mois"
        />
        <StatCard
          title="Dépenses"
          value={formatFCFA(stats?.totalDepenses)}
          icon={<TrendingDown size={20} />}
          color="red"
          subtitle="sorties du mois"
        />
        <StatCard
          title="Solde du mois"
          value={`${isPositif ? '+' : ''}${formatFCFA(soldeMois)}`}
          icon={<Wallet size={20} />}
          color={isPositif ? 'green' : 'red'}
          subtitle={`Taux d'épargne : ${stats?.tauxEpargne || 0}%`}
        />
        <StatCard
          title="Transactions"
          value={stats?.nbTransactions || '0'}
          icon={<ArrowLeftRight size={20} />}
          color="yellow"
          subtitle={`${stats?.budgets?.length || 0} budget(s) actif(s)`}
        />
      </div>

      {/* ── Graphiques principaux ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* PieChart : Dépenses par catégorie (donut) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-1">Dépenses par catégorie</h2>
          <p className="text-slate-500 text-xs mb-4">Répartition du mois</p>

          {(stats?.depensesParCategorie || []).length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-600 text-sm">
              Aucune dépense ce mois
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.depensesParCategorie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={95}
                  innerRadius={45}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.depensesParCategorie.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.fill || COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(v) => [formatFCFA(v), 'Dépensé']}
                />
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span style={{ fontSize: '11px', color: '#94a3b8' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* LineChart : Évolution revenus/dépenses sur 6 mois */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-1">Évolution — 6 derniers mois</h2>
          <p className="text-slate-500 text-xs mb-4">Revenus vs Dépenses</p>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={stats?.evolutionParMois || []}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', fontSize: '12px' }}
                formatter={(v, name) => [formatFCFA(v), name === 'revenus' ? 'Revenus' : 'Dépenses']}
              />
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span style={{ fontSize: '11px', color: '#94a3b8' }}>{v === 'revenus' ? 'Revenus' : 'Dépenses'}</span>}
              />
              <Line type="monotone" dataKey="revenus" stroke="#22c55e" strokeWidth={2.5}
                dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="depenses" stroke="#ef4444" strokeWidth={2.5}
                dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BarChart : Modes de paiement (Mobile Money camerounais) */}
      {modesData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-white mb-1">Dépenses par mode de paiement</h2>
          <p className="text-slate-500 text-xs mb-4">MTN MoMo · Orange Money · Espèces · etc.</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={modesData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', fontSize: '12px' }}
                formatter={(v, name) => [
                  name === 'total' ? formatFCFA(v) : v,
                  name === 'total' ? 'Montant' : 'Transactions'
                ]}
              />
              <Legend iconType="square" iconSize={8}
                formatter={v => <span style={{ fontSize: '11px', color: '#94a3b8' }}>{v === 'total' ? 'Montant FCFA' : 'Nb transactions'}</span>}
              />
              <Bar dataKey="total" fill="#eab308" radius={[4, 4, 0, 0]} name="total" />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Budgets + Transactions récentes ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Budgets du mois */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="p-5 border-b border-slate-800 flex items-center gap-2">
            <Target size={18} className="text-yellow-400" />
            <h2 className="font-semibold text-white">Budgets du mois</h2>
          </div>
          {(stats?.budgets || []).length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-sm">
              Aucun budget défini pour ce mois
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {(stats?.budgets || []).map(budget => (
                <div key={budget.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{budget.categorie?.icone}</span>
                      <span className="text-sm font-medium text-white">{budget.categorie?.nom}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${budget.depasse ? 'text-red-400' : 'text-slate-300'}`}>
                        {formatFCFA(budget.totalDepense)}
                      </span>
                      <span className="text-slate-600 text-xs"> / {formatFCFA(budget.montantPlafond)}</span>
                    </div>
                  </div>
                  {/* Barre de progression */}
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budget.depasse ? 'bg-red-500' :
                        budget.pourcentageUtilise > 80 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.pourcentageUtilise, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs font-medium ${budget.depasse ? 'text-red-400' : 'text-slate-500'}`}>
                      {budget.depasse ? '⚠️ Dépassé' : `${budget.pourcentageUtilise}% utilisé`}
                    </span>
                    {!budget.depasse && (
                      <span className="text-xs text-slate-600">
                        Reste : {formatFCFA(budget.resteADepenser)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions récentes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="p-5 border-b border-slate-800 flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-yellow-400" />
            <h2 className="font-semibold text-white">Transactions récentes</h2>
          </div>
          {(stats?.transactionsRecentes || []).length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-sm">
              Aucune transaction ce mois
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {(stats?.transactionsRecentes || []).map(tx => (
                <div key={tx.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0">{tx.categorie?.icone || '💳'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{tx.libelle}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-slate-600">
                          {tx.date && format(new Date(tx.date), 'dd MMM', { locale: fr })}
                        </span>
                        {tx.modePaiement && <ModePaiementBadge mode={tx.modePaiement} />}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-sm font-bold ${tx.type === 'REVENU' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'REVENU' ? '+' : '-'}{formatFCFA(tx.montant)}
                    </p>
                    <TypeBadge type={tx.type} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
