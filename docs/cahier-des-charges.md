# 📋 Cahier des charges : application de devis et facturation pour TPE

> Document de référence du projet. Il décrit **ce qu'on construit**, **avec quoi**, **selon quelles règles**, et liste **toutes les missions** (tickets) découpées en sprints.
> Les critères d'acceptation détaillés de chaque ticket sont donnés par le Lead Dev au moment où le ticket est assigné.

---

## 1. Contexte et objectif

Les artisans, freelances et TPE perdent du temps sur leur administratif : devis faits sous Word, factures numérotées à la main, impayés oubliés.

**Objectif :** une application web simple qui permet de :
- gérer ses clients et son catalogue de prestations ;
- créer des devis, les faire accepter en ligne, puis les convertir en factures ;
- générer des PDF conformes à la législation française ;
- suivre les paiements et relancer automatiquement les impayés ;
- visualiser son activité sur un tableau de bord.

### Utilisateurs cibles

| Rôle | Description | Droits principaux |
|---|---|---|
| **Gérant** | Propriétaire du compte entreprise | Tout : paramètres de l'entreprise, utilisateurs, facturation, tableau de bord |
| **Collaborateur** | Salarié ou associé | Clients, catalogue, devis. Droits sur les factures à définir en conception (Sprint 3) |
| **Client final** | Le client de l'artisan, sans compte | Consulte un devis via un lien sécurisé, l'accepte ou le refuse |

---

## 2. Stack technique imposée

| Couche | Technologie |
|---|---|
| Front | HTML, CSS, JavaScript vanilla (**aucun framework**) |
| Back | Node.js + Express |
| Base de données | PostgreSQL |
| Tests | Jest |
| Outils | VS Code, ESLint, Prettier, Git, GitHub |
| Déploiement | Render ou Railway |

---

## 3. Périmètre fonctionnel

### 3.1 Clients
- Créer, consulter, modifier et archiver un client (particulier ou professionnel).
- Un client lié à un devis ou une facture **ne peut pas être supprimé**, seulement archivé.

### 3.2 Catalogue de prestations
- Prestations avec libellé, description, prix unitaire HT, unité (heure, jour, forfait, pièce…) et taux de TVA par défaut.

### 3.3 Devis
- Création à partir d'un client et de lignes : issues du catalogue ou saisies librement.
- Calcul automatique des totaux HT, TVA (par taux) et TTC.
- Durée de validité.
- Statuts : `brouillon` → `envoyé` → `accepté` / `refusé` → `facturé`.

### 3.4 Factures
- Conversion d'un devis accepté en facture, ou création directe.
- **Numérotation séquentielle, chronologique et sans trou.** Le numéro est attribué au moment de l'émission, pas à la création du brouillon.
- Une facture émise **ne se modifie pas et ne se supprime jamais**. Pour la corriger, on émet un avoir.
- Statuts : `brouillon` → `envoyée` → `payée`, ou `en retard` si l'échéance est dépassée sans paiement.

### 3.5 PDF et envoi
- PDF de devis et de facture contenant toutes les mentions obligatoires (voir section 4).
- Envoi par email avec le PDF en pièce jointe.

### 3.6 Acceptation en ligne
- Le client reçoit un lien unique, sécurisé et limité dans le temps.
- Il peut accepter (avec une validation explicite) ou refuser le devis.
- L'acceptation est tracée : date, heure, adresse IP.

### 3.7 Relances automatiques
- Détection quotidienne des factures échues et impayées.
- Emails de relance selon un calendrier paramétrable (par exemple J+7, J+15, J+30).
- Historique des relances envoyées.

### 3.8 Tableau de bord
- Chiffre d'affaires mensuel (encaissé et facturé).
- Montants en attente de paiement et montants en retard.
- Top clients par chiffre d'affaires.

### 3.9 Bonus (après le cœur du projet)
- Paiement en ligne via Stripe (**mode test uniquement**).
- Export CSV pour le comptable.
- Factur-X (facture électronique PDF + XML).

---

## 4. Contraintes légales (France)

> ⚠️ La liste ci-dessous est un point de départ. **Le ticket PDF-01 consiste à la vérifier et à la compléter à partir des sources officielles** (service-public.fr, entreprendre.service-public.fr, impots.gouv.fr, economie.gouv.fr).

**Mentions à vérifier sur une facture (non exhaustif) :**
- Numéro unique et séquentiel, date d'émission.
- Identité du vendeur : nom ou raison sociale, adresse, SIREN/SIRET, forme juridique, n° de TVA intracommunautaire s'il existe.
- Identité du client et adresse de facturation.
- Désignation précise, quantité, prix unitaire HT de chaque ligne.
- Taux de TVA applicable, total HT, montant de TVA, total TTC.
- Date d'échéance du paiement.
- Taux des pénalités de retard et indemnité forfaitaire pour frais de recouvrement (entre professionnels).
- Conditions d'escompte.
- Cas particuliers : franchise en base de TVA (mention de l'article 293 B du CGI), autoliquidation, etc.

**Règles métier dérivées :**
- Numérotation sans trou, y compris en cas d'accès simultanés : nécessite des **transactions SQL**.
- Immuabilité des factures émises.
- Conservation des factures (durée légale à vérifier).
- Réforme de la facturation électronique : calendrier et obligations à vérifier (lien avec le bonus Factur-X).

---

## 5. Exigences non fonctionnelles

### 5.1 Sécurité
- Mots de passe **hashés** (bcrypt ou argon2), jamais stockés en clair.
- **Validation de toutes les entrées** côté serveur. La validation côté client ne compte pas comme sécurité.
- **Requêtes SQL paramétrées** uniquement, jamais de concaténation (protection contre l'injection SQL).
- Protection **XSS** : échappement des données affichées, pas de `innerHTML` avec des données utilisateur.
- Protection **CSRF** sur les actions qui modifient des données.
- Cookies de session `HttpOnly`, `Secure` (en prod) et `SameSite`.
- Secrets dans des **variables d'environnement** (`.env`, jamais commité). Un `.env.example` documente les variables.
- Cloisonnement : un utilisateur ne voit **que** les données de son entreprise.
- Limitation des tentatives de connexion.

### 5.2 Qualité du code
- Architecture en couches : **routes → contrôleurs → services (logique métier) → accès aux données**.
- Gestion centralisée des erreurs, avec des codes HTTP cohérents.
- **Montants stockés en centimes (entiers)**, jamais en nombres à virgule.
- Tests Jest obligatoires sur la logique métier : calculs, numérotation, transitions de statut.
- ESLint et Prettier sans erreur.

### 5.3 Front
- HTML sémantique : de vrais `<button>`, `<label>`, `<nav>`, `<main>`…
- **Accessibilité** : navigation complète au clavier, labels sur tous les champs, contrastes suffisants, messages d'erreur annoncés.
- **Responsive** : utilisable sur mobile, car un artisan fait souvent ses devis sur chantier.

### 5.4 Pratiques Git
- **Une branche par ticket**, nommée `type/ID-description` (ex. `feat/CLI-03-liste-clients`).
- Commits au format **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- Jamais de commit direct sur `main` : tout passe par une **Pull Request** relue.
- README à jour : installation, lancement, variables d'environnement, tests.

---

## 6. Definition of Done

Un ticket est **terminé** seulement quand :
- [ ] tous les critères d'acceptation sont remplis ;
- [ ] le code respecte l'architecture en couches ;
- [ ] les entrées sont validées et les erreurs gérées ;
- [ ] les tests passent, et il y a de nouveaux tests si de la logique métier a été ajoutée ;
- [ ] il n'y a aucune erreur ESLint ;
- [ ] le front est accessible au clavier et fonctionne sur mobile (si le ticket touche le front) ;
- [ ] la PR a été relue et validée ;
- [ ] le README est mis à jour si nécessaire.

---

## 7. Roadmap et missions

**Rythme :** environ 1 h par jour, en sprints de 2 semaines. Durée estimée du cœur du projet : environ 5 mois.
**Difficulté :** 🟢 facile · 🟡 moyen · 🔴 difficile
**Avant chaque fonctionnalité importante,** un ticket de **conception** (🧠) doit être validé par le Lead Dev avant de coder.

### Sprint 0 : Environnement et squelette (1 semaine)
- [ ] 🟢 **SETUP-01** Préparer le poste de travail et le dépôt Git (Node LTS, Git, PostgreSQL, `.gitignore`, `.env.example`, première PR)
- [ ] 🟢 **SETUP-02** Créer un serveur Express minimal qui répond sur une route de test, avec un script de développement à rechargement automatique
- [ ] 🟡 **SETUP-03** Connecter Node.js à PostgreSQL via les variables d'environnement
- [ ] 🟢 **SETUP-04** Configurer ESLint, Prettier et Jest, avec un premier test qui passe

### Sprint 1 : API clients (2 semaines)
- [ ] 🧠 **CLI-01** Concevoir la table `clients` (champs, types, contraintes)
- [ ] 🟡 **CLI-02** Écrire le script de création du schéma (première migration)
- [ ] 🟢 **CLI-03** Route : lister les clients
- [ ] 🟢 **CLI-04** Route : consulter un client (gérer le cas « introuvable »)
- [ ] 🟡 **CLI-05** Route : créer un client, avec validation des entrées
- [ ] 🟡 **CLI-06** Route : modifier un client
- [ ] 🟡 **CLI-07** Route : archiver un client
- [ ] 🟡 **CLI-08** Middleware de gestion centralisée des erreurs

### Sprint 2 : Front clients et premier déploiement (2 semaines)
- [ ] 🧠 **FRONT-01** Maquetter les écrans clients (liste, formulaire, fiche)
- [ ] 🟡 **FRONT-02** Mise en page commune : layout, navigation, feuille de style de base
- [ ] 🟡 **FRONT-03** Page liste des clients (récupération via `fetch`)
- [ ] 🟡 **FRONT-04** Formulaire de création accessible, avec affichage des erreurs
- [ ] 🟡 **FRONT-05** Édition et archivage depuis l'interface
- [ ] 🟡 **FRONT-06** Passe responsive et navigation clavier
- [ ] 🟡 **DEPLOY-01** Premier déploiement (app + base PostgreSQL hébergée)

### Sprint 3 : Authentification et rôles (2 semaines)
- [ ] 🧠 **AUTH-01** Concevoir les tables `entreprises` et `utilisateurs` ainsi que le modèle de rôles
- [ ] 🟡 **AUTH-02** Inscription (création de l'entreprise et du gérant, mot de passe hashé)
- [ ] 🔴 **AUTH-03** Connexion et déconnexion par session
- [ ] 🟡 **AUTH-04** Middleware de protection des routes
- [ ] 🔴 **AUTH-05** Protection CSRF
- [ ] 🟡 **AUTH-06** Permissions gérant / collaborateur, et invitation d'un collaborateur
- [ ] 🔴 **AUTH-07** Migration : rattacher les clients à une entreprise et cloisonner les données
- [ ] 🟡 **AUTH-08** Page des paramètres de l'entreprise (SIRET, adresse, TVA, coordonnées bancaires…)

### Sprint 4 : Catalogue et devis (2 semaines)
- [ ] 🧠 **CAT-01** Concevoir la table des prestations
- [ ] 🟡 **CAT-02** CRUD des prestations (API + front)
- [ ] 🧠 **DEV-01** Concevoir les tables `devis` et `lignes_devis`
- [ ] 🔴 **DEV-02** Service de calcul des totaux (centimes, TVA par taux, arrondis), **couvert par des tests Jest**
- [ ] 🟡 **DEV-03** API de création et de modification d'un devis
- [ ] 🔴 **DEV-04** Éditeur de devis côté front (ajout et suppression de lignes, totaux en temps réel)
- [ ] 🟢 **DEV-05** Liste des devis avec filtre par statut

### Sprint 5 : Facturation (2 semaines)
- [ ] 🧠 **FAC-01** Concevoir les tables des factures, des lignes et des paiements
- [ ] 🔴 **FAC-02** Numérotation séquentielle sans trou, avec transaction SQL et tests
- [ ] 🔴 **FAC-03** Machine à états des statuts (devis et factures) et tests des transitions
- [ ] 🟡 **FAC-04** Convertir un devis accepté en facture
- [ ] 🟡 **FAC-05** Enregistrer un paiement (total ou partiel)
- [ ] 🔴 **FAC-06** Émettre un avoir sur une facture
- [ ] 🟡 **FAC-07** Détecter les factures en retard

### Sprint 6 : PDF et emails (2 semaines)
- [ ] 🧠 **PDF-01** Recherche : synthèse des mentions obligatoires sur un devis et une facture, avec sources
- [ ] 🟡 **PDF-02** Générer le PDF d'un devis
- [ ] 🟡 **PDF-03** Générer le PDF d'une facture
- [ ] 🟡 **MAIL-01** Configurer l'envoi d'emails (service de test en développement)
- [ ] 🟡 **MAIL-02** Envoyer un devis ou une facture avec le PDF joint, et mettre à jour son statut

### Sprint 7 : Acceptation en ligne et relances (2 semaines)
- [ ] 🧠 **SIGN-01** Concevoir le lien public sécurisé (token, expiration, usage unique)
- [ ] 🔴 **SIGN-02** Page publique de consultation et d'acceptation ou de refus d'un devis
- [ ] 🟡 **SIGN-03** Traçabilité de l'acceptation (date, IP) et notification au gérant
- [ ] 🟡 **RELANCE-01** Tâche planifiée de détection des impayés
- [ ] 🟡 **RELANCE-02** Emails de relance selon un calendrier paramétrable
- [ ] 🟢 **RELANCE-03** Historique des relances sur la fiche facture

### Sprint 8 : Tableau de bord et qualité (2 semaines)
- [ ] 🟡 **DASH-01** Requête : chiffre d'affaires mensuel
- [ ] 🟡 **DASH-02** Requête : montants en attente et en retard
- [ ] 🟡 **DASH-03** Requête : top clients
- [ ] 🟡 **DASH-04** Page du tableau de bord avec graphique
- [ ] 🟡 **QUAL-01** Audit d'accessibilité (Lighthouse, clavier, lecteur d'écran) et corrections
- [ ] 🟡 **QUAL-02** Performance : index SQL sur les colonnes les plus requêtées

### Sprint 9 : Mise en production (1 semaine)
- [ ] 🟡 **PROD-01** Intégration continue : lint et tests automatiques sur chaque PR (GitHub Actions)
- [ ] 🔴 **PROD-02** Durcissement sécurité (en-têtes HTTP, limitation des tentatives, cookies sécurisés)
- [ ] 🟡 **PROD-03** Stratégie de sauvegarde de la base
- [ ] 🟢 **PROD-04** README final et documentation de l'API

### Bonus
- [ ] 🔴 **BONUS-01** Paiement Stripe en mode test, avec webhook de confirmation
- [ ] 🟡 **BONUS-02** Export CSV comptable
- [ ] 🔴 **BONUS-03** Génération Factur-X

---

## 8. Rituels

| Rituel | Quand | Contenu |
|---|---|---|
| **Standup** | Chaque session de travail | Ce que j'ai fait, ce que je vais faire, ce qui me bloque |
| **Conception** | Avant chaque ticket 🧠 | Schéma, routes, maquette, validés par le Lead Dev |
| **Code review** | À chaque PR | Remarques classées : bloquant / important / suggestion |
| **Rétrospective** | Fin de chaque sprint | Acquis, points faibles, notions à revoir |
