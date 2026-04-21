# Spécifications Techniques HorsePlanner - v1.7.1

Ce document détaille la structure et les fonctionnalités développées pour servir de base de référence à un audit ou une intégration via IA.

## 1. Structure de la Base de Données (Supabase)

### Table : `assignments`
| Colonne | Type | Description |
|:---|:---|:---|
| `id` | int8 (PK) | Identifiant unique |
| `horse_id` | int8 (FK) | Référence vers `horses.id` |
| `start_date` | date | Date de début de l'affectation |
| `end_date` | date | Date de fin (optionnelle, sinon = start_date) |
| `status` | text | 'pré' ou 'box' |
| `period` | text | 'journée', 'matin' ou 'après-midi' |
| `note` | text | **[Nouveau]** Commentaire libre sur l'affectation |

### Table : `horses`
| Colonne | Type | Description |
|:---|:---|:---|
| `id` | int8 (PK) | Identifiant unique |
| `name` | text | Nom du cheval |
| `emoji` | text | Icône représentative |
| `owner` | text | Nom du propriétaire ou "Club" |
| `color` | text | Code couleur pour l'affichage |

---

## 2. Logique métier & Permissions

### Gestion des Rôles
- **Gérant (Bucéphale)** : Accès total. Masque de saisie avec choix de la période.
- **Propriétaire** :
  - Peut ajouter des affectations uniquement pour **ses propres chevaux** (via filtrage `PROPRIETARY_HORSE_IDS`).
  - Le champ "Période" est masqué (valeur par défaut : 'journée').
  - Accès au champ "Note".

### Stratégie de Fusion des Données (Hydratation)
L'application utilise une stratégie cumulative :
1. **Source de vérité A** : `INITIAL_PLANNINGS` (Données statiques de démo pour avril 2026).
2. **Source de vérité B** : Supabase `assignments`.
3. **Logique de merge** : `setAssignments([...INITIAL_PLANNINGS, ...mappedFromSupabase.filter(m => !initIds.has(m.id))])`.
   - *Correction appliquée* : Si Supabase est vide, on force le "seeding" des chevaux de démo.

---

## 3. Composants UI Spécifiques

### Dashboard (Gérant)
- **Section "Actuellement au pré"** : Filtre en temps réel les chevaux dont la date courante est comprise entre `start_date` et `end_date`.
- **Indicateur de statut** : Badge `success` pour le pré, `info` pour le box.

### Calendrier
- Affichage mensuel avec pastilles de couleur par cheval.
- **Toggle "Décompte des jours"** : Permet d'afficher la somme mensuelle des jours par statut (stocké en `localStorage`).

### Paramètres & Info
- **Release Notes** : Historique versionné intégré dans l'onglet Informations.
- **Zone de Secours** : Bouton de purge du `localStorage` et de reconnexion forcée.

---

## 4. Hooks & Synchronisation
- **Real-time** : Abonnement via `supabase.channel` sur les tables `horses` et `assignments`.
- **Persistence locale** : `hp_user`, `hp_client_id` et préférences UI stockés en `localStorage`.
- **Versionning** : Trigger `hp_version` pour forcer le rechargement du cache client lors d'une mise à jour majeure.
