# Facturation TPE

Application web de devis et de facturation pour artisans, freelances et TPE.

📋 Le cahier des charges complet est dans [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md).

## Stack

- **Front** : HTML, CSS, JavaScript vanilla (dossier `public/`)
- **Back** : Node.js 22+ et Express 5 (dossier `src/`)
- **Base de données** : PostgreSQL 16+
- **Qualité** : ESLint, Prettier, Jest et Supertest

## Installation

### 1. Prérequis

| Outil      | Version  | Vérification     |
| ---------- | -------- | ---------------- |
| Node.js    | 22 (LTS) | `node -v`        |
| npm        | 10+      | `npm -v`         |
| PostgreSQL | 16+      | `psql --version` |
| Git        | récent   | `git --version`  |

### 2. Récupérer le projet et installer les dépendances

```bash
git clone https://github.com/Okpsaihtam/facturation-tpe.git
cd facturation-tpe
npm install
```

### 3. Créer les bases de données

Dans `psql`, avec un compte administrateur PostgreSQL :

```sql
CREATE USER facturation WITH PASSWORD 'choisir-un-mot-de-passe';
CREATE DATABASE facturation_dev OWNER facturation;
CREATE DATABASE facturation_test OWNER facturation;
```

La base `facturation_test` est réservée aux tests automatisés : son contenu peut être effacé à tout moment.

### 4. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Ensuite, remplissez `.env` avec vos propres valeurs. **Ce fichier contient des secrets et ne doit jamais être commité** (il est listé dans `.gitignore`).

| Variable            | Rôle                                                  |
| ------------------- | ----------------------------------------------------- |
| `NODE_ENV`          | `development`, `test` ou `production`                 |
| `PORT`              | Port du serveur (3000 par défaut)                     |
| `DATABASE_URL`      | Connexion à la base de développement ou de production |
| `DATABASE_SSL`      | `true` si l'hébergeur de la base impose SSL           |
| `DATABASE_URL_TEST` | Connexion à la base de test                           |

## Lancer l'application

```bash
npm run dev    # développement, redémarre à chaque modification
npm start      # production
```

Ouvrez ensuite <http://localhost:3000>. Pour vérifier l'état du serveur : <http://localhost:3000/api/health>.

## Scripts

| Commande               | Rôle                                            |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Serveur avec rechargement automatique           |
| `npm start`            | Serveur en mode normal                          |
| `npm test`             | Tests Jest (utilise la base de test)            |
| `npm run lint`         | Analyse ESLint                                  |
| `npm run format`       | Formate le code avec Prettier                   |
| `npm run format:check` | Vérifie le formatage sans modifier les fichiers |

## Architecture

```
public/            Front (HTML, CSS, JS vanilla)
src/
  app.js           Construction de l'application Express (sans écouter de port)
  server.js        Démarrage du serveur
  config/          Lecture et validation des variables d'environnement
  db/              Connexion PostgreSQL
  routes/          Déclaration des routes HTTP
tests/             Tests Jest
docs/              Documentation du projet
```

Au fil des sprints viendront s'ajouter `controllers/`, `services/` (logique métier) et `repositories/` (accès aux données).

## Conventions Git

- Une branche par ticket : `type/ID-description` (ex. `feat/CLI-03-liste-clients`).
- Commits au format [Conventional Commits](https://www.conventionalcommits.org/fr/).
- Pas de commit direct sur `main` : tout passe par une Pull Request.
