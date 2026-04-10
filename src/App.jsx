import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { supabase } from './utils/supabaseClient';

// --- Mock Data & Constants ---
const ROLES = {
  GERANT: 'gérant',
  PROPRIETAIRE: 'propriétaire',
  EMPLOYE: 'employé'
};

const APP_MODES = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  HORSES: 'horses',
  CALENDAR: 'calendar',
  ASSIGNMENTS: 'assignments',
  SETTINGS: 'settings',
  MY_HORSES: 'my_horses'
};

const HORSE_ICONS = ['🐎', '🐴', '🦄', '🐆', '🦓', '🦒', '🐿️', '🐰', '🍀', '🌸', '🌷', '🎍', '🍎', '🥕', '⚡', '💋', '🤠', '🏀', '👳'];

const INITIAL_HORSES = [
  { id: 1, name: 'Florette', emoji: '🌸', owner: 'Club', color: '#ff80ab', status: 'box' },
  { id: 2, name: 'Cliff', emoji: '🐴', owner: 'Propriétaire', color: '#b08d57', status: 'box' },
  { id: 3, name: 'Cloony', emoji: '🍀', owner: 'Propriétaire', color: '#4caf50', status: 'box' },
  { id: 4, name: 'Conquérant', emoji: '🦓', owner: 'Club', color: '#333333', status: 'box' },
  { id: 5, name: 'Lipton', emoji: '🐰', owner: 'Club', color: '#90caf9', status: 'box' },
  { id: 6, name: 'Kiss', emoji: '💋', owner: 'Club', color: '#f44336', status: 'box' },
  { id: 7, name: 'Jimmy', emoji: '🐎', owner: 'Club', color: '#a1887f', status: 'box' },
  { id: 8, name: 'Foudre', emoji: '⚡', owner: 'Club', color: '#ffd54f', status: 'box' },
  { id: 9, name: 'Juariste', emoji: '🎍', owner: 'Club', color: '#81c784', status: 'box' },
  { id: 10, name: 'Gringo', emoji: '🤠', owner: 'Club', color: '#795548', status: 'box' },
  { id: 11, name: 'Joliette', emoji: '🦄', owner: 'Club', color: '#ce93d8', status: 'box' },
  { id: 12, name: 'Goria', emoji: '🦄', owner: 'Club', color: '#ba68c8', status: 'box' },
  { id: 13, name: 'Little', emoji: '🐎', owner: 'Club', color: '#e0e0e0', status: 'box' },
  { id: 14, name: 'Eiddy', emoji: '🌷', owner: 'Club', color: '#f06292', status: 'box' },
  { id: 15, name: 'Fakir', emoji: '🐹', owner: 'Propriétaire', color: '#ff8a65', status: 'box' },
  { id: 16, name: 'Towingo', emoji: '🐅', owner: 'Club', color: '#9575cd', status: 'box' },
  { id: 17, name: 'Gemini', emoji: '👯', owner: 'Club', color: '#4fc3f7', status: 'box' },
  { id: 18, name: 'Bally', emoji: '🏐', owner: 'Club', color: '#aed581', status: 'box' },
  { id: 19, name: 'Elégante', emoji: '🦒', owner: 'Club', color: '#ffd54f', status: 'box' },
  { id: 20, name: 'Haker', emoji: '🕶️', owner: 'Club', color: '#90a4ae', status: 'box' },
];


const PROPRIETARY_HORSE_IDS = [2, 3, 15]; // Cliff, Cloony, Fakir - horse IDs belonging to the owner

const INITIAL_PLANNINGS = [
  // Fevrier 2026
  { id: 1001, horseId: 3, startDate: '2026-02-02', endDate: '2026-02-06', status: 'pré', period: 'journée' },
  { id: 1002, horseId: 12, startDate: '2026-02-02', endDate: '2026-02-06', status: 'pré', period: 'journée' },
  { id: 1003, horseId: 5, startDate: '2026-02-09', endDate: '2026-02-13', status: 'pré', period: 'journée' },
  { id: 1004, horseId: 13, startDate: '2026-02-09', endDate: '2026-02-13', status: 'pré', period: 'journée' },

  // Mars 2026
  { id: 2001, horseId: 6, startDate: '2026-03-02', endDate: '2026-03-06', status: 'pré', period: 'journée' },
  { id: 2002, horseId: 2, startDate: '2026-03-02', endDate: '2026-03-06', status: 'pré', period: 'journée' },
  { id: 2003, horseId: 17, startDate: '2026-03-09', endDate: '2026-03-13', status: 'pré', period: 'journée' },
  { id: 2004, horseId: 3, startDate: '2026-03-09', endDate: '2026-03-13', status: 'pré', period: 'journée' },
  { id: 2005, horseId: 4, startDate: '2026-03-09', endDate: '2026-03-13', status: 'pré', period: 'journée' },
  { id: 2006, horseId: 10, startDate: '2026-03-16', endDate: '2026-03-20', status: 'pré', period: 'journée' },
  { id: 2007, horseId: 8, startDate: '2026-03-16', endDate: '2026-03-20', status: 'pré', period: 'journée' },
  { id: 2008, horseId: 11, startDate: '2026-03-23', endDate: '2026-03-27', status: 'pré', period: 'journée' },

  // === AVRIL 2026 - Plages consolidées par cheval ===

  // Cliff (2): 2, 4, 6, 8-10, 15, 20-21, 23, 27-28, 30
  { id: 3011, horseId: 2, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré', period: 'journée' },
  { id: 3012, horseId: 2, startDate: '2026-04-04', endDate: '2026-04-04', status: 'pré', period: 'journée' },
  { id: 3013, horseId: 2, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré', period: 'journée' },
  { id: 3014, horseId: 2, startDate: '2026-04-08', endDate: '2026-04-10', status: 'pré', period: 'journée' },
  { id: 3015, horseId: 2, startDate: '2026-04-15', endDate: '2026-04-15', status: 'pré', period: 'journée' },
  { id: 3016, horseId: 2, startDate: '2026-04-20', endDate: '2026-04-21', status: 'pré', period: 'journée' },
  { id: 3017, horseId: 2, startDate: '2026-04-23', endDate: '2026-04-23', status: 'pré', period: 'journée' },
  { id: 3018, horseId: 2, startDate: '2026-04-27', endDate: '2026-04-28', status: 'pré', period: 'journée' },
  { id: 3019, horseId: 2, startDate: '2026-04-30', endDate: '2026-04-30', status: 'pré', period: 'journée' },

  // Cloony (3): 1-3, 6-10, 13-17
  { id: 3021, horseId: 3, startDate: '2026-04-01', endDate: '2026-04-03', status: 'pré', period: 'journée' },
  { id: 3022, horseId: 3, startDate: '2026-04-06', endDate: '2026-04-10', status: 'pré', period: 'journée' },
  { id: 3023, horseId: 3, startDate: '2026-04-13', endDate: '2026-04-17', status: 'pré', period: 'journée' },

  // Conquérant (4): 2-6, 8-17, 19-23, 25-30
  { id: 3031, horseId: 4, startDate: '2026-04-02', endDate: '2026-04-06', status: 'pré', period: 'journée' },
  { id: 3032, horseId: 4, startDate: '2026-04-08', endDate: '2026-04-17', status: 'pré', period: 'journée' },
  { id: 3033, horseId: 4, startDate: '2026-04-19', endDate: '2026-04-23', status: 'pré', period: 'journée' },
  { id: 3034, horseId: 4, startDate: '2026-04-25', endDate: '2026-04-30', status: 'pré', period: 'journée' },

  // Eiddy (14): 1, 5, 7, 13-14, 16-17, 24-30
  { id: 3131, horseId: 14, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré', period: 'journée' },
  { id: 3132, horseId: 14, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré', period: 'journée' },
  { id: 3133, horseId: 14, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré', period: 'journée' },
  { id: 3134, horseId: 14, startDate: '2026-04-13', endDate: '2026-04-14', status: 'pré', period: 'journée' },
  { id: 3135, horseId: 14, startDate: '2026-04-16', endDate: '2026-04-17', status: 'pré', period: 'journée' },
  { id: 3136, horseId: 14, startDate: '2026-04-24', endDate: '2026-04-30', status: 'pré', period: 'journée' },

  // Fakir (15): 2, 4, 7, 9-11, 14
  { id: 3141, horseId: 15, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré', period: 'journée' },
  { id: 3142, horseId: 15, startDate: '2026-04-04', endDate: '2026-04-04', status: 'pré', period: 'journée' },
  { id: 3143, horseId: 15, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré', period: 'journée' },
  { id: 3144, horseId: 15, startDate: '2026-04-09', endDate: '2026-04-11', status: 'pré', period: 'journée' },
  { id: 3145, horseId: 15, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré', period: 'journée' },

  // Florette (1): 1-2, 7, 9, 13-14, 16
  { id: 3001, horseId: 1, startDate: '2026-04-01', endDate: '2026-04-02', status: 'pré', period: 'journée' },
  { id: 3002, horseId: 1, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré', period: 'journée' },
  { id: 3003, horseId: 1, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré', period: 'journée' },
  { id: 3004, horseId: 1, startDate: '2026-04-13', endDate: '2026-04-14', status: 'pré', period: 'journée' },
  { id: 3005, horseId: 1, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré', period: 'journée' },

  // Foudre (8): 2, 5, 7, 9, 16
  { id: 3071, horseId: 8, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré', period: 'journée' },
  { id: 3072, horseId: 8, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré', period: 'journée' },
  { id: 3073, horseId: 8, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré', period: 'journée' },
  { id: 3074, horseId: 8, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré', period: 'journée' },
  { id: 3075, horseId: 8, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré', period: 'journée' },

  // Gemini (17): 5, 11
  { id: 3161, horseId: 17, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré', period: 'journée' },
  { id: 3162, horseId: 17, startDate: '2026-04-11', endDate: '2026-04-11', status: 'pré', period: 'journée' },

  // Goria (12): 2, 4, 6, 13, 16, 18, 27, 29
  { id: 3111, horseId: 12, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré', period: 'journée' },
  { id: 3112, horseId: 12, startDate: '2026-04-04', endDate: '2026-04-04', status: 'pré', period: 'journée' },
  { id: 3113, horseId: 12, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré', period: 'journée' },
  { id: 3114, horseId: 12, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré', period: 'journée' },
  { id: 3115, horseId: 12, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré', period: 'journée' },
  { id: 3116, horseId: 12, startDate: '2026-04-18', endDate: '2026-04-18', status: 'pré', period: 'journée' },
  { id: 3117, horseId: 12, startDate: '2026-04-27', endDate: '2026-04-27', status: 'pré', period: 'journée' },
  { id: 3118, horseId: 12, startDate: '2026-04-29', endDate: '2026-04-29', status: 'pré', period: 'journée' },

  // Gringo (10): 10-11, 13, 16-17, 20, 23-30
  { id: 3091, horseId: 10, startDate: '2026-04-10', endDate: '2026-04-11', status: 'pré', period: 'journée' },
  { id: 3092, horseId: 10, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré', period: 'journée' },
  { id: 3093, horseId: 10, startDate: '2026-04-16', endDate: '2026-04-17', status: 'pré', period: 'journée' },
  { id: 3094, horseId: 10, startDate: '2026-04-20', endDate: '2026-04-20', status: 'pré', period: 'journée' },
  { id: 3095, horseId: 10, startDate: '2026-04-23', endDate: '2026-04-30', status: 'pré', period: 'journée' },

  // Jimmy (7): 3, 5, 7, 10, 14, 17
  { id: 3061, horseId: 7, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré', period: 'journée' },
  { id: 3062, horseId: 7, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré', period: 'journée' },
  { id: 3063, horseId: 7, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré', period: 'journée' },
  { id: 3064, horseId: 7, startDate: '2026-04-10', endDate: '2026-04-10', status: 'pré', period: 'journée' },
  { id: 3065, horseId: 7, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré', period: 'journée' },
  { id: 3066, horseId: 7, startDate: '2026-04-17', endDate: '2026-04-17', status: 'pré', period: 'journée' },

  // Joliette (11): 2, 6 (après-midi), 7
  { id: 3101, horseId: 11, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré', period: 'journée' },
  { id: 3102, horseId: 11, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré', period: 'après-midi' },
  { id: 3103, horseId: 11, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré', period: 'journée' },

  // Juariste (9): 4, 6
  { id: 3081, horseId: 9, startDate: '2026-04-04', endDate: '2026-04-04', status: 'pré', period: 'journée' },
  { id: 3082, horseId: 9, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré', period: 'journée' },

  // Kiss (6): sem 1-3, sem 6-10, sem 13-17, sem 20-24, sem 27-30 (JAMAIS le week-end)
  { id: 3051, horseId: 6, startDate: '2026-04-01', endDate: '2026-04-03', status: 'pré', period: 'journée' },
  { id: 3052, horseId: 6, startDate: '2026-04-06', endDate: '2026-04-10', status: 'pré', period: 'journée' },
  { id: 3053, horseId: 6, startDate: '2026-04-13', endDate: '2026-04-17', status: 'pré', period: 'journée' },
  { id: 3054, horseId: 6, startDate: '2026-04-22', endDate: '2026-04-24', status: 'pré', period: 'journée' },
  { id: 3055, horseId: 6, startDate: '2026-04-27', endDate: '2026-04-30', status: 'pré', period: 'journée' },

  // Lipton (5): 2-3, 6-14, 18-19, 21, 24, 28
  { id: 3041, horseId: 5, startDate: '2026-04-02', endDate: '2026-04-03', status: 'pré', period: 'journée' },
  { id: 3042, horseId: 5, startDate: '2026-04-06', endDate: '2026-04-14', status: 'pré', period: 'journée' },
  { id: 3043, horseId: 5, startDate: '2026-04-18', endDate: '2026-04-19', status: 'pré', period: 'journée' },
  { id: 3044, horseId: 5, startDate: '2026-04-21', endDate: '2026-04-21', status: 'pré', period: 'journée' },
  { id: 3045, horseId: 5, startDate: '2026-04-24', endDate: '2026-04-24', status: 'pré', period: 'journée' },
  { id: 3046, horseId: 5, startDate: '2026-04-28', endDate: '2026-04-28', status: 'pré', period: 'journée' },

  // Little (13): 2-5, 8-9
  { id: 3121, horseId: 13, startDate: '2026-04-02', endDate: '2026-04-05', status: 'pré', period: 'journée' },
  { id: 3122, horseId: 13, startDate: '2026-04-08', endDate: '2026-04-09', status: 'pré', period: 'journée' },

  // Towingo (16): 7, 9
  { id: 3151, horseId: 16, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré', period: 'journée' },
  { id: 3152, horseId: 16, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré', period: 'journée' },
];

// --- Sub-components (outside for stability) ---


const LoginView = ({ isGerantSelected, setIsGerantSelected, passwordInput, setPasswordInput, login }) => (
  <div className="flex-center animate-fade" style={{ minHeight: '80vh' }}>
    <div className="card glass" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>HorsePlanner</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Gérez votre club avec élégance.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isGerantSelected ? (
          <>
            <button className="btn btn-primary" onClick={() => setIsGerantSelected(true)}>Connexion Gérant</button>
            <button className="btn btn-accent" onClick={() => login(ROLES.PROPRIETAIRE, 'Propriétaire')}>Espace Propriétaire</button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="password" 
              className="input" 
              placeholder="Mot de passe" 
              autoFocus
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && login(ROLES.GERANT)}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => login(ROLES.GERANT)}>Sésame</button>
              <button className="btn" style={{ flex: 1, color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setIsGerantSelected(false)}>Retour</button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, mode, setMode, user, logout }) => (
  <>
    <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <button className={`btn ${mode === APP_MODES.DASHBOARD ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.DASHBOARD)}>🏠 Dashboard</button>
        {user?.role === ROLES.GERANT && (
          <button className={`btn ${mode === APP_MODES.HORSES ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.HORSES)}>🐴 Chevaux</button>
        )}
        <button className={`btn ${mode === APP_MODES.ASSIGNMENTS ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.ASSIGNMENTS)}>🗓️ Affectations</button>
        <button className={`btn ${mode === APP_MODES.CALENDAR ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.CALENDAR)}>📅 Calendrier</button>
        <div style={{ flex: 1 }} />
        {user?.role === ROLES.GERANT && !user?.isDemo && (
          <button className={`btn ${mode === APP_MODES.SETTINGS ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.SETTINGS)}>⚙️ Paramètres</button>
        )}
      </div>
    </aside>
  </>
);

const Navbar = ({ setIsSidebarOpen, logout, user }) => (
  <nav className="navbar glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button className="btn menu-toggle" style={{ background: 'transparent', padding: '5px', fontSize: '1.2rem', color: '#fff' }} onClick={() => setIsSidebarOpen(true)}>☰</button>
      <span style={{ fontSize: '1.5rem' }} className="hide-mobile">🐎</span>
      <h2 className="gradient-text">HorsePlanner</h2>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span style={{ fontSize: '0.8rem', opacity: 0.7 }} className="hide-mobile">
        {user?.role === ROLES.GERANT ? "Chef d'écurie" : "Espace Propriétaire"}
      </span>
      <button className="btn btn-accent" style={{ padding: '6px 15px', fontSize: '0.8rem' }} onClick={logout}>
        🚪 Déconnexion
      </button>
    </div>
  </nav>
);




const HorseManagement = ({ horses, HORSE_ICONS, addHorse, updateHorse, syncDeleteHorse }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🐎');
  const [owner, setOwner] = useState('');

  const [editingHorseId, setEditingHorseId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editOwner, setEditOwner] = useState('');

  const startEditing = (h) => {
    setEditingHorseId(h.id);
    setEditName(h.name);
    setEditEmoji(h.emoji);
    setEditOwner(h.owner);
  };

  const saveEdit = (id) => {
    updateHorse(id, { name: editName, emoji: editEmoji, owner: editOwner });
    setEditingHorseId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !owner) return;
    addHorse({ name, emoji, owner, status: 'box' });
    setName('');
    setOwner('');
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Gestion des Chevaux</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ajoutez ou modifiez les pensionnaires du club.</p>
      </header>

      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <h4>Ajouter un cheval</h4>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <input className="input" placeholder="Nom" value={name} onChange={e => setName(e.target.value)} style={{ flex: 1 }} />
          <select className="input" value={emoji} onChange={e => setEmoji(e.target.value)} style={{ width: '80px', textAlign: 'center' }}>
            {HORSE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
          </select>
          <input className="input" placeholder="Propriétaire" value={owner} onChange={e => setOwner(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-accent">Ajouter</button>
        </form>
      </div>

      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
           <h3>🐴 Liste des Chevaux ({horses.length})</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {horses.slice().sort((a, b) => a.name.localeCompare(b.name)).map(h => (
            <div key={h.id} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '12px', borderLeft: `4px solid ${h.color || 'var(--accent)'}` }}>
              {editingHorseId === h.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <select className="input" value={editEmoji} onChange={e => setEditEmoji(e.target.value)} style={{ width: '60px' }}>
                      {HORSE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                    <input className="input" autoFocus value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <input className="input" value={editOwner} onChange={e => setEditOwner(e.target.value)} />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-primary" onClick={() => saveEdit(h.id)}>Enregistrer</button>
                    <button className="btn" onClick={() => setEditingHorseId(null)}>Annuler</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.8rem' }}>{h.emoji}</span>
                    <div>
                      <strong style={{ display: 'block' }}>{h.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Propriétaire: {h.owner}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => startEditing(h)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✏️</button>
                    <button onClick={() => syncDeleteHorse(h.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AssignmentView = ({ user, ROLES, horses, assignments, formatDate, addAssignment, deleteAssignment, updateAssignmentPeriod, updateAssignmentDates }) => {
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('pré');
  const [period, setPeriod] = useState('journée');
  const [viewType, setViewType] = useState('all');
  const [activeTab, setActiveTab] = useState('actives'); // 'actives' | 'upcoming' | 'past'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedHorseId || !startDate || !endDate) return;
    addAssignment({ horseId: Number(selectedHorseId), startDate, endDate, status, period });
    setStartDate('');
    setEndDate('');
  };

  const isOwner = user?.role === ROLES.PROPRIETAIRE;
  const myHorseIds = isOwner ? PROPRIETARY_HORSE_IDS : horses.map(h => h.id);
  const myHorses = horses.filter(h => myHorseIds.includes(h.id));

  const baseAssignments = isOwner
    ? assignments.filter(p => myHorseIds.includes(p.horseId))
    : viewType === 'club'
      ? assignments.filter(p => horses.find(h => h.id === p.horseId && h.owner === 'Club'))
      : viewType === 'owner'
        ? assignments.filter(p => horses.find(h => h.id === p.horseId && h.owner !== 'Club'))
        : assignments;

  const today = new Date().toISOString().split('T')[0];

  const activeAssignments  = baseAssignments.filter(p => p.startDate <= today && p.endDate >= today);
  const upcomingAssignments = baseAssignments.filter(p => p.startDate > today);
  const pastAssignments    = baseAssignments.filter(p => p.endDate < today);

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  // Group assignments by horse (alphabetical), then sorted by date
  const groupByHorse = (list) => {
    const grouped = {};
    list.forEach(p => {
      const h = horses.find(h => h.id === p.horseId);
      if (!h) return;
      if (!grouped[h.name]) grouped[h.name] = { horse: h, items: [] };
      grouped[h.name].items.push(p);
    });
    // Sort items by startDate within each horse
    Object.values(grouped).forEach(g => g.items.sort((a, b) => a.startDate.localeCompare(b.startDate)));
    // Return sorted alphabetically by horse name
    return Object.keys(grouped).sort().map(k => grouped[k]);
  };

  const renderAssignmentCard = (p, h) => (
    <div key={p.id} className="glass" style={{
      padding: '10px 14px', borderRadius: '10px',
      display: 'flex', alignItems: 'center', gap: '10px',
      borderLeft: `3px solid ${h.color || 'var(--accent)'}`,
      flex: '1 1 200px'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
          {p.startDate === p.endDate
            ? formatDate(p.startDate)
            : `du ${formatDate(p.startDate)} au ${formatDate(p.endDate)}`}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
          <span className={`badge ${p.status === 'pré' ? 'success' : 'info'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
            {p.status === 'pré' ? '🌿 Pré' : '🏠 Box'}
            {p.period !== 'journée' && ` · ${p.period}`}
          </span>
        </div>
      </div>
      {user?.role === ROLES.GERANT && (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => {
              const el = document.getElementById(`edit-${p.id}`);
              if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none';
            }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}>✏️</button>
            <div id={`edit-${p.id}`} className="glass" style={{
              display: 'none', position: 'absolute', top: '100%', right: 0, zIndex: 100,
              padding: '12px', borderRadius: '10px', flexDirection: 'column', gap: '6px',
              minWidth: '200px', background: '#1a1a2e', border: '1px solid var(--accent)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Début</label>
              <input type="date" value={p.startDate} onChange={e => updateAssignmentDates(p.id, e.target.value, p.endDate)} className="input" style={{ padding: '6px', color: '#fff', fontSize: '0.8rem' }} />
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Fin</label>
              <input type="date" value={p.endDate} onChange={e => updateAssignmentDates(p.id, p.startDate, e.target.value)} className="input" style={{ padding: '6px', color: '#fff', fontSize: '0.8rem' }} />
              <button onClick={() => { const el = document.getElementById(`edit-${p.id}`); if(el) el.style.display='none'; }} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '4px', marginTop: '4px' }}>Fermer</button>
            </div>
          </div>
          <button onClick={() => deleteAssignment(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}>🗑️</button>
        </div>
      )}
    </div>
  );

  const renderHorseGroups = (list) => {
    const groups = groupByHorse(list);
    if (groups.length === 0) return <p style={{ fontSize: '0.85rem', opacity: 0.5, padding: '1rem 0' }}>Aucune affectation.</p>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {groups.map(({ horse: h, items }) => (
          <div key={h.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>{h.emoji}</span>
              <strong style={{ fontSize: '1rem', color: h.color || 'var(--accent)' }}>{h.name}</strong>
              <span style={{ fontSize: '0.7rem', opacity: 0.5, background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '20px' }}>{items.length} affectation{items.length > 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '1rem', borderLeft: `2px solid ${h.color || 'rgba(255,255,255,0.1)'}` }}>
              {items.map(p => renderAssignmentCard(p, h))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabStyle = (tab) => ({
    padding: '6px 16px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--accent)' : 'rgba(255,255,255,0.07)',
    color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.6)',
  });

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Affectations & Planning</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gérez les périodes de pâturage et de repos.</p>
      </header>

      {user?.role === ROLES.GERANT && (
        <div className="card glass" style={{ marginBottom: '2rem' }}>
          <h4>Nouvelle affectation</h4>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cheval</label>
              <select className="input" value={selectedHorseId} onChange={e => setSelectedHorseId(e.target.value)}>
                <option value="">Sélectionner...</option>
                {horses.slice().sort((a, b) => a.name.localeCompare(b.name)).map(h => (
                  <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Début</label>
              <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fin</label>
              <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div>
               <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Période</label>
               <select className="input" value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="journée">Journée</option>
                <option value="matin">Matin</option>
                <option value="après-midi">Après-midi</option>
              </select>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <button className="btn btn-primary" style={{ width: '100%' }}>Planifier</button>
            </div>
          </form>
        </div>
      )}

      <div className="card glass">
        {/* Header + filtres */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>{isOwner ? '📜 Mes affectations' : '📅 Toutes les affectations'}</h3>
          {!isOwner && (
            <div className="btn-group">
              <button className={`btn ${viewType === 'all' ? 'btn-primary' : ''}`} onClick={() => setViewType('all')}>Toutes</button>
              <button className={`btn ${viewType === 'club' ? 'btn-primary' : ''}`} onClick={() => setViewType('club')}>Club</button>
              <button className={`btn ${viewType === 'owner' ? 'btn-primary' : ''}`} onClick={() => setViewType('owner')}>Propriétaires</button>
            </div>
          )}
        </div>

        {/* Sous-onglets */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button style={tabStyle('actives')} onClick={() => setActiveTab('actives')}>
            🟢 Actives
            <span style={{ marginLeft: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem' }}>{activeAssignments.length}</span>
          </button>
          <button style={tabStyle('upcoming')} onClick={() => setActiveTab('upcoming')}>
            ⏳ À venir
            <span style={{ marginLeft: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem' }}>{upcomingAssignments.length}</span>
          </button>
          <button style={tabStyle('past')} onClick={() => setActiveTab('past')}>
            📂 Passées
            <span style={{ marginLeft: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem' }}>{pastAssignments.length}</span>
          </button>
        </div>

        {/* Contenu par onglet */}
        {activeTab === 'actives'  && renderHorseGroups(activeAssignments)}
        {activeTab === 'upcoming' && renderHorseGroups(upcomingAssignments)}
        {activeTab === 'past'     && renderHorseGroups(pastAssignments)}
      </div>
    </div>
  );
};





const CalendarView = ({ horses, assignments }) => {
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [selectedHorseId, setSelectedHorseId] = useState('all');

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  
  const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(activeYear, activeMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getHorseAssignments = (day) => {
    const dateStr = `${activeYear}-${(activeMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return assignments.filter(a => {
      const start = a.startDate;
      const end = a.endDate;
      const matchesHorse = selectedHorseId === 'all' || a.horseId === Number(selectedHorseId);
      return dateStr >= start && dateStr <= end && matchesHorse;
    });
  };

  const monthLabel = `${monthNames[activeMonth]} ${activeYear}`;

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Calendrier des Pâturages</h1>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }} className="hide-scrollbar">
          {monthNames.map((m, idx) => (
            <button 
              key={m} 
              className={`btn ${activeMonth === idx ? 'btn-primary' : ''}`} 
              style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '30px', whiteSpace: 'nowrap' }} 
              onClick={() => setActiveMonth(idx)}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      <div className="card glass" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, color: 'var(--accent)' }}>{monthLabel}</h2>
          
          {selectedHorseId !== 'all' && (() => {
            const selectedHorse = horses.find(h => h.id === Number(selectedHorseId));
            const horseAssigns = assignments.filter(a => a.horseId === Number(selectedHorseId) && a.status === 'pré');
            
            let totalDays = 0;
            days.forEach(day => {
              const dateStr = `${activeYear}-${(activeMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const daily = horseAssigns.find(a => dateStr >= a.startDate && dateStr <= a.endDate);
              if (daily) {
                totalDays += (daily.period === 'journée' ? 1 : 0.5);
              }
            });

            return selectedHorse ? (
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--warning)', animation: 'fadeIn 0.4s' }}>
                📊 Ce mois-ci : {totalDays} jours au pré
              </div>
            ) : null;
          })()}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Filtrer par :</span>
            <select className="input" style={{ width: 'auto', minWidth: '180px' }} value={selectedHorseId} onChange={e => setSelectedHorseId(e.target.value)}>
              <option value="all">Tous les chevaux</option>
              {horses.slice().sort((a, b) => a.name.localeCompare(b.name)).map(h => (
                <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="calendar-wrapper">
          <div className="calendar-grid">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="calendar-header-cell">{d}</div>
            ))}
            {Array.from({ length: (firstDayOfMonth + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: 'rgba(0,0,0,0.1)' }} />
            ))}
            {days.map(day => {
              const dateStr = `${activeYear}-${(activeMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const dayAssigns = getHorseAssignments(day);

              return (
                <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.6, marginBottom: '4px', textAlign: 'right' }}>{day}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayAssigns.map(a => {
                      const h = horses.find(h => h.id === a.horseId);
                      return h ? (
                        <div key={a.id} className="calendar-item" style={{ 
                          borderLeft: `3px solid ${h.color || 'var(--accent)'}`,
                          background: 'rgba(255,255,255,0.03)'
                        }}>
                          <span style={{ fontSize: '1rem' }}>{h.emoji}</span>
                          <strong style={{ opacity: 0.9 }}>{h.name}</strong>
                          {a.period !== 'journée' && <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>({a.period})</span>}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, ROLES, horses, assignments, formatDate }) => {
  const isManager = user?.role === ROLES.GERANT;
  const today = new Date().toISOString().split('T')[0];
  // Use PROPRIETARY_HORSE_IDS to bypass Supabase owner field (which overrides INITIAL_HORSES)
  const myHorses = user?.role === ROLES.PROPRIETAIRE
    ? horses.filter(h => PROPRIETARY_HORSE_IDS.includes(h.id))
    : horses;

  const todayAssignments = assignments.filter(p => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    const current = new Date(today);
    return current >= start && current <= end;
  });

  const renderManagerDashboard = () => (
    <div className="grid">
      <div className="card glass" style={{ borderLeft: '4px solid var(--success)', overflow: 'hidden' }}>
        <h3>☀️ Matin - Départ au pré</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mouvements prévus ce matin.</p>
        <div className="dashboard-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginTop: '1rem' }}>
           {todayAssignments.filter(a => a.startDate === today && a.status === 'pré').sort((a, b) => {
            const hA = horses.find(h => h.id === a.horseId);
            const hB = horses.find(h => h.id === b.horseId);
            return (hA?.name || "").localeCompare(hB?.name || "");
          }).map(a => {
            const h = horses.find(h => h.id === a.horseId);
            return h ? (
              <div key={a.id} className="glass" style={{ padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0', borderLeft: `4px solid ${h.color || 'var(--success)'}` }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{h.emoji}</span> 
                <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{h.name}</strong>
              </div>
            ) : null;
          })}
          {todayAssignments.filter(a => a.startDate === today && a.status === 'pré').length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Aucun départ.</p>}
        </div>
      </div>
      <div className="card glass" style={{ borderLeft: '4px solid var(--warning)', overflow: 'hidden' }}>
        <h3>🌑 Soir - Retour box</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mouvements prévus ce soir.</p>
        <div className="dashboard-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginTop: '1rem' }}>
           {todayAssignments.filter(a => a.endDate === today && a.status === 'pré').sort((a, b) => {
            const hA = horses.find(h => h.id === a.horseId);
            const hB = horses.find(h => h.id === b.horseId);
            return (hA?.name || "").localeCompare(hB?.name || "");
          }).map(a => {
            const h = horses.find(h => h.id === a.horseId);
            return h ? (
              <div key={a.id} className="glass" style={{ padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0', borderLeft: `4px solid ${h.color || 'var(--warning)'}` }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{h.emoji}</span> 
                <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{h.name}</strong>
              </div>
            ) : null;
          })}
          {todayAssignments.filter(a => a.endDate === today && a.status === 'pré').length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Aucun retour.</p>}
        </div>
      </div>
    </div>
  );

  const renderOwnerDashboard = () => {
    const atPasture = myHorses.map(h => {
      const assignment = todayAssignments.find(a => a.horseId === h.id && a.status === 'pré');
      return { horse: h, assignment };
    }).filter(h => h.assignment);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card glass" style={{ background: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)', display: 'flex', gap: '15px', alignItems: 'center', padding: '1rem 1.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>
            Pour toute modification ou suppression d'une affectation, merci de contacter le club par téléphone ou par e-mail.
          </p>
        </div>

        <div className="grid">
          <div className="card glass">
            <h3 style={{ color: 'var(--success)' }}>🌿 Chevaux Propriétaires (au Pré)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginTop: '1rem' }}>
               {atPasture.sort((a, b) => a.horse.name.localeCompare(b.horse.name)).map(({horse: h, assignment: a}) => {
                const days = Math.ceil((new Date(a.endDate) - new Date(a.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <div key={h.id} className="horse-item glass" style={{ borderLeft: `4px solid ${h.color || 'var(--primary)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', padding: '10px' }} onClick={() => alert(`Au pré du ${formatDate(a.startDate)} au ${formatDate(a.endDate)} (${days} jours)`)}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{h.emoji}</span>
                    <strong style={{ fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{h.name}</strong>
                  </div>
                );
              })}
              {atPasture.length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Aucun cheval au pré.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h1 style={{ margin: 0 }}>Bonjour {isManager ? 'Daniel' : ''} 👋</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{isManager ? 'Tableau de bord' : 'Emplacement actuel des chevaux propriétaires'}</p>
      </header>

      {isManager ? renderManagerDashboard() : renderOwnerDashboard()}
    </div>
  );
};

const SettingsView = ({ syncPath, setSyncPath, clientId, setClientId, initGoogleDrive, setIsDriveConnected, isDriveConnected, handleConnectDrive, isAutoSync, setIsAutoSync, lastSync, INITIAL_HORSES, fetchSupabaseData, INITIAL_PLANNINGS, handleManualSave, handleManualLoad }) => (
  <div className="animate-fade">
    <header style={{ marginBottom: '2rem' }}>
      <h1>Paramètres - Automate Sync ☁️</h1>
      <p style={{ color: 'var(--text-muted)' }}>Configurez la synchronisation Google Drive "Automate Edition".</p>
    </header>

    <div className="card glass">
      <h3>📂 Chemin de synchronisation</h3>
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Chemin ou ID du dossier Google Drive</label>
          <input 
            className="input" 
            value={syncPath} 
            onChange={e => setSyncPath(e.target.value)} 
            placeholder="ex: DigitalSaurien/AUTOMATE/HorsePlanner"
            style={{ width: '100%', padding: '12px', background: 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
          />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '5px' }}>
            ℹ️ Vous pouvez mettre soit un chemin (Dossier/SousDossier) soit directement l'ID unique (ID du dossier cible uniquement).
          </p>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Google Client ID (OAuth 2.0)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              className="input" 
              value={clientId} 
              onChange={e => setClientId(e.target.value)} 
              placeholder="ex: 12345-abcde.apps.googleusercontent.com"
              style={{ flex: 1, padding: '12px', background: 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
            />
            <button className="btn btn-accent" style={{ fontSize: '0.7rem' }} onClick={() => {
              initGoogleDrive(clientId).then(() => alert("✅ Client ID appliqué ! Reconnectez-vous au Drive."));
              setIsDriveConnected(false);
            }}>Appliquer</button>
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '5px' }}>
            ⚠️ Si vous changez le Client ID, cliquez sur "Appliquer" puis reconnectez-vous au Drive ci-dessous.
          </p>
        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Connexion Google :</span>
            <span className={`badge ${isDriveConnected ? 'success' : 'info'}`}>
              {isDriveConnected ? 'Actif ✅' : 'Inactif ❌'}
            </span>
          </div>
          {!isDriveConnected && (
            <button className="btn btn-primary" style={{ marginTop: '15px', width: '100%' }} onClick={handleConnectDrive}>
              Établir la liaison Google Drive
            </button>
          )}
          {isDriveConnected && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', display: 'block' }}>Synchronisation automatique</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sauvegarde automatiquement en tâche de fond.</span>
              </div>
              <input type="checkbox" checked={isAutoSync} onChange={(e) => {
                setIsAutoSync(e.target.checked);
                localStorage.setItem('hp_auto_sync', e.target.checked);
              }} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            </div>
          )}
          {lastSync && <div style={{ fontSize: '0.7rem', marginTop: '10px', textAlign: 'right', opacity: 0.7 }}>Dernière synchro : {lastSync}</div>}
        </div>

        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <h4 style={{ color: 'var(--danger)' }}>Zone de danger</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Rétablir les données de démonstration (Mars à Mai 2026).</p>
          <button className="btn" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(244, 67, 54, 0.05)', width: '100%' }} onClick={async () => {
            if (confirm("Voulez-vous réinitialiser Supabase avec les chevaux des captures d'écran ?")) {
              const seedData = INITIAL_HORSES.map(({id, ...rest}) => rest);
              await supabase.from('horses').delete().neq('id', 0); // Vider
              await supabase.from('horses').insert(seedData);
              fetchSupabaseData();
              alert("✅ Chevaux réinitialisés !");
            }
          }}>Injection Chevaux (Captures d'écran)</button>
          
          <button className="btn" style={{ border: '1px solid var(--warning)', color: 'var(--warning)', background: 'rgba(255, 193, 7, 0.05)', width: '100%', marginTop: '10px' }} onClick={async () => {
            if (confirm("Voulez-vous réinitialiser Supabase avec le planning des captures d'écran ?")) {
              await supabase.from('assignments').delete().neq('id', 0); // Vider
              const seedAssigns = INITIAL_PLANNINGS.map(({id, horseId, startDate, endDate, status, period}) => ({
                horse_id: horseId, // Note mapping logic might need manual alignment if IDs differ
                start_date: startDate,
                end_date: endDate,
                status,
                period: period || 'journée'
              }));
              // Warning: Mapping fixed IDs to DB IDs is tricky. Better to manually reassign or use name matching.
              alert("⚠️ Le planning de démo nécessite des IDs fixes. Je vous conseille de recréer manuellement quelques affectations pour tester la synchro.");
            }
          }}>Réinstaller le Planning de Démo</button>
        </div>
      </div>
    </div>

      <div className="card glass" style={{ marginTop: '2rem', border: '1px solid rgba(66, 133, 244, 0.3)' }}>
        <h3 style={{ color: '#4285F4', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ☁️ Synchronisation Cloud
        </h3>
        <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '1rem' }}>
          Contrôlez manuellement vos données sur Google Drive.
        </p>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleManualSave}>
            📤 Sauvegarder
          </button>
          <button className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }} onClick={handleManualLoad}>
            📥 Charger
          </button>
        </div>

        <div style={{ fontSize: '0.7rem', opacity: 0.6, textAlign: 'center' }}>
          Dernière action : {lastSync || 'Aucune dans cette session'}
        </div>
      </div>

      <div className="card glass" style={{ marginTop: '2rem', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
        <h3 style={{ color: 'var(--danger)' }}>🆘 Zone de Secours</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        En cas de bug persistant ou d'écran blanc, vous pouvez réinitialiser l'application. 
        Cela déconnectera Google Drive et videra le cache local.
      </p>
      <button 
        className="btn" 
        onClick={() => { if(confirm("Réinitialiser HorsePlanner ?")) { localStorage.clear(); window.location.reload(); } }}
        style={{ width: '100%', background: 'rgba(244, 67, 54, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
      >
        🗑️ Réinitialiser tout le cache
      </button>
    </div>
  </div>
);

function App() {
  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const [user, setUser] = useState(null);
  const [mode, setMode] = useState(APP_MODES.LOGIN);
  const [horses, setHorses] = useState(INITIAL_HORSES);
  const [assignments, setAssignments] = useState(INITIAL_PLANNINGS); 
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncPath, setSyncPath] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [masterPassword, setMasterPassword] = useState('bucephal91$ADM');
  const [clientId, setClientId] = useState('');
  const [isGerantSelected, setIsGerantSelected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(() => localStorage.getItem('hp_auto_sync') !== 'false');

  // Close sidebar on mode change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [mode]);

  // Supabase Initial Load
  const fetchSupabaseData = async () => {
    try {
      // Fetch Horses
      const { data: horsesData, error: hError } = await supabase.from('horses').select('*').order('name');
      if (hError) throw hError;
      if (horsesData && horsesData.length > 0) setHorses(horsesData.map(h => ({...h, id: Number(h.id)})));
      else {
        // Seed if empty
        const seedData = INITIAL_HORSES.map(({id, ...rest}) => rest);
        const { error: seedHError } = await supabase.from('horses').insert(seedData);
        if (!seedHError) fetchSupabaseData();
      }

      // Remap Assignments
      const { data: assignData, error: aError } = await supabase.from('assignments').select('*');
      if (aError) throw aError;
      // Strategy: INITIAL_PLANNINGS is the source of truth for demo data.
      // Only add Supabase entries whose IDs are NOT in INITIAL_PLANNINGS (i.e., user-created entries).
      const initIds = new Set(INITIAL_PLANNINGS.map(p => p.id));
      const mapped = assignData.map(a => ({
        id: a.id,
        horseId: Number(a.horse_id),
        startDate: a.start_date,
        endDate: a.end_date,
        status: a.status,
        period: a.period
      }));
      // Only keep Supabase entries that are NOT already in INITIAL_PLANNINGS
      const userCreated = mapped.filter(m => !initIds.has(m.id));
      setAssignments([...INITIAL_PLANNINGS, ...userCreated]);

    } catch (err) {
      console.error("Supabase Load Error:", err);
    }
  };

  useEffect(() => {
    fetchSupabaseData();
    
    // Subscribe to changes for Real-time
    const horseSub = supabase.channel('horses_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'horses' }, fetchSupabaseData).subscribe();
    const assignSub = supabase.channel('assign_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, fetchSupabaseData).subscribe();
    
    return () => {
      supabase.removeChannel(horseSub);
      supabase.removeChannel(assignSub);
    };
  }, []);

  // Load from localStorage
  useEffect(() => {
    const APP_VERSION = 'v1.6';
    try {
      const savedVersion = localStorage.getItem('hp_version');
      if (savedVersion !== APP_VERSION) {
        localStorage.clear();
        localStorage.setItem('hp_version', APP_VERSION);
        window.location.reload();
        return;
      }

      const savedUser = localStorage.getItem('hp_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setMode(APP_MODES.DASHBOARD);
      }
      
      const savedHorses = localStorage.getItem('horsePlanner_horses_v1.6');
      if (savedHorses && JSON.parse(savedHorses).length > 0) setHorses(JSON.parse(savedHorses));
      else setHorses(INITIAL_HORSES);

      const savedClientId = localStorage.getItem('hp_client_id');
      if (savedClientId) setClientId(savedClientId);

      const savedAssignments = localStorage.getItem('horsePlanner_assignments_v1.6');
      if (savedAssignments && JSON.parse(savedAssignments).length > 0) setAssignments(JSON.parse(savedAssignments));
      else setAssignments(INITIAL_PLANNINGS);

      const savedPath = localStorage.getItem('hp_sync_path');
      if (savedPath) setSyncPath(savedPath);

      const savedMaster = localStorage.getItem('hp_master_password');
      if (savedMaster) setMasterPassword(savedMaster);
    } catch (err) {
      console.error("Critical localStorage Load Error:", err);
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('horsePlanner_horses_v1.6', JSON.stringify(horses));
    localStorage.setItem('horsePlanner_assignments_v1.6', JSON.stringify(assignments));
    localStorage.setItem('hp_sync_path', syncPath);
    localStorage.setItem('hp_master_password', masterPassword);
    localStorage.setItem('hp_client_id', clientId);
  }, [horses, assignments, syncPath, masterPassword, clientId]);

  // Real-time Save logic (Supabase)
  const syncAddHorse = async (horse) => {
    const { error } = await supabase.from('horses').insert([{ ...horse }]);
    if (error) alert("Erreur Supabase: " + error.message);
  };

  const syncDeleteHorse = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce cheval ?")) return;
    const { error } = await supabase.from('horses').delete().eq('id', id);
    if (error) alert("Erreur Supabase: " + error.message);
  };

  const syncAddAssignment = async (a) => {
    const { error } = await supabase.from('assignments').insert([{
      horse_id: a.horseId,
      start_date: a.startDate,
      end_date: a.endDate,
      status: a.status,
      period: a.period
    }]);
    if (error) alert("Erreur Supabase: " + error.message);
  };

  const syncDeleteAssignment = async (id) => {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) alert("Erreur Supabase: " + error.message);
  };

  const syncUpdateAssignment = async (id, updates) => {
    const dbUpdates = {};
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.endDate) dbUpdates.end_date = updates.endDate;
    if (updates.period) dbUpdates.period = updates.period;
    
    const { error } = await supabase.from('assignments').update(dbUpdates).eq('id', id);
    if (error) alert("Erreur Supabase: " + error.message);
  };

  const handleConnectDrive = () => alert("Note: HorsePlanner utilise désormais Supabase pour une synchro temps-réel.");
  const handleManualSave = () => alert("Synchro temps-réel active (Supabase).");
  const handleManualLoad = () => alert("Les données sont déjà synchronisées en temps réel.");

  const login = (role, email = '') => {
    let isDemo = false;
    if (role === ROLES.GERANT) {
      if (passwordInput === 'demo') {
        isDemo = true;
      } else if (passwordInput !== masterPassword) {
        alert('Mot de passe incorrect pour Bucéphale ! 🛑');
        return;
      }
    }
    const newUser = { 
      role, 
      email: email || (role === ROLES.GERANT ? 'admin@club.com' : 'user@club.com'), 
      name: email.split('@')[0], 
      isDemo 
    };
    setUser(newUser);
    localStorage.setItem('hp_user', JSON.stringify(newUser));
    setMode(APP_MODES.DASHBOARD);
  };

  const logout = () => {
    setUser(null);
    setMode(APP_MODES.LOGIN);
    localStorage.removeItem('hp_user');
  };

  const syncUpdateHorse = async (id, updates) => {
    const { error } = await supabase.from('horses').update(updates).eq('id', id);
    if (error) alert("Erreur Supabase: " + error.message);
  };

  const addHorse = (horse) => syncAddHorse(horse);
  const deleteHorse = (id) => syncDeleteHorse(id);
  const updateHorse = (id, updates) => syncUpdateHorse(id, updates);

  const addAssignment = (assignment) => syncAddAssignment(assignment);
  const deleteAssignment = (id) => syncDeleteAssignment(id);
  
  const updateAssignmentPeriod = (id, period) => syncUpdateAssignment(id, { period });
  const updateAssignmentDates = (id, startDate, endDate) => syncUpdateAssignment(id, { startDate, endDate });

  // Sub-components are moved outside for stability.

  return (
    <div style={{ background: '#121212', minHeight: '100vh', color: '#fff' }}>
      {mode === APP_MODES.LOGIN ? <LoginView isGerantSelected={isGerantSelected} setIsGerantSelected={setIsGerantSelected} passwordInput={passwordInput} setPasswordInput={setPasswordInput} login={login} /> : (
        <div style={{ display: 'flex', width: '100%' }}>
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} mode={mode} setMode={setMode} user={user} logout={logout} />
          <main className="main-content container">
            <Navbar setIsSidebarOpen={setIsSidebarOpen} logout={logout} user={user} />
            <div>
              {mode === APP_MODES.DASHBOARD && <Dashboard user={user} ROLES={ROLES} horses={horses} assignments={assignments} formatDate={formatDate} />}
              {mode === APP_MODES.HORSES && <HorseManagement horses={horses} HORSE_ICONS={HORSE_ICONS} addHorse={addHorse} updateHorse={updateHorse} syncDeleteHorse={deleteHorse} />}
              {mode === APP_MODES.ASSIGNMENTS && <AssignmentView user={user} ROLES={ROLES} horses={horses} assignments={assignments} formatDate={formatDate} addAssignment={addAssignment} deleteAssignment={deleteAssignment} updateAssignmentDates={updateAssignmentDates} />}
              {mode === APP_MODES.CALENDAR && <CalendarView horses={horses} assignments={assignments} />}
              {mode === APP_MODES.SETTINGS && <SettingsView syncPath={syncPath} setSyncPath={setSyncPath} clientId={clientId} setClientId={setClientId} initGoogleDrive={(id) => Promise.resolve()} setIsDriveConnected={setIsDriveConnected} isDriveConnected={isDriveConnected} handleConnectDrive={handleConnectDrive} isAutoSync={isAutoSync} setIsAutoSync={setIsAutoSync} lastSync={lastSync} INITIAL_HORSES={INITIAL_HORSES} fetchSupabaseData={fetchSupabaseData} INITIAL_PLANNINGS={INITIAL_PLANNINGS} handleManualSave={handleManualSave} handleManualLoad={handleManualLoad} />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
