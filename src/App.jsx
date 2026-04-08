import React, { useState, useEffect } from 'react';
import './index.css';
import { initGoogleDrive, authenticateGoogle, saveToDrive, loadFromDrive } from './utils/googleDrive';

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
  { id: 1, name: 'Florette', emoji: '🌸', owner: 'Dupont', color: '#ff80ab', status: 'pré' },
  { id: 2, name: 'Cliff', emoji: '🐴', owner: 'Club', color: '#b08d57', status: 'pré' },
  { id: 3, name: 'Cloony', emoji: '🍀', owner: 'Club', color: '#4caf50', status: 'pré' },
  { id: 4, name: 'Conquérant', emoji: '🦓', owner: 'Dupont', color: '#333333', status: 'pré' },
  { id: 5, name: 'Lipton', emoji: '🐰', owner: 'Club', color: '#90caf9', status: 'pré' },
  { id: 6, name: 'Kiss', emoji: '💋', owner: 'Club', color: '#f44336', status: 'box' },
  { id: 7, name: 'Jimmy', emoji: '🐎', owner: 'Dupont', color: '#a1887f', status: 'box' },
  { id: 8, name: 'Foudre', emoji: '⚡', owner: 'Club', color: '#ffd54f', status: 'box' },
  { id: 9, name: 'Juariste', emoji: '🎍', owner: 'Club', color: '#81c784', status: 'box' },
  { id: 10, name: 'Gringo', emoji: '🤠', owner: 'Dupont', color: '#795548', status: 'box' },
  { id: 11, name: 'Joliette', emoji: '🦄', owner: 'Club', color: '#ce93d8', status: 'box' },
  { id: 12, name: 'Goria', emoji: '🦄', owner: 'Club', color: '#ba68c8', status: 'box' },
  { id: 13, name: 'Little', emoji: '🐎', owner: 'Dupont', color: '#e0e0e0', status: 'box' },
  { id: 14, name: 'Eiddy', emoji: '🌷', owner: 'Club', color: '#f06292', status: 'box' },
];

const INITIAL_PLANNINGS = [
  // Day 1
  { id: 101, horseId: 1, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré' },
  { id: 102, horseId: 2, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré' },
  { id: 103, horseId: 3, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré' },
  { id: 104, horseId: 4, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré' },
  { id: 105, horseId: 5, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré' },
  // Day 2
  { id: 201, horseId: 2, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 202, horseId: 7, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 203, horseId: 4, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 204, horseId: 8, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 205, horseId: 9, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 206, horseId: 10, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 207, horseId: 3, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 208, horseId: 11, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 209, horseId: 12, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 210, horseId: 5, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: 211, horseId: 13, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  // Day 3
  { id: 301, horseId: 6, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' },
  { id: 302, horseId: 4, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' },
  { id: 303, horseId: 5, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' },
  { id: 304, horseId: 13, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' },
  { id: 305, horseId: 14, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' },
];

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState(APP_MODES.LOGIN);
  const [horses, setHorses] = useState(INITIAL_HORSES);
  const [assignments, setAssignments] = useState([]); 
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncPath, setSyncPath] = useState('DigitalSaurien/AUTOMATE/HorsePlanner');
  const [passwordInput, setPasswordInput] = useState('');
  const [masterPassword, setMasterPassword] = useState('bucephal91$ADM');
  const [clientId, setClientId] = useState('867619813314-h3gf1ro6fn1ddotkttso119lbiphi2rv.apps.googleusercontent.com');
  const [isGerantSelected, setIsGerantSelected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on mode change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [mode]);

  // Initialize Drive
  useEffect(() => {
    const savedClientId = localStorage.getItem('hp_client_id') || clientId;
    initGoogleDrive(savedClientId).then(() => {
      console.log("☁️ Drive Ready with ID:", savedClientId);
    });
  }, []);

  // Load from localStorage
  useEffect(() => {
    const APP_VERSION = 'v1.1';
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
      
      const savedHorses = localStorage.getItem('horsePlanner_horses_v1.1');
      if (savedHorses) setHorses(JSON.parse(savedHorses));

      const savedClientId = localStorage.getItem('hp_client_id');
      if (savedClientId) setClientId(savedClientId);

      const savedAssignments = localStorage.getItem('horsePlanner_assignments_v1.1');
      if (savedAssignments) setAssignments(JSON.parse(savedAssignments));

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
    localStorage.setItem('horsePlanner_horses_v1.1', JSON.stringify(horses));
    localStorage.setItem('horsePlanner_assignments_v1.1', JSON.stringify(assignments));
    localStorage.setItem('hp_sync_path', syncPath);
    localStorage.setItem('hp_master_password', masterPassword);
    localStorage.setItem('hp_client_id', clientId);
  }, [horses, assignments, syncPath, masterPassword, clientId]);

  const handleConnectDrive = async () => {
    try {
      await authenticateGoogle();
      setIsDriveConnected(true);
      alert("✅ Connecté à Google Drive !");
    } catch (err) {
      console.error("Auth Fail:", err);
    }
  };

  const handleManualSave = async () => {
    const success = await saveToDrive({ horses, assignments }, syncPath);
    if (success) {
      setLastSync(new Date().toLocaleString());
      alert("✅ Sauvegarde réussie sur Google Drive !");
    } else {
      alert("❌ Échec de la sauvegarde.");
    }
  };

  const handleManualLoad = async () => {
    if (!confirm("Voulez-vous écraser les données locales par celles du Drive ?")) return;
    const data = await loadFromDrive(syncPath);
    if (data) {
      if (data.horses) setHorses(data.horses);
      if (data.assignments) setAssignments(data.assignments);
      alert("✅ Données chargées depuis Google Drive !");
    } else {
      alert("❌ Aucun fichier trouvé sur le Drive.");
    }
  };

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

  const addHorse = (horse) => setHorses([...horses, { id: Date.now(), ...horse }]);
  const deleteHorse = (id) => setHorses(horses.filter(h => h.id !== id));


  const addAssignment = (assignment) => {
    setAssignments([...assignments, { ...assignment, id: Date.now() }]);
  };

  const deleteAssignment = (id) => setAssignments(assignments.filter(p => p.id !== id));

  // --- Components ---

  const Sidebar = () => (
    <>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className={`btn ${mode === APP_MODES.DASHBOARD ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.DASHBOARD)}>🏠 Dashboard</button>
        {user?.role === ROLES.GERANT && (
          <>
            <button className={`btn ${mode === APP_MODES.HORSES ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.HORSES)}>🐴 Chevaux</button>
            <button className={`btn ${mode === APP_MODES.ASSIGNMENTS ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.ASSIGNMENTS)}>🗓️ Affectations</button>
          </>
        )}
        <button className={`btn ${mode === APP_MODES.CALENDAR ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.CALENDAR)}>📅 Calendrier</button>
        {user?.role === ROLES.GERANT && !user?.isDemo && (
          <button className={`btn ${mode === APP_MODES.SETTINGS ? 'btn-primary' : ''}`} style={{ justifyContent: 'start', marginTop: 'auto' }} onClick={() => setMode(APP_MODES.SETTINGS)}>⚙️ Paramètres</button>
        )}
      </aside>
    </>
  );

  const HorseManagement = () => {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('🐎');
    const [owner, setOwner] = useState('');

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '2.5rem' }}>{h.emoji}</span>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{h.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Propriétaire: {h.owner}</div>
                  </div>
                </div>
                <button onClick={() => deleteHorse(h.id)} style={{ padding: '8px', background: 'rgba(244, 67, 54, 0.1)', border: 'none', color: 'var(--danger)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AssignmentView = () => {
    const [hId, setHId] = useState(horses[0]?.id || '');
    const [start, setStart] = useState(new Date().toISOString().split('T')[0]);
    const [end, setEnd] = useState(new Date().toISOString().split('T')[0]);
    const [loc, setLoc] = useState('pré');
    const [viewType, setViewType] = useState('all');

    const handleBulkAssign = (e) => {
      e.preventDefault();
      addAssignment({ horseId: Number(hId), startDate: start, endDate: end, status: loc });
      alert('Affectation enregistrée !');
    };

    return (
      <div className="animate-fade">
         <header style={{ marginBottom: '2rem' }}>
          <h1>Gestion des Affectations</h1>
          <p style={{ color: 'var(--text-muted)' }}>Plannifiez les mises au pré par plages de dates.</p>
        </header>

        <div className="card glass">
          <h4>Nouvelle affectation (Multi-jours)</h4>
          <form onSubmit={handleBulkAssign} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
               <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Cheval</label>
               <select className="input" value={hId} onChange={e => setHId(e.target.value)}>
                 {horses.slice().sort((a, b) => a.name.localeCompare(b.name)).map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
               </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
               <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Date de début</label>
               <input type="date" className="input" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
               <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Date de fin</label>
               <input type="date" className="input" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
               <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Destination</label>
               <select className="input" value={loc} onChange={e => setLoc(e.target.value)}>
                 <option value="pré">🌿 Mise au pré</option>
                 <option value="box">🏠 Mise au box</option>
               </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary">Enregistrer la période</button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h4>Affectations actives</h4>
          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', marginBottom: '1rem' }}>
            <button className={`btn ${viewType === 'all' ? 'btn-primary' : ''}`} onClick={() => setViewType('all')}>Toutes</button>
            <button className={`btn ${viewType === 'club' ? 'btn-primary' : ''}`} onClick={() => setViewType('club')}>Equidés du Club</button>
            <button className={`btn ${viewType === 'owner' ? 'btn-primary' : ''}`} onClick={() => setViewType('owner')}>Equidés Propriétaires</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assignments.filter(p => {
              const h = horses.find(h => h.id === p.horseId);
              if (!h) return false;
              if (viewType === 'club') return h.owner.toLowerCase() === 'club';
              if (viewType === 'owner') return h.owner.toLowerCase() !== 'club';
              return true;
            }).sort((a, b) => {
              const hA = horses.find(h => h.id === a.horseId);
              const hB = horses.find(h => h.id === b.horseId);
              return (hA?.name || "").localeCompare(hB?.name || "");
            }).map(p => {
              const h = horses.find(h => h.id === p.horseId);
              return h ? (
                <div key={p.id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                  <span>{h.emoji} <strong>{h.name}</strong> du {p.startDate} au {p.endDate}</span>
                  <span className={`badge ${p.status === 'pré' ? 'success' : 'info'}`}>{p.status}</span>
                  <button onClick={() => deleteAssignment(p.id)} style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--danger)' }}>🗑️</button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const [filterHorseId, setFilterHorseId] = useState('all');
    const daysInMonth = 30;

    const myHorses = user?.role === ROLES.PROPRIETAIRE 
      ? horses.filter(h => h.owner.toLowerCase() !== 'club')
      : horses;

    const myAssignments = user?.role === ROLES.PROPRIETAIRE 
      ? assignments.filter(a => myHorses.some(h => h.id === a.horseId)) 
      : assignments;

    return (
      <div className="animate-fade">
         <header style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Calendrier</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Visualisation globale des placements.</p>
          </div>
          <select className="input" style={{ width: '100%', maxWidth: '200px' }} value={filterHorseId} onChange={e => setFilterHorseId(e.target.value)}>
            <option value="all">Tous les chevaux</option>
            {myHorses.slice().sort((a, b) => a.name.localeCompare(b.name)).map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
          </select>
        </header>

        <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)' }}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} style={{ padding: '12px', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {[...Array(daysInMonth)].map((_, i) => {
              const dateStr = `2026-04-${String(i + 1).padStart(2, '0')}`;
              
              const filtered = filterHorseId === 'all' 
                ? myAssignments 
                : myAssignments.filter(a => String(a.horseId) === String(filterHorseId));
              
              const dayAssignments = filtered.filter(p => {
                const start = new Date(p.startDate);
                const end = new Date(p.endDate);
                const current = new Date(dateStr);
                return current >= start && current <= end;
              });
              
              return (
                <div key={i} style={{ minHeight: '120px', padding: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', opacity: i + 1 === 2 ? 1 : 0.4, color: i + 1 === 2 ? 'var(--accent)' : 'inherit' }}>{i + 1} Avr</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayAssignments.slice().sort((a, b) => {
                      const hA = horses.find(h => h.id === a.horseId);
                      const hB = horses.find(h => h.id === b.horseId);
                      return (hA?.name || "").localeCompare(hB?.name || "");
                    }).map(a => {
                      const h = horses.find(h => h.id === a.horseId);
                      return h ? (
                        <div key={a.id} style={{ 
                          fontSize: '0.65rem', 
                          padding: '4px 6px', 
                          borderRadius: '4px', 
                          background: h.color || (a.status === 'pré' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(139, 107, 97, 0.4)'), 
                          color: '#fff', 
                          border: '1px solid rgba(255,255,255,0.4)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                        }}>
                          <span>{h.emoji}</span> <strong>{h.name}</strong>
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
    );
  };

  const LoginView = () => (
    <div className="flex-center animate-fade" style={{ minHeight: '80vh' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>HorsePlanner</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Gérez votre club avec élégance.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isGerantSelected ? (
            <>
              <button className="btn btn-primary" onClick={() => setIsGerantSelected(true)}>Connexion Gérant</button>
              <button className="btn btn-accent" onClick={() => login(ROLES.PROPRIETAIRE, 'Dupont')}>Espace Propriétaire</button>
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

  const Navbar = () => (
    <nav className="navbar glass">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="btn menu-toggle" style={{ background: 'transparent', padding: '5px', fontSize: '1.2rem', color: '#fff' }} onClick={() => setIsSidebarOpen(true)}>☰</button>
        <span style={{ fontSize: '1.5rem' }} className="hide-mobile">🐎</span>
        <h2 className="gradient-text">HorsePlanner</h2>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user?.role === ROLES.GERANT && !user?.isDemo && (
          !isDriveConnected ? (
            <button onClick={handleConnectDrive} className="btn" style={{ fontSize: '0.8rem', background: 'rgba(66, 133, 244, 0.1)', color: '#4285F4', border: '1px solid #4285F4' }}>☁️ Connecter Drive</button>
          ) : (
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span>✅ Cloud Sync On</span>
              {lastSync && <span>Dernière synchro: {lastSync}</span>}
            </div>
          )
        )}
        <span className="hide-mobile" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user?.role === ROLES.GERANT ? (user?.isDemo ? '🛡️ Démo' : '🛡️ Admin') : '👤 Propriétaire'}</span>
        <button onClick={logout} className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(244, 67, 54, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>Déconnexion</button>
      </div>
    </nav>
  );

  const Dashboard = () => {
    const today = new Date().toISOString().split('T')[0];
    const isManager = user?.role === ROLES.GERANT;

    const myHorses = user?.role === ROLES.PROPRIETAIRE 
      ? horses.filter(h => h.owner.toLowerCase() !== 'club')
      : horses;

    const todayAssignments = assignments.filter(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const current = new Date(today);
      return current >= start && current <= end;
    });

    const renderManagerDashboard = () => (
      <div className="grid">
        <div className="card glass" style={{ borderLeft: '4px solid var(--success)' }}>
          <h3>☀️ Matin - Départ au pré</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mouvements prévus ce matin.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
             {todayAssignments.filter(a => a.startDate === today && a.status === 'pré').sort((a, b) => {
              const hA = horses.find(h => h.id === a.horseId);
              const hB = horses.find(h => h.id === b.horseId);
              return (hA?.name || "").localeCompare(hB?.name || "");
            }).map(a => {
              const h = horses.find(h => h.id === a.horseId);
              return h ? (
                <div key={a.id} className="glass" style={{ padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{h.emoji}</span> <strong>{h.name}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--success)', marginLeft: 'auto' }}>🌿 Sortie</span>
                </div>
              ) : null;
            })}
            {todayAssignments.filter(a => a.startDate === today && a.status === 'pré').length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Aucun départ.</p>}
          </div>
        </div>
        <div className="card glass" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h3>🌑 Soir - Retour box</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mouvements prévus ce soir.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
             {todayAssignments.filter(a => a.endDate === today && a.status === 'pré').sort((a, b) => {
              const hA = horses.find(h => h.id === a.horseId);
              const hB = horses.find(h => h.id === b.horseId);
              return (hA?.name || "").localeCompare(hB?.name || "");
            }).map(a => {
              const h = horses.find(h => h.id === a.horseId);
              return h ? (
                <div key={a.id} className="glass" style={{ padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{h.emoji}</span> <strong>{h.name}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--warning)', marginLeft: 'auto' }}>🏠 Rentrer</span>
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
        <div className="grid">
          <div className="card glass">
            <h3 style={{ color: 'var(--success)' }}>🌿 Chevaux Propriétaires (au Pré)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
               {atPasture.sort((a, b) => a.horse.name.localeCompare(b.horse.name)).map(({horse: h, assignment: a}) => {
                const days = Math.ceil((new Date(a.endDate) - new Date(a.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <div key={h.id} className="horse-item glass" style={{ borderLeft: `4px solid ${h.color || 'var(--primary)'}`, cursor: 'pointer' }} onClick={() => alert(`Au pré du ${a.startDate} au ${a.endDate} (${days} jours)`)}>
                    <span style={{ fontSize: '1.2rem' }}>{h.emoji}</span>
                    <span style={{ fontWeight: '600' }}>{h.name}</span>
                    <span style={{ fontSize: '0.7rem', marginLeft: 'auto', opacity: 0.7 }}>📍 Actuellement au pré ({days}j)</span>
                  </div>
                );
              })}
              {atPasture.length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Aucun cheval au pré.</p>}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="animate-fade">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Bonjour {isManager ? 'Daniel' : user?.name} 👋</h1>
            <p style={{ color: 'var(--text-muted)' }}>{isManager ? 'Tableau de bord du club' : 'Emplacement actuel des chevaux propriétaires'}.</p>
          </div>
        </header>

        {isManager ? renderManagerDashboard() : renderOwnerDashboard()}
      </div>
    );
  };

  const SettingsView = () => (
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
            {lastSync && <div style={{ fontSize: '0.7rem', marginTop: '10px', textAlign: 'right', opacity: 0.7 }}>Dernière synchro : {lastSync}</div>}
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

  return (
    <div style={{ background: '#121212', minHeight: '100vh', color: '#fff' }}>
      {mode === APP_MODES.LOGIN ? <LoginView /> : (
        <div style={{ display: 'flex', width: '100%' }}>
          <Sidebar />
          <main className="main-content container">
            <Navbar />
            <div>
              {mode === APP_MODES.DASHBOARD && <Dashboard />}
              {mode === APP_MODES.HORSES && <HorseManagement />}
              {mode === APP_MODES.ASSIGNMENTS && <AssignmentView />}
              {mode === APP_MODES.CALENDAR && <CalendarView />}
              {mode === APP_MODES.SETTINGS && <SettingsView />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
