# DIICSA Home — prototype premium

Code complet de la landing page et des démonstrations interactives : dashboard, application client et interface technicien.

## Ouvrir
Décompressez le ZIP puis ouvrez index.html dans votre navigateur.
Pour utiliser un serveur local : python3 -m http.server 8000
Puis ouvrez http://localhost:8000.

## Fichiers
- index.html : structure et contenu
- styles.css : design responsive
- app.js : interactions de démonstration
- assets/home.webp : visuel principal

Aucune compilation ni installation de dépendances nécessaire. Les polices Google nécessitent Internet ; des polices de remplacement sont prévues.

## Portée
Prototype HTML/CSS/JavaScript avec données simulées. Les interfaces mobiles sont des maquettes Web interactives, pas des applications natives compilées. Les modules présentés s'inspirent de PulseCRM ; le backend du CRM, les connexions API, les paiements et les envois de campagnes ne sont pas intégrés à cette version.

## Olivia IA
Chat responsive connecté à l’API du dépôt `o7digital/suitesmine-bot`, profil isolé `diicsatucasa` lié à `diicsa-tucasa.vercel.app`. Contrats adaptés depuis `lib/api.js` et `components/O7Widget.jsx`. Aucun secret dans le navigateur. L’identité signée est obtenue depuis `/api/widget/identity`; les domaines de preview ne sont pas enregistrés.

Le consentement est demandé avant connexion. Les messages utilisent `/api/olivia/chat` et sont enregistrés via `/api/widget/conversations` lorsque ce service est disponible. Le chat prend en charge les réponses opérateur et respecte le mode manuel. Aucun formulaire de démonstration, devis, paiement ni rendez-vous n’est créé par Olivia. La disponibilité du chat dépend du backend Olivia et de ses fournisseurs.
