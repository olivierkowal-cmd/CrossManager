# CrossManager 2.0

## Présentation

CrossManager est un logiciel de gestion d'un cross scolaire.

Il permet de gérer :

- les participants
- les dossards
- les départs
- les scanners QR
- les résultats
- l'écran TV
- la synchronisation de plusieurs téléphones

Le projet est développé avec :

- Vue 3
- Vite
- Pinia
- Tailwind CSS
- html5-qrcode
- Firebase (Sprint 5)

---

# Architecture

src/

assets/

components/

common/

departures/

scanner/

results/

dashboard/

tv/

dossards/

stores/

appStore.js

raceStore.js

raceManagerStore.js

scannerStore.js

services/

firebase/

scanner/

sound/

export/

views/

data/

router/

utils/

---

# Les Stores

## appStore

Responsable de l'application.

Contient :

- mode
- scannerId
- deviceName
- connexion

---

## raceStore

Contient uniquement les participants.

Aucun calcul.

---

## raceManagerStore

Cœur du logiciel.

Responsable :

- des départs
- des arrivées
- du classement
- du temps
- des catégories
- de la fin automatique des courses

Aucun autre store ne modifie directement les courses.

---

## scannerStore

Responsable des scanners.

Il :

- reçoit un QR
- retrouve le participant
- demande au raceManager d'enregistrer l'arrivée

Il ne calcule jamais les résultats.

---

# Principe

Scanner

↓

scannerStore

↓

raceManagerStore

↓

TV

↓

Résultats

↓

Dashboard

---

# Les composants

## Départs

RaceCard

RaceStatusBadge

RaceTimer

CountdownModal

---

## Scanner

ScannerCamera

ScannerStatus

LastArrivalCard

---

## Dashboard

CourseOverview

StatisticsCard

ScannerOverview

---

## TV

TvRanking

TvClock

TvCurrentRace

---

# Sprint 4

Objectif :

Créer un scanner QR professionnel.

Fonctions :

- lecture continue
- caméra arrière
- anti doublon
- bip
- vibration
- affichage du dernier participant
- temps
- position

---

# Sprint 5

Synchronisation Firebase.

Tous les appareils partageront les mêmes données.

Téléphone maître

↓

Firebase

↓

Scanner 1

Scanner 2

Scanner 3

Scanner 4

Scanner 5

↓

TV

---

# Sprint 6

Résultats

Classements

Exports

Statistiques

---

# Sprint 7

Version 3

Photo d'arrivée

Historique

Administration

Mode hors ligne avancé

---

# Règles de développement

Toujours utiliser les Stores.

Jamais de logique métier dans les composants.

Un composant = une responsabilité.

Toujours commenter les parties importantes.

Toujours faire un commit Git après chaque sprint.

Toujours développer sur une branche.

Main reste toujours stable.

---

# Objectif

Créer le meilleur logiciel possible pour gérer le Cross de l'ISM Rèves.

Le logiciel doit être :

- simple
- rapide
- robuste
- agréable à utiliser
- capable de gérer plus de 750 participants
- capable de fonctionner avec plusieurs téléphones simultanément