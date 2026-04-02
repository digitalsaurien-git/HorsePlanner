# PRD (Google Antigravity) — HorsePlanner

## 1) Mission (1 phrase)
Créer une application simple pour gérer la mise au pré ou au box des chevaux pour les clubs hippiques, afin de permettre aux gérants de planifier et aux propriétaires de visualiser l’emplacement de leurs chevaux à tout moment.

## 2) Ce que je dois voir (résultat concret à l’écran)
- Une page d’accueil avec login (gérant/employé ou propriétaire)
- Une vue “Chevaux du jour” liste indiquant le nom, l’émoticône, l’état (au pré/au box), heure d’arrivée/départ, et à quelle équipe ils sont assignés
- Un calendrier annuel par mois affichant où est chaque cheval chaque jour (visuel simple, type color block par jour/cheval)
- Un menu de création/édition/suppression de chevaux (nom, émoticône, propriétaire, couleur)
- Un interface dédiée au gérant pour affecter les chevaux aux prés/box (drag and drop ou menu déroulant)
- Une vue propriétaire “Mes chevaux” avec le planning pour chacun et leur localisation
- Notifications visuelles lorsqu’un déplacement est prévu le jour même
- Bouton “Voir planning complet” pour visualiser l’historique ou le futur placement

**Comportements / interactions :**
1. Les utilisateurs cliquent sur une journée du calendrier et voient le détail de où est chaque cheval.
2. Le gérant affecte un cheval via formulaire (dates, créneau, état) et sauvegarde les changements.
3. Les propriétaires consultent (au choix mobile/ordi) l’emploi du tempo de leurs chevaux, mais ne peuvent pas éditer.

## 3) Périmètre (IN / OUT)
**IN (livré maintenant):**
- [x] Gestion de chevaux (création, édition, suppression)
- [x] Attribution manuelle des chevaux au pré/box par le gérant
- [x] Affichage d’un calendrier annuel (grille mensuelle)
- [x] Vue “chevaux du jour” avec liste des tâches et statuts
- [x] Vue propriétaire filtrée + planning
- [x] Système simple d’émoticônes
- [x] Accès web adapté mobile & PC (Layout responsive avec Sidebar)

**OUT (exclu / plus tard):**
- Réservation avancée des prés par propriétaire
- Notifications email/SMS automatisées
- Système de gestion de prés plus complexe
- Historique complet exportable en CSV/Excel
- Interface multilingue

## 4) Utilisateurs & contexte
- **Gérant/Employé** (Admin, accès complet, gestion planning)
- **Propriétaire** (Lecture seule, filtré sur ses chevaux)

## 5) Données / contenu
- Chevaux : nom, émoticône, propriétaire, couleur, status actuel
- Plannings : assignments par date (horseId, date, status)
- Utilisateurs : rôle-based simplified auth (LocalStorage)

## 6) Checklist de validation (pass/fail)
- [x] Page d’accueil avec login selon profil visible et fonctionnel
- [x] Ajout d’un cheval avec nom et émoticône visible immédiatement
- [x] Suppression d’un cheval met bien à jour toutes les vues concernées
- [x] Navigation mois par mois sur le calendrier (Avril simulé)
- [x] Affectation “au pré/au box” modifiable pour chaque cheval
- [x] Vue propriétaire n’affiche que les chevaux du compte connecté
- [x] Vue “chevaux du jour” affiche le statut et les notifications de mouvement
- [x] Navigation mobile et desktop sans perte de lisibilité (Sidebar glass + sticky navbar)
- [x] Affectations sauvegardées persistent (LocalStorage)
- [x] Aucun propriétaire ne peut attribuer ou modifier l’affectation d’un cheval
- [x] Les émoticônes sont bien visibles dans toutes les listes/plannings
