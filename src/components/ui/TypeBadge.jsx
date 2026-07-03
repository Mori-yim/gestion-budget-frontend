// src/components/ui/TypeBadge.jsx
export function TypeBadge({ type }) {
  if (type === 'REVENU')
    return <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">↑ Revenu</span>
  return <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">↓ Dépense</span>
}

export function ModePaiementBadge({ mode }) {
  const config = {
    MTN_MOBILE_MONEY: { label: 'MTN MoMo', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    ORANGE_MONEY:     { label: 'Orange Money', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    EXPRESS_UNION:    { label: 'Express Union', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    ESPECES:          { label: 'Espèces', cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    CARTE_BANCAIRE:   { label: 'Carte', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    VIREMENT:         { label: 'Virement', cls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  }
  if (!mode) return null
  const { label, cls } = config[mode] || { label: mode, cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>
}

// src/components/ui/Pagination.jsx (thème sombre)
export function Pagination({ page, totalPages, totalElements, size, onPageChange }) {
  if (totalPages <= 1) return null
  const debut = page * size + 1
  const fin = Math.min((page + 1) * size, totalElements)
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
      <p className="text-sm text-slate-500">
        <span className="font-medium text-slate-300">{debut}–{fin}</span> sur <span className="font-medium text-slate-300">{totalElements}</span>
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 0}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-400">
          ← Préc.
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p = totalPages > 5 ? (page <= 2 ? i : page >= totalPages - 3 ? totalPages - 5 + i : page - 2 + i) : i
          return (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-sm rounded-lg transition-colors ${p === page ? 'bg-yellow-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>
              {p + 1}
            </button>
          )
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-400">
          Suiv. →
        </button>
      </div>
    </div>
  )
}
