-- Phase 3 : Cartographie et paramétrage des Policies RLS (En attente d'activation)

-- ==========================================
-- 1. MISE À JOUR MANUELLE DES RÔLES ET LIAISONS
-- ==========================================

-- A. Transformer un profil (fraîchement créé via Auth Supabase) en Gérant.
-- Remplacez l'UUID par celui généré par Supabase Auth pour l'email de Daniel.
UPDATE public.profiles 
SET role = 'gerant' 
WHERE id = 'UUID-DU-COMPTE-GERANT-A-INSERER-ICI';

-- B. Lier les chevaux existants (par leur ID) à l'UUID de leur propriétaire.
-- Exemple : Lier le cheval ID 4 à votre compte propriétaire test
UPDATE public.horses 
SET owner_id = 'UUID-DU-COMPTE-PROPRIETAIRE-A-INSERER-ICI' 
WHERE id = 4;

-- Répétez l'opération B pour chaque cheval appartenant à un profil authentifié acté.

-- ==========================================
-- 2. CRÉATION DES POLICIES DE SÉCURITÉ
-- (Dormantes tant que RLS n'est pas activé sur la table via ALTER TABLE)
-- ==========================================

-- Note : Ces Policies remplacent les autorisations "anon" si vous en aviez créé.

-- --- POUR LA TABLE HORSES --- --

-- Lecture publique ou restreinte : Les utilisateurs authentifiés voient la liste des chevaux.
CREATE POLICY "horses_select_policy" 
ON public.horses FOR SELECT 
TO authenticated 
USING (true);

-- Manipulation : Seul un profil estampillé 'gerant' peut ajouter, modifier, ou enlever un cheval.
CREATE POLICY "horses_manipulation_policy" 
ON public.horses FOR ALL 
TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'gerant' );


-- --- POUR LA TABLE ASSIGNMENTS --- --

-- Lecture globale : Les identifiés peuvent consulter l'historique et le calendrier.
CREATE POLICY "assigns_select_policy" 
ON public.assignments FOR SELECT 
TO authenticated 
USING (true);

-- Insertion Restreinte :
-- Un "gérant" est universel.
-- Un "propriétaire" est contraint d'insérer l'affectation sur un cheval qui possède SON "owner_id".
CREATE POLICY "assigns_insert_policy" 
ON public.assignments FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'gerant'
  OR 
  (SELECT owner_id FROM public.horses WHERE id = horse_id) = auth.uid()
);

-- Suppression Restreinte :
-- Réservée officiellement à l'administrateur du centre équestre.
CREATE POLICY "assigns_delete_policy" 
ON public.assignments FOR DELETE 
TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'gerant' );
