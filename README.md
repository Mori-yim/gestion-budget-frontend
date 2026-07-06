# gestion-budget-frontend
# BudgetCam Frontend — React 18 + Recharts

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-22B5BF?style=flat)](https://recharts.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel)](https://vercel.com/)

Interface utilisateur de la plateforme **BudgetCam** — gestion de budget personnel au Cameroun (FCFA, MTN MoMo, Orange Money). Thème sombre avec dashboard analytique Recharts complet.

---

##  Table des Matières

- [À propos](#-à-propos)
- [Technologies](#-technologies)
- [Pages & Fonctionnalités](#-pages--fonctionnalités)
- [Dashboard Recharts](#-dashboard-recharts)
- [Installation](#-installation)
- [Structure du projet](#-structure-du-projet)
- [Déploiement Vercel](#-déploiement-vercel)
- [Auteur](#-auteur)

---

##  À propos

BudgetCam Frontend est une SPA React en **thème sombre** (`slate-950`) qui propose :

- **Inscription** avec email de bienvenue automatique (Spring Mail)
- **Dashboard** avec navigation entre les mois (← mois précédent | ce mois →)
- **Transactions** : créer revenus/dépenses avec mode de paiement camerounais
- **Budgets** : définir des plafonds avec indicateur d'alerte email
- **Profil** : activer/désactiver les alertes et rapports email

**Nouveauté principale :** Dashboard avec **3 graphiques Recharts** + navigation temporelle entre les mois.

---

##  Technologies

| Technologie | Version | Usage |
|------------|---------|-------|
| React | 18.3 | Framework UI |
| Vite | 5.2 | Build tool |
| React Router DOM | 6.22 | Navigation SPA |
| TanStack Query | 5.28 | Cache + état serveur |
| Recharts | 2.12 | PieChart, LineChart, BarChart |
| Axios | 1.6 | HTTP + JWT intercepteurs |
| React Hook Form | 7.51 | Formulaires validés |
| Tailwind CSS | 3.4 | Thème sombre (slate-950) |
| react-hot-toast | 2.4 | Notifications |
| date-fns | 3.3 | Formatage dates (locale FR) |
| lucide-react | 0.363 | Icônes |

---

##  Pages & Fonctionnalités

| Page | Route | Accès | Description |
|------|-------|-------|-------------|
| Accueil | `/` | Public | Hero + présentation Spring Mail |
| Connexion | `/login` | Public | Formulaire thème sombre |
| Inscription | `/register` | Public | Formulaire + info email automatique |
| Dashboard | `/dashboard` | Connecté | KPIs + 3 graphiques + navigation mois |
| Transactions | `/transactions` | Connecté | Liste + filtre type + modal création |
| Budgets | `/budgets` | Connecté | Barres progression + alertes email |
| Profil | `/profil` | Connecté | Toggles alertes/rapports + config SMTP |

---

##  Dashboard Recharts

### Navigation temporelle

```jsx
// Naviguer entre les mois avec ← et →
const [moisOffset, setMoisOffset] = useState(0) // 0 = mois courant
const targetDate = new Date(now.getFullYear(), now.getMonth() + moisOffset, 1)
const mois  = targetDate.getMonth() + 1
const annee = targetDate.getFullYear()

// Les 3 graphiques se mettent à jour automatiquement
const { data } = useQuery({
  queryKey: ['dashboard', mois, annee],
  queryFn: () => dashboardApi.getStats(mois, annee),
})
```

### 1. PieChart — Dépenses par catégorie (donut)

```jsx
<PieChart>
  <Pie data={stats.depensesParCategorie}
       dataKey="value" nameKey="name"
       outerRadius={95} innerRadius={45}>
    {stats.depensesParCategorie.map((entry, i) => (
      <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip formatter={(v) => [formatFCFA(v), 'Dépensé']} />
  <Legend />
</PieChart>
```

### 2. LineChart — Évolution revenus/dépenses sur 6 mois

```jsx
<LineChart data={stats.evolutionParMois}>
  <XAxis dataKey="mois" />
  <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
  <Line type="monotone" dataKey="revenus"  stroke="#22c55e" strokeWidth={2.5} />
  <Line type="monotone" dataKey="depenses" stroke="#ef4444" strokeWidth={2.5} />
</LineChart>
```

### 3. BarChart — Modes de paiement Mobile Money

```jsx
// Affiche MTN MoMo, Orange Money, Espèces, etc.
<BarChart data={modesData}>
  <Bar dataKey="total" fill="#eab308" name="Montant FCFA" radius={[4,4,0,0]} />
  <Bar dataKey="count" fill="#3b82f6" name="Nb transactions" radius={[4,4,0,0]} />
</BarChart>
```

---

##  Page Budgets — Alertes Spring Mail

La page Budgets affiche clairement le lien entre les budgets et les emails automatiques :

```jsx
// Barre de progression + état de l'alerte email
<div className="h-3 bg-slate-800 rounded-full overflow-hidden">
  <div className={`h-full rounded-full ${
    budget.depasse ? 'bg-red-500' :          // Dépassé → rouge
    budget.pourcentageUtilise > 80 ? 'bg-orange-500' : // Proche → orange
    'bg-green-500'                             // OK → vert
  }`} style={{ width: `${Math.min(budget.pourcentageUtilise, 100)}%` }} />
</div>

// Badge alerte
{budget.depasse
  ? " Budget dépassé — alerte email envoyée"
  : " Alerte active — email si dépassé"}
```

---

##  Page Profil — Préférences Email

Deux toggles pour contrôler les emails Spring Mail :

```jsx
// Toggle alerteBudget
<label className="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" {...register('alerteBudget')} className="sr-only peer" />
  <div className="w-11 h-6 bg-slate-700 rounded-full
       peer peer-checked:bg-green-500
       after:absolute after:top-[2px] after:start-[2px]
       after:bg-white after:rounded-full after:h-5 after:w-5
       peer-checked:after:translate-x-full" />
</label>

// Sauvegarde via PUT /api/v1/auth/preferences
const updateUser = async (prefs) => {
  await authApi.updatePreferences(prefs)
  // alerteBudget et rapportMensuel mis à jour en BDD
  // Le scheduler vérifie ces valeurs avant d'envoyer
}
```

---

##  Prérequis

- Node.js 18+
- BudgetCam Backend démarré sur `http://localhost:8083`

---

##  Installation

```bash
git clone https://github.com/Mori-yim/budgetcam-frontend.git
cd budgetcam-frontend
npm install
npm run dev
# → http://localhost:5176
```

---

##  Structure du projet

```
budgetcam-frontend/
├── src/
│   ├── main.jsx                ← Providers globaux
│   ├── App.jsx                 ← Routes (auto-redirect → /dashboard si connecté)
│   ├── index.css               ← Tailwind + scrollbar thème sombre
│   ├── context/
│   │   └── AuthContext.jsx     ← login, register, logout, updateUser
│   ├── services/
│   │   └── api.js              ← authApi, categorieApi, transactionApi, budgetApi, dashboardApi
│   ├── components/
│   │   ├── Navbar.jsx          ← Thème sombre, liens actifs jaunes
│   │   └── ui/
│   │       ├── LoadingSpinner.jsx ← Spinner jaune sur fond sombre
│   │       ├── StatCard.jsx       ← KPI card thème sombre
│   │       └── TypeBadge.jsx      ← TypeBadge + ModePaiementBadge + Pagination
│   └── pages/
│       ├── HomePage.jsx           ← Présentation Spring Mail
│       ├── LoginPage.jsx          ← Thème sombre
│       ├── RegisterPage.jsx       ← Info email automatique
│       ├── DashboardPage.jsx      ← Navigation mois + 3 graphiques + budgets + transactions
│       ├── TransactionsPage.jsx   ← Liste + filtre + modal création (modes paiement CMR)
│       ├── BudgetsPage.jsx        ← Barres progression + badge alerte email
│       └── ProfilPage.jsx         ← Toggles Spring Mail + config SMTP affichée
├── vite.config.js              ← Proxy dev port 5176 → 8083
├── tailwind.config.js          ← Couleur budget: yellow-400
├── vercel.json                 ← Routing SPA
└── package.json
```

---

##  Compte de démonstration

| Email | Mot de passe |
|-------|-------------|
| jean.kamga@budgetcam.cm | Demo123! |

---

##  Déploiement Vercel

```bash
# Variable d'environnement sur Vercel :
VITE_API_URL=https://budgetcam-api.railway.app/api/v1

# Build : npm run build | Output : dist/
# vercel.json assure le routing React Router :
# { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

##  Auteur

**Mori (YIMFACK MORINO)**
-  Licence DAP — Université de Douala
-  GitHub : [@Mori-yim](https://github.com/Mori-yim)
