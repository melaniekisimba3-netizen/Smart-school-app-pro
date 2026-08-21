# 🚀 SMARTSCHOOL RDC — GUIDE OFFICIEL DE DÉPLOIEMENT ET D'EXPLOITATION EN PRODUCTION

Bienvenue dans la documentation officielle d'infrastructure et de déploiement en production pour **SmartSchool RDC** (Système National Intégré de Gestion Scolaire de la République Démocratique du Congo).

Ce guide s'adresse aux Ingénieurs DevOps, Administrateurs Système et Architectes Logiciels chargés d'héberger et de maintenir la plateforme pour un ou plusieurs établissements scolaires ou au niveau national (Ministère de l'ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETÉ - EPST).

---

## 📋 TABLE DES MATIÈRES

1. [Architecture Globale & Topologie](#1-architecture-globale--topologie)
2. [Prérequis Système](#2-prérequis-système)
3. [Méthode 1 : Déploiement sur VPS / Serveur Dédé Linux (Docker + Nginx + SSL)](#3-méthode-1--déploiement-sur-vps--serveur-dédié-linux)
4. [Méthode 2 : Déploiement sur Vercel](#4-méthode-2--déploiement-sur-vercel)
5. [Méthode 3 : Déploiement sur Firebase Hosting & Firestore](#5-méthode-3--déploiement-sur-firebase-hosting--firestore)
6. [Configuration de la Base de Données de Production (PostgreSQL)](#6-configuration-de-la-base-de-données-de-production)
7. [Passerelles de Paiement Mobile Money RDC](#7-passerelles-de-paiement-mobile-money-rdc)
8. [Sécurité & Certificats SSL/TLS](#8-sécurité--certificats-ssltls)
9. [Sauvegardes Automatiques & Restauration (DRP)](#9-sauvegardes-automatiques--restauration-drp)
10. [Surveillance, Logs & Diagnostics](#10-surveillance-logs--diagnostics)

---

## 1. ARCHITECTURE GLOBALE & TOPOLOGIE

SmartSchool RDC est conçu selon une architecture full-stack moderne et résiliente :

```
                        [ NGINX REVERSE PROXY / SSL ]
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
   [ FRONTEND SPA (React 19) ]                     [ API BACKEND (Node/Express) ]
            │                                               │
            ├───────────────┬───────────────┐               ├──────────────────┐
            ▼               ▼               ▼               ▼                  ▼
      [ PostgreSQL 16 ]  [ Redis ]   [ Firebase ]  [ Mobile Money APIs ]  [ Gemini AI ]
```

---

## 2. PRÉREQUIS SYSTÈME

### Pour un déploiement VPS Linux :
- **Système d'exploitation :** Ubuntu 22.04 LTS / Ubuntu 24.04 LTS ou Debian 12
- **Processeur :** Minimum 2 vCPU (4 vCPU recommandé pour > 5000 élèves)
- **Mémoire RAM :** Minimum 4 GB (8 GB recommandé)
- **Espace Disque :** Minimum 40 GB SSD NVMe
- **Domaine désigné :** Ex: `smartschool.cd` ou `ecole.smartschool.cd`
- **Logiciels requis :** `docker`, `docker-compose-plugin`, `git`, `curl`

---

## 3. MÉTHODE 1 : DÉPLOIEMENT SUR VPS / SERVEUR DÉDIÉ LINUX

### Étape 3.1 : Cloner le Dépôt GitHub

```bash
git clone https://github.com/votre-organisation/smartschool-rdc.git
cd smartschool-rdc
```

### Étape 3.2 : Configurer les Variables d'Environnement

```bash
cp .env.example .env
nano .env
```

Assurez-vous de définir un mot de passe fort pour PostgreSQL et votre clé `JWT_SECRET`.

### Étape 3.3 : Obtenir un Certificat SSL Gratuite (Let's Encrypt / Certbot)

```bash
# S'assurer que le port 80 est ouvert
sudo apt update && sudo apt install -y certbot

# Générer le certificat SSL pour votre domaine
sudo certbot certonly --standalone -d smartschool.cd -d www.smartschool.cd
```

### Étape 3.4 : Lancer l'Application via Docker Compose

```bash
# Compilation et démarrage des conteneurs en arrière-plan
docker compose up -d --build

# Vérifier l'état des conteneurs
docker compose ps
```

### Étape 3.5 : Vérifier le Serveur Production

Accédez à : `https://smartschool.cd/api/health`

Le résultat JSON doit afficher `"status": "UP"`.

---

## 4. MÉTHODE 2 : DÉPLOIEMENT SUR VERCEL

SmartSchool RDC inclut un fichier `vercel.json` prêt à l'emploi.

1. Connectez votre compte GitHub à Vercel.
2. Importez le projet **smartschool-rdc**.
3. Dans la section **Environment Variables**, ajoutez :
   - `GEMINI_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
4. Cliquez sur **Deploy**.
5. Vercel effectuera automatiquement la commande `npm run build` et hébergera le bundle sur son CDN mondial.

---

## 5. MÉTHODE 3 : DÉPLOIEMENT SUR FIREBASE HOSTING & FIRESTORE

1. Installez Firebase CLI :
```bash
npm install -g firebase-tools
```

2. Connectez-vous à Firebase :
```bash
firebase login
```

3. Déployez le Frontend et les Règles de Sécurité :
```bash
npm run build
firebase deploy --only hosting,firestore
```

---

## 6. CONFIGURATION DE LA BASE DE DONNÉES DE PRODUCTION

La base de données PostgreSQL de production s'initialise automatiquement via `docker-compose.yml`.

### Migration / Ingestion Initiale :

```bash
docker exec -i smartschool_postgres_prod psql -U smartschool_admin -d smartschool_rdc_prod < scripts/init_db.sql
```

---

## 7. PASSERELLES DE PAIEMENT MOBILE MONEY RDC

SmartSchool RDC est pré-intégré pour gérer les frais scolaires et la caisse avec :

1. **M-Pesa (Vodacom RDC) :** Configurer `MPESA_API_KEY` & `MPESA_MERCHANT_ID` dans `.env`
2. **Airtel Money RDC :** Configurer `AIRTEL_MONEY_CLIENT_SECRET` dans `.env`
3. **Orange Money RDC :** Configurer `ORANGE_MONEY_AUTH_TOKEN` dans `.env`
4. **RawBank (RawBankOnline / Ilico Cash) :** Configurer `RAW_BANK_API_KEY` dans `.env`

---

## 8. SÉCURITÉ & CERTIFICATS SSL/TLS

Le serveur d'application est protégé par plusieurs couches :
- **En-têtes HSTS & CSP :** Activés dans `server.ts` et `nginx.conf`
- **Anti-XSS & Anti-Sniffing :** Activés
- **Règles Firestore :** Verrouillage strict selon les rôles (Comptable, Directeur, Promoteur)
- **Mots de Passe Temporaires :** Invalidation obligatoire dès la première connexion via l'assistant de sécurité.

---

## 9. SAUVEGARDES AUTOMATIQUES & RESTAURATION (DRP)

Un script Cron de sauvegarde quotidienne est recommandé sur le serveur Linux.

### Créer un script `/var/backups/backup_smartschool.sh` :

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/smartschool_rdc"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Dump de la base de données PostgreSQL
docker exec smartschool_postgres_prod pg_dump -U smartschool_admin smartschool_rdc_prod | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Purger les sauvegardes de plus de 30 jours
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Rendre le script exécutable & programmer Cron :

```bash
chmod +x /var/backups/backup_smartschool.sh

# Ajouter à crontab (Chaque jour à 02h00 du matin)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/backups/backup_smartschool.sh") | crontab -
```

---

## 10. SURVEILLANCE, LOGS & DIAGNOSTICS

### Consulter les logs en temps réel :

```bash
# Logs globaux
docker compose logs -f --tail=100

# Logs du serveur Node.js
docker logs -f smartschool_app_prod

# Logs du serveur Nginx
docker logs -f smartschool_nginx_prod
```

---

### 🇨🇩 SmartSchool RDC - Prêt pour la Production Nationale
