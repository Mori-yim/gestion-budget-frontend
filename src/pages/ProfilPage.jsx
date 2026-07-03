// src/pages/ProfilPage.jsx
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { User, Mail, Bell, BellOff, FileText, Save, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

/**
 * ================================================================
 * PAGE PROFIL — PRÉFÉRENCES EMAIL
 * ================================================================
 * Permet à l'utilisateur de configurer :
 *   - alerteBudget     : recevoir un email si budget dépassé
 *   - rapportMensuel   : recevoir le rapport mensuel le 1er du mois
 *   - salaireMensuel   : pour calculer le taux d'épargne
 *
 * Ces préférences sont stockées en BDD et vérifiées par le Scheduler
 * avant d'envoyer les emails.
 * ================================================================
 */
export default function ProfilPage() {
  const { user, updateUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      alerteBudget:   user?.alerteBudget ?? true,
      rapportMensuel: user?.rapportMensuel ?? true,
      salaireMensuel: user?.salaireMensuel || '',
    }
  })

  const alerteActive   = watch('alerteBudget')
  const rapportActif   = watch('rapportMensuel')

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      await updateUser({
        alerteBudget:   data.alerteBudget,
        rapportMensuel: data.rapportMensuel,
        salaireMensuel: data.salaireMensuel ? parseFloat(data.salaireMensuel) : null,
      })
      toast.success('Préférences sauvegardées !')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-8">
        <User size={28} className="text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
          <p className="text-slate-500 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Infos compte */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <User size={18} className="text-yellow-400" />
          Informations du compte
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Prénom', value: user?.firstName },
            { label: 'Nom', value: user?.lastName },
            { label: 'Email', value: user?.email },
            { label: 'Téléphone', value: user?.phone || '—' },
            { label: 'Devise', value: user?.devise || 'FCFA' },
            { label: 'Membre depuis', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—' },
          ].map((info, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">{info.label}</p>
              <p className="text-sm font-medium text-white truncate">{info.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Préférences email */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Mail size={18} className="text-blue-400" />
            Préférences email
            <span className="text-xs text-slate-500 font-normal ml-1">via Spring Mail</span>
          </h2>
          <p className="text-slate-500 text-sm mb-5">
            Configurez les emails automatiques que BudgetCam vous envoie.
          </p>

          {/* Toggle : Alertes budget */}
          <div className={`flex items-start justify-between p-4 rounded-xl border mb-3 transition-colors
            ${alerteActive ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-800 border-slate-700'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${alerteActive ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                {alerteActive ? <Bell size={18} className="text-green-400" /> : <BellOff size={18} className="text-slate-500" />}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Alertes de dépassement budget</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Reçois un email dès qu'une dépense dépasse le budget d'une catégorie.
                  Envoyé automatiquement via <code className="bg-slate-700 px-1 rounded text-yellow-400">@Async</code> Spring Mail.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
              <input type="checkbox" {...register('alerteBudget')} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
            </label>
          </div>

          {/* Toggle : Rapport mensuel */}
          <div className={`flex items-start justify-between p-4 rounded-xl border transition-colors
            ${rapportActif ? 'bg-purple-500/10 border-purple-500/20' : 'bg-slate-800 border-slate-700'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${rapportActif ? 'bg-purple-500/20' : 'bg-slate-700'}`}>
                <FileText size={18} className={rapportActif ? 'text-purple-400' : 'text-slate-500'} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Rapport mensuel automatique</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Reçois un résumé HTML de tes finances le 1er de chaque mois.
                  Généré par <code className="bg-slate-700 px-1 rounded text-yellow-400">@Scheduled</code> Spring Boot.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
              <input type="checkbox" {...register('rapportMensuel')} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500" />
            </label>
          </div>
        </div>

        {/* Salaire mensuel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-2">Salaire mensuel (FCFA)</h2>
          <p className="text-slate-500 text-sm mb-4">
            Utilisé pour calculer votre taux d'épargne dans le dashboard.
          </p>
          <input
            type="number" min="0" step="5000"
            placeholder="Ex: 350000"
            {...register('salaireMensuel')}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500"
          />
        </div>

        {/* Bouton sauvegarder */}
        <button type="submit" disabled={isSaving}
          className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2
            ${saved
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-slate-900'}`}>
          {saved
            ? <><CheckCircle size={20} /> Préférences sauvegardées !</>
            : isSaving
            ? 'Sauvegarde...'
            : <><Save size={20} /> Sauvegarder les préférences</>}
        </button>
      </form>

      {/* Info configuration Spring Mail */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-3 text-sm">⚙️ Configuration Spring Mail</h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-3">
          Les emails sont envoyés via <strong className="text-white">Spring Boot Starter Mail</strong> + serveur SMTP.
          Pour activer l'envoi réel, configurez dans <code className="bg-slate-800 px-1 rounded text-yellow-400">application.properties</code> :
        </p>
        <div className="bg-slate-800 rounded-xl p-3 font-mono text-xs space-y-1">
          <p className="text-green-400"># Option 1 : Mailtrap (test)</p>
          <p className="text-slate-300">spring.mail.host=sandbox.smtp.mailtrap.io</p>
          <p className="text-slate-300">spring.mail.port=2525</p>
          <p className="text-green-400 mt-2"># Option 2 : Gmail SMTP</p>
          <p className="text-slate-300">spring.mail.host=smtp.gmail.com</p>
          <p className="text-slate-300">spring.mail.port=587</p>
          <p className="text-slate-300">spring.mail.username=votre@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
