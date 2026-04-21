-- Phase 0 & 1 : Préparation de l'architecture d'authentification robuste
-- Ce script modifie le schéma de base de données sans activer le RLS bloquant.

-- 1. Création de la table des profils utilisateurs liée à Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    role TEXT CHECK (role IN ('gerant', 'proprietaire')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ajout de la clé étrangère du propriétaire sur la table des chevaux
-- Permet de spécifier le propriétaire exact (si authentifié) sans casser le texte actuel ('Propriétaire')
ALTER TABLE public.horses 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) DEFAULT NULL;

-- 3. Ajout de l'historique de traçabilité sur les affectations
-- Permettra de lier l'affectation à l'auteur dès que l'authentification sera câblée
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) DEFAULT NULL;

-- 4. Fonction réflexe de création (Trigger d'insertion automatique)
-- Lorsqu'un propriétaire ou gérant crée son compte (Supabase Auth), son profil public est généré
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
      new.id, 
      new.email, 
      -- Par défaut, un nouvel inscrit depuis le web est propriétaire. (A ajuster au besoin)
      'proprietaire'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activation du déclencheur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Attention :
-- Le Row Level Security n'est PAS enclenché afin de garantir la disponibilité opérationnelle de l'application actuelle.
