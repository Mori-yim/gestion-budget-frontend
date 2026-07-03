// src/components/ui/StatCard.jsx
export default function StatCard({ title, value, subtitle, icon, color = 'yellow', trend }) {
  const colors = {
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    green:  'bg-green-500/10  text-green-400  border-green-500/20',
    red:    'bg-red-500/10    text-red-400    border-red-500/20',
    blue:   'bg-blue-500/10   text-blue-400   border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
      <div className={`inline-flex p-2.5 rounded-xl mb-3 border ${colors[color] || colors.yellow}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm font-medium text-slate-400 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
      {trend && (
        <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mois dernier
        </p>
      )}
    </div>
  )
}
