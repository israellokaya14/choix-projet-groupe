# Choix du projet — application web

Application mobile-first pour présenter les propositions d'un groupe et permettre un vote en ligne.

## Important
Cette version utilise Firebase pour partager les projets et les votes entre tous les téléphones. Le dossier contient le code, mais il faut encore créer/configurer Firebase et publier le site pour obtenir un lien public.

## 1. Créer Firebase
1. Ouvrir https://console.firebase.google.com/ et créer un projet.
2. Ajouter une application Web et copier sa configuration.
3. Dans `app.js`, remplacer les valeurs `VOTRE_...` par les vraies valeurs Firebase.
4. Dans Firebase Authentication > Sign-in method, activer **Google**.
5. Dans Firestore Database, créer une base de données.
6. Dans l'onglet Rules, coller le contenu de `firestore.rules` et publier.

## 2. Ajouter les propositions
Dans Firebase Console > Firestore Database > Start collection, créer une collection `projects`.
Pour chaque proposition, créer un document avec ces champs :
- `title` (string) : titre du projet
- `author` (string) : nom de l'étudiant
- `description` (string) : présentation de la solution
- `problem` (string) : problème ciblé
- `createdAt` (timestamp) : date de création

Laisser Firebase générer l'identifiant du document. Les projets apparaîtront automatiquement sur le site.

## 3. Tester et publier
Pour tester, ouvrir `index.html` avec un serveur local (par exemple l'extension Live Server de VS Code).
Pour obtenir un lien public, publier le dossier sur Firebase Hosting :
1. Installer Node.js puis Firebase CLI : `npm install -g firebase-tools`
2. Dans le dossier du projet : `firebase login`
3. Initialiser l'hébergement : `firebase init hosting`
4. Choisir le dossier courant comme dossier public et répondre **No** à la configuration d'une application monopage.
5. Publier : `firebase deploy`

Firebase donnera une adresse publique à partager dans WhatsApp.

## Limite du vote
Le vote est limité à un vote par compte Google connecté. Cela évite les votes répétés avec le même compte, mais une personne pourrait techniquement utiliser plusieurs comptes. Pour un scrutin strictement nominatif, il faudra une liste d'étudiants autorisés et une validation des identités.

## Confidentialité
Les projets et les résultats sont publics sur le site. N'ajoutez pas de données personnelles inutiles. Les règles proposées empêchent les visiteurs de modifier les projets et empêchent un compte de modifier son vote après enregistrement.
