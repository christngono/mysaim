# 📚 Plan du Site Web SAIM
## Plateforme de Formation en Intelligence Artificielle

---

## 📋 Vue d'ensemble
**SAIM** est une plateforme de formation en ligne complète dédiée à l'Intelligence Artificielle, offrant une expérience d'apprentissage interactive avec gestion des utilisateurs, des cours, des quiz, des exercices et un tableau de bord administrateur.

**Stack technologique :**
- **Frontend** : React 18 + Vite + TailwindCSS + Framer Motion
- **Backend** : Node.js + Express + SQLite
- **Authentification** : JWT (JSON Web Tokens)
- **Upload & Média** : Multer pour la gestion des fichiers

---

## 🏗️ Architecture Globale

### Flux Utilisateur
```
Public (Non authentifié)
    ├─ Landing Page (page d'accueil)
    ├─ About Page (À propos)
    ├─ Formation Page (Présentation des cours)
    └─ Auth Modal (Connexion/Inscription)

Utilisateur Authentifié
    ├─ Accès au Dashboard Utilisateur
    ├─ Navigation dans les modules et leçons
    ├─ Passage des quiz
    ├─ Soumission d'exercices
    └─ Consultation des notifications

Administrateur
    ├─ Accès au Dashboard Admin
    ├─ Gestion des utilisateurs
    ├─ Gestion des modules et leçons
    ├─ Gestion des quiz et questions
    ├─ Gestion des exercices
    ├─ Consultations des statistiques
    └─ Gestion des uploads médias
```

---

## 🎨 Frontend (React + Vite)

### Pages Principales

#### 1. **Landing Page** (`LandingPage.jsx`)
- **Objectif** : Page d'accueil de présentation
- **Contenu** :
  - Barre de navigation (Navbar)
  - Hero section avec CTA (Call-to-Action)
  - Section de présentation des fonctionnalités
  - Modules d'apprentissage en vedette
  - Témoignages ou statistiques
  - Footer
  - Animation Framer Motion
- **Actions possibles** :
  - Navigation vers About Page
  - Navigation vers Formation Page
  - Boutons Login/Register (ouvre AuthModal)
  - Accès au Dashboard (si authentifié)

#### 2. **About Page** (`AboutPage.jsx`)
- **Objectif** : Présentation détaillée de la plateforme
- **Contenu** :
  - Historique et mission de SAIM
  - Équipe ou partenaires
  - Avantages de la plateforme
  - Informations de contact

#### 3. **Formation Page** (`FormationPage.jsx`)
- **Objectif** : Catalogue des cours disponibles
- **Contenu** :
  - Liste des modules de formation
  - Descriptions et prérequis
  - Durée estimée
  - Niveau de difficulté
  - Boutons "Commencer" ou "Continuer"

#### 4. **User Dashboard** (`UserDashboard.jsx`)
- **Objectif** : Espace personnel de l'utilisateur
- **Contenu** :
  - Progression globale
  - Liste des modules (avec statut : verrouillé, en cours, complété)
  - Pour chaque module :
    - **Leçons** (avec vidéos/contenu)
    - **Quiz** (avec score et tentatives)
    - **Exercices** (avec soumissions)
  - Notifications
  - Statistiques personnelles
  - Boutons d'action :
    - Continuer une leçon
    - Passer un quiz
    - Soumettre un exercice
    - Consulter les résultats

#### 5. **Admin Dashboard** (`AdminDashboard.jsx`)
- **Objectif** : Interface de gestion complète
- **Sections** :
  - **Gestion Utilisateurs**
    - Liste, création, modification, suppression
    - Filtres et recherche
  - **Gestion Modules & Leçons**
    - Création/édition de modules
    - Création/édition de leçons
    - Gestion de l'ordre et publication
  - **Gestion Quiz & Questions**
    - Création de quiz par module
    - Gestion des questions à choix multiples
  - **Gestion Exercices**
    - Création et publication d'exercices
    - Consultation des soumissions utilisateur
  - **Statistiques**
    - Statistiques d'utilisation (nombre d'utilisateurs, leçons complétées, etc.)
    - Temps d'apprentissage par utilisateur
    - Taux de réussite des quiz
  - **Gestion Uploads**
    - Upload de vidéos
    - Upload d'images
    - Gestion des ressources médias

### Composants Réutilisables
- **Navbar** : Navigation principale avec logo, liens et authentification
- **Footer** : Pied de page avec liens et informations
- **AuthModal** : Modal pour login/register
- **LangToggle** : Sélecteur de langue (FR/EN)
- **QuizView** : Composant de visualisation des quiz
- **UI Components** : Composants Tailwind personnalisés

### Contextes (State Management)
- **AuthContext** : Gestion de l'authentification utilisateur
- **LangContext** : Gestion de la langue (i18n)

### Utilitaires
- **Translations** (`i18n/translations.js`) : Traductions FR/EN
- **Sanitize** (`utils/sanitize.js`) : Nettoyage du contenu HTML (DOMPurify)
- **Axios** (`api/axios.js`) : Client HTTP configuré

---

## 🔧 Backend (Express + Node.js)

### Structure des Routes

#### 1. **Authentication** (`/api/auth`)
- `POST /register` - Inscription utilisateur
  - Validation email/password
  - Hashage du mot de passe (bcryptjs)
  - Création de l'utilisateur
- `POST /login` - Connexion
  - Vérification des identifiants
  - Génération du JWT
  - Retour du token et données utilisateur
- `GET /me` - Récupérer profil utilisateur (require Auth)

#### 2. **Courses** (`/api/courses`)
- `GET /modules` - Liste des modules avec leçons et progression (require Auth)
  - Retourne : modules, leçons publiées, progression de l'utilisateur
- `GET /lessons/:id` - Détails d'une leçon (require Auth)
- `POST /lessons/:id/complete` - Marquer une leçon comme complétée (require Auth)
- `POST /track-time` - Enregistrer le temps d'apprentissage (require Auth)
- `GET /progress` - Statistiques de progression utilisateur (require Auth)

#### 3. **Quiz** (`/api/quiz`)
- `GET /module/:moduleId` - Quiz du module (require Auth)
- `POST /:quizId/submit` - Soumettre les réponses (require Auth)
  - Scoring automatique
  - Enregistrement de la tentative
- `GET /:quizId/my-attempts` - Historique des tentatives (require Auth)
- `GET /scores` - Tous les scores utilisateur (require Auth)

#### 4. **Exercises** (`/api/exercises`)
- `GET /module/:moduleId` - Exercices du module (require Auth)
- `POST /:exerciseId/submit` - Soumettre une solution (require Auth)
- `GET /:exerciseId/my-submission` - Ma soumission (require Auth)

#### 5. **Questions** (`/api/questions`)
- `POST /` - Poser une question au forum (require Auth)
- `GET /my` - Mes questions (require Auth)
- Admin: répondre aux questions

#### 6. **Notifications** (`/api/notifications`)
- `GET /` - Liste des notifications (require Auth)
- `GET /count` - Nombre de notifications non lues (require Auth)
- `PUT /:id/read` - Marquer notification comme lue (require Auth)
- `PUT /read-all` - Marquer toutes comme lues (require Auth)

#### 7. **Contact** (`/api/contact`)
- `POST /` - Envoyer un message de contact

#### 8. **Admin Routes** (`/api/admin`)
**Gestion Utilisateurs :**
- `GET /users` - Liste des utilisateurs
- `POST /users` - Créer utilisateur
- `GET /users/:id` - Détails utilisateur
- `PUT /users/:id` - Modifier utilisateur
- `DELETE /users/:id` - Supprimer utilisateur

**Gestion Modules & Leçons :**
- `GET /modules` - Tous les modules
- `POST /modules` - Créer module
- `PUT /modules/:id` - Modifier module
- `DELETE /modules/:id` - Supprimer module
- `GET /modules/:moduleId/lessons` - Leçons du module
- `POST /modules/:moduleId/lessons` - Créer leçon
- `PUT /lessons/:id` - Modifier leçon
- `DELETE /lessons/:id` - Supprimer leçon

**Gestion Quiz & Questions :**
- `GET /quizzes` - Tous les quiz
- `POST /quizzes` - Créer quiz
- `PUT /quizzes/:id` - Modifier quiz
- `DELETE /quizzes/:id` - Supprimer quiz
- `GET /quizzes/:id/questions` - Questions du quiz
- `POST /quizzes/:id/questions` - Ajouter question
- `DELETE /questions/:id` - Supprimer question
- `PUT /questions/:id/answer` - Ajouter/modifier réponse

**Gestion Exercices :**
- `GET /exercises` - Tous les exercices
- Gestion des soumissions d'exercices

**Statistiques :**
- `GET /stats` - Statistiques globales
- `GET /time-stats` - Statistiques de temps d'apprentissage
- `GET /progress` - Progression des utilisateurs

**Autres :**
- `GET /quotes` - Citations/ressources
- `DELETE /quotes/:id` - Supprimer citation
- `POST /upload` - Upload de fichiers (images/vidéos)

#### 9. **Upload** (`/api/admin/upload`)
- Upload sécurisé de fichiers avec Multer
- Stockage dans `/uploads` et `/images`

### Middleware
- **Auth Middleware** (`middleware/auth.js`)
  - Vérification du JWT
  - Extraction des données utilisateur
  - `requireAuth` : middleware de protection
  - `requireAdmin` : middleware pour les admins

### Base de Données (SQLite)
- **Tables principales** :
  - `users` - Utilisateurs (email, password hash, role)
  - `modules` - Modules de formation
  - `lessons` - Leçons des modules
  - `quizzes` - Quiz associés aux modules
  - `quiz_questions` - Questions des quiz
  - `quiz_attempts` - Tentatives d'utilisateur
  - `exercises` - Exercices
  - `exercise_submissions` - Soumissions d'exercices
  - `user_progress` - Progression des leçons
  - `notifications` - Notifications utilisateur
  - `questions` - Questions du forum
  - `learning_time` - Temps d'apprentissage enregistré

### Configuration
- **CORS** : Configuré pour localhost en développement, domaine de frontend en production
- **Port par défaut** : 5001
- **Variables d'environnement** :
  - `PORT` - Port du serveur
  - `NODE_ENV` - Mode (development/production)
  - `FRONTEND_URL` - URL du frontend en production

### Health Check
- `GET /api/health` - Vérifier l'état du serveur

---

## 📁 Structure des Fichiers

```
mysaim/
├── backend/
│   ├── server.js                    # Point d'entrée Express
│   ├── package.json                 # Dépendances backend
│   ├── db/
│   │   └── database.js              # Configuration SQLite
│   ├── middleware/
│   │   └── auth.js                  # Middleware authentification
│   ├── routes/
│   │   ├── auth.js                  # Routes authentification
│   │   ├── courses.js               # Routes cours/modules/leçons
│   │   ├── quiz.js                  # Routes quiz
│   │   ├── exercises.js             # Routes exercices
│   │   ├── questions.js             # Routes forum
│   │   ├── notifications.js         # Routes notifications
│   │   ├── admin.js                 # Routes administration
│   │   ├── contact.js               # Routes contact
│   │   └── upload.js                # Routes upload
│   └── seed.js                      # Scripts de seed/initialisation
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Composant racine
│   │   ├── main.jsx                 # Point d'entrée
│   │   ├── index.css                # Styles globaux
│   │   ├── api/
│   │   │   └── axios.js             # Configuration Axios
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Barre de navigation
│   │   │   ├── Footer.jsx           # Pied de page
│   │   │   ├── AuthModal.jsx        # Modal auth
│   │   │   ├── LangToggle.jsx       # Sélecteur langue
│   │   │   ├── QuizView.jsx         # Vue quiz
│   │   │   └── ui/                  # Composants UI
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Page d'accueil
│   │   │   ├── AboutPage.jsx        # À propos
│   │   │   ├── FormationPage.jsx    # Catalogue cours
│   │   │   ├── UserDashboard.jsx    # Dashboard utilisateur
│   │   │   └── AdminDashboard.jsx   # Dashboard admin
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Contexte authentification
│   │   │   └── LangContext.jsx      # Contexte langue
│   │   ├── i18n/
│   │   │   └── translations.js      # Traductions FR/EN
│   │   └── utils/
│   │       └── sanitize.js          # Sanitization HTML
│   ├── public/
│   │   ├── images/                  # Images statiques
│   │   └── videos/                  # Vidéos
│   ├── package.json                 # Dépendances frontend
│   ├── vite.config.js               # Configuration Vite
│   ├── tailwind.config.js           # Configuration TailwindCSS
│   └── postcss.config.js            # Configuration PostCSS
│
├── images/                          # Ressources médias (modules)
├── uploads/                         # Fichiers uploadés par admin
├── index.html                       # HTML principal
├── deploy.sh                        # Script de déploiement
└── setup-vps.sh                     # Script setup VPS
```

---

## 🔐 Sécurité & Authentification

### Authentification
- **Inscription** : Validation email, hashage password avec bcryptjs
- **Connexion** : JWT généré et stocké côté client
- **Middleware Auth** : Vérification JWT sur routes protégées
- **Rôles** : `user` ou `admin`

### Protection des Routes
- Routes publiques : Landing, About, Formation, Auth
- Routes utilisateur : Dashboard, Courses, Quiz, Exercises (require Auth)
- Routes admin : Gestion complète (require Admin role)

### Sanitization
- DOMPurify pour nettoyer le contenu HTML
- Validation des inputs côté serveur

---

## 🎯 Flux d'Utilisation Principaux

### Flux Utilisateur Standard
1. **Arrivée** → Landing Page
2. **Consultation** → About/Formation Pages
3. **Inscription** → AuthModal (register)
4. **Accès** → User Dashboard
5. **Apprentissage** → Navigation modules → Leçons → Quiz → Exercices
6. **Suivi** → Notifications, statistiques personnelles

### Flux Administrateur
1. **Connexion** → Admin Dashboard
2. **Gestion** → Utilisateurs, Modules, Quiz, Exercices
3. **Upload** → Vidéos, images, ressources
4. **Monitoring** → Statistiques d'utilisation et progrès

---

## 🚀 Déploiement

### Scripts Disponibles
- **`deploy.sh`** - Script de déploiement automatisé
- **`setup-vps.sh`** - Configuration initiale du VPS

### Commandes Frontend
```bash
npm run dev      # Démarrage développement (Vite)
npm run build    # Build production
npm run preview  # Aperçu production
```

### Commandes Backend
```bash
npm start        # Démarrage production
npm run dev      # Démarrage développement (nodemon)
npm run seed     # Initialisation base de données
```

---

## 📊 Fonctionnalités Principales

| Fonctionnalité | Description | Utilisateur | Admin |
|---|---|---|---|
| **Authentification** | Register/Login/Logout | ✅ | ✅ |
| **Modules & Leçons** | Consultation du contenu | ✅ | ✅ CRUD |
| **Quiz** | Passage et notation | ✅ | ✅ CRUD |
| **Exercices** | Soumission et évaluation | ✅ | ✅ CRUD |
| **Progression** | Suivi personnalisé | ✅ | ✅ Vue |
| **Notifications** | Alertes système | ✅ | ✅ Création |
| **Forum** | Questions/réponses | ✅ Poser | ✅ Répondre |
| **Gestion Utilisateurs** | CRUD users | ❌ | ✅ |
| **Gestion Contenu** | CRUD modules/leçons/quiz | ❌ | ✅ |
| **Upload Médias** | Stockage fichiers | ❌ | ✅ |
| **Statistiques** | Rapports analytiques | ❌ | ✅ |

---

## 🌐 Internationalisation (i18n)
- Traductions FR/EN
- Sélecteur de langue dans la Navbar
- Persistance du choix de langue
- Traductions appliquées dynamiquement

---

## 🎨 Design & UX
- **Style** : TailwindCSS avec variantes personnalisées
- **Animations** : Framer Motion pour transitions fluides
- **Réactivité** : Design mobile-first
- **Accessibilité** : Navigation logique et claire
- **Thème** : Bleu principal (#0284C7) avec accents oranges

---

## 📝 Notes de Développement

### Points clés à considérer :
1. **Scalabilité** : SQLite peut être remplacé par PostgreSQL pour la production
2. **Performance** : Optimisation images/vidéos importantes
3. **Cache** : Implémenter Redis pour sessions utilisateur
4. **Tests** : Ajouter tests unitaires et intégration
5. **Monitoring** : Implémenter logs et monitoring en production
6. **Sauvegardes** : Stratégie de backup base de données

---

**Version** : 1.0.0  
**Dernière mise à jour** : Mai 2026  
**Statut** : En développement/Production
