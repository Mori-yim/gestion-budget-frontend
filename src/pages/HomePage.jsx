// src/pages/HomePage.jsx
import { Link } from 'react-router-dom'
import { Wallet, TrendingUp, Bell, PieChart, Mail, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="bg-slate-950">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 text-sm px-4 py-1.5 rounded-full mb-6 border border-yellow-500/20">
          <Mail size={14} /> Alertes email automatiques • Spring Mail
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Gérez votre<br />
          <span className="text-yellow-400">budget</span> simplement
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Suivez vos dépenses en FCFA, gérez vos budgets MTN MoMo et Orange Money,
          et recevez des alertes email intelligentes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register"
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2">
            <Wallet size={20} /> Créer mon compte gratuit
          </Link>
          <Link to="/login"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            Se connecter <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <PieChart size={28} className="text-yellow-400" />, title: 'Dashboard Recharts', desc: 'PieChart dépenses, LineChart évolution 6 mois, BarChart modes de paiement.' },
            { icon: <TrendingUp size={28} className="text-green-400" />, title: 'Budgets & Alertes', desc: 'Définissez un budget par catégorie. Alerte email automatique si dépassé.' },
            { icon: <Mail size={28} className="text-blue-400" />, title: 'Spring Mail', desc: 'Email de bienvenue, alerte dépassement, rapport mensuel automatique le 1er du mois.' },
            { icon: <Bell size={28} className="text-purple-400" />, title: 'Rapports mensuels', desc: 'Récapitulatif HTML professionnel envoyé automatiquement par @Scheduled.' },
          ].map((f, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
              <div className="bg-slate-800 inline-flex p-3 rounded-xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EMAIL HIGHLIGHT */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
              <Mail size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Spring Mail + Thymeleaf</h2>
              <p className="text-slate-400 text-sm">Nouveauté principale de ce projet</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '🎉', title: 'Email de bienvenue', desc: 'Envoyé automatiquement à l\'inscription, HTML avec Thymeleaf.' },
              { emoji: '⚠️', title: 'Alerte budget', desc: 'Quand une dépense fait dépasser le budget fixé. @Async non-bloquant.' },
              { emoji: '📊', title: 'Rapport mensuel', desc: 'Le 1er de chaque mois via @Scheduled. Résumé complet des finances.' },
            ].map((e, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="text-3xl mb-3">{e.emoji}</div>
                <h3 className="font-semibold text-white mb-1">{e.title}</h3>
                <p className="text-slate-400 text-sm">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8 text-center">
        <p className="text-slate-600 text-sm">© 2025 BudgetCam — Mori | Université de Douala, DAP</p>
      </footer>
    </div>
  )
}
