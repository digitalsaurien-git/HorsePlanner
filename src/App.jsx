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
  { id: 2, name: 'Cliff', emoji: '🐴', owner: 'Martin', color: '#b08d57', status: 'pré' },
  { id: 3, name: 'Cloony', emoji: '🍀', owner: 'Robert', color: '#4caf50', status: 'pré' },
  { id: 4, name: 'Conquérant', emoji: '🦓', owner: 'Dupont', color: '#333333', status: 'pré' },
  { id: 5, name: 'Lipton', emoji: '🐰', owner: 'Martin', color: '#90caf9', status: 'pré' },
  { id: 6, name: 'Kiss', emoji: '💋', owner: 'Robert', color: '#f44336', status: 'box' },
  { id: 7, name: 'Jimmy', emoji: '🐎', owner: 'Dupont', color: '#a1887f', status: 'box' },
  { id: 8, name: 'Foudre', emoji: '⚡', owner: 'Martin', color: '#ffd54f', status: 'box' },
  { id: 9, name: 'Juariste', emoji: '🎍', owner: 'Robert', color: '#81c784', status: 'box' },
  { id: 10, name: 'Gringo', emoji: '🤠', owner: 'Dupont', color: '#795548', status: 'box' },
  { id: 11, name: 'Joliette', emoji: '🦄', owner: 'Martin', color: '#ce93d8', status: 'box' },
  { id: 12, name: 'Goria', emoji: '🦄', owner: 'Robert', color: '#ba68c8', status: 'box' },
  { id: 13, name: 'Little', emoji: '🐎', owner: 'Dupont', color: '#e0e0e0', status: 'box' },
  { id: 14, name: 'Eiddy', emoji: '🌷', owner: 'Martin', color: '#f06292', status: 'box' },
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
  const [plannings, setPlannings] = useState([]); // Array of assignments: { horseId, date, period, location }
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncPath, setSyncPath] = useState('DigitalSaurien/AUTOMATE/HorsePlanner');
  const [passwordInput, setPasswordInput] = useState('');
  const [masterPassword, setMasterPassword] = useState('bucephal91$ADM');
  const [isGerantSelected, setIsGerantSelected] = useState(false);

  // Initialize Drive
  useEffect(() => {
    initGoogleDrive().then(() => {
      console.log("☁️ Drive Ready");
    });
  }, []);

  // Load from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('hp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setMode(APP_MODES.DASHBOARD);
    }
    const savedHorses = localStorage.getItem('hp_horses');
    if (savedHorses) setHorses(JSON.parse(savedHorses));
    
    const savedPlannings = localStorage.getItem('hp_plannings');
    if (savedPlannings) {
      setPlannings(JSON.parse(savedPlannings));
    } else {
      setPlannings(INITIAL_PLANNINGS);
    }
    const savedPath = localStorage.getItem('hp_sync_path');
    if (savedPath) setSyncPath(savedPath);
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('hp_horses', JSON.stringify(horses));
    localStorage.setItem('hp_plannings', JSON.stringify(plannings));
    localStorage.setItem('hp_sync_path', syncPath);
    localStorage.setItem('hp_master_password', masterPassword);
    
    // Auto-sync to Drive if connected
    if (isDriveConnected) {
      saveToDrive({ horses, plannings, masterPassword }, syncPath).then(success => {
        if (success) setLastSync(new Date().toLocaleTimeString());
      });
    }
  }, [horses, plannings, isDriveConnected, syncPath, masterPassword]);

  const handleConnectDrive = async () => {
    try {
      await authenticateGoogle();
      setIsDriveConnected(true);
      const cloudData = await loadFromDrive(syncPath);
      if (cloudData) {
        if (confirm("Données cloud détectées. Voulez-vous écraser les données locales par la version Cloud ?")) {
          setHorses(cloudData.horses);
          setPlannings(cloudData.plannings);
          if (cloudData.masterPassword) setMasterPassword(cloudData.masterPassword);
        }
      }
      alert("✅ Connecté à Google Drive !");
    } catch (err) {
      console.error("Auth Fail:", err);
    }
  };

  const login = (role, email = '') => {
    if (role === ROLES.GERANT && passwordInput !== masterPassword) {
      alert('Mot de passe incorrect pour Bucéphale ! 🛑');
      return;
    }
    const newUser = { role, email: email || (role === ROLES.GERANT ? 'admin@club.com' : 'user@club.com') };
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
  const updateHorseStatus = (id, status) => {
    setHorses(horses.map(h => h.id === id ? { ...h, status } : h));
  };

  const addAssignment = (assignment) => {
    setPlannings([...plannings, { ...assignment, id: Date.now() }]);
  };

  const deleteAssignment = (id) => setPlannings(plannings.filter(p => p.id !== id));

  // --- Components ---

  const Sidebar = () => (
    <aside className="glass" style={{ width: '250px', height: '100vh', position: 'fixed', left: 0, top: 0, paddingTop: '100px', display: 'flex', flexDirection: 'column', gap: '5px', padding: '100px 10px 10px 10px' }}>
      <button className={`btn ${mode === APP_MODES.DASHBOARD ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.DASHBOARD)}>🏠 Dashboard</button>
      {user?.role === ROLES.GERANT && (
        <>
          <button className={`btn ${mode === APP_MODES.HORSES ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.HORSES)}>🐴 Chevaux</button>
          <button className={`btn ${mode === APP_MODES.ASSIGNMENTS ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.ASSIGNMENTS)}>🗓️ Affectations</button>
        </>
      )}
      <button className={`btn ${mode === APP_MODES.CALENDAR ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.CALENDAR)}>📅 Calendrier</button>
      {user?.role === ROLES.GERANT && (
        <button className={`btn ${mode === APP_MODES.SETTINGS ? 'btn-primary' : ''}`} style={{ justifyContent: 'start', marginTop: 'auto' }} onClick={() => setMode(APP_MODES.SETTINGS)}>⚙️ Paramètres</button>
      )}
    </aside>
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
            {horses.map(h => (
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
                 {horses.map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
            {plannings.map(p => {
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
      ? horses.filter(h => h.owner.toLowerCase() === user.email.split('@')[0].toLowerCase() || h.owner === 'Dupont')
      : horses;

    return (
      <div className="animate-fade">
         <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Calendrier Planning</h1>
            <p style={{ color: 'var(--text-muted)' }}>Visualisation globale des placements.</p>
          </div>
          <select className="input" style={{ width: 'auto' }} value={filterHorseId} onChange={e => setFilterHorseId(e.target.value)}>
            <option value="all">Tous les chevaux</option>
            {myHorses.map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
          </select>
        </header>

        <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)' }}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} style={{ padding: '12px', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {[...Array(daysInMonth)].map((_, i) => {
              const dateStr = `2026-04-${String(i + 1).padStart(2, '0')}`;
              
              // Find assignments that cover this date
              const dayAssignments = plannings.filter(p => {
                const start = new Date(p.startDate);
                const end = new Date(p.endDate);
                const current = new Date(dateStr);
                return current >= start && current <= end;
              }).filter(p => filterHorseId === 'all' || p.horseId === Number(filterHorseId));
              
              return (
                <div key={i} style={{ minHeight: '120px', padding: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', opacity: i + 1 === 2 ? 1 : 0.4, color: i + 1 === 2 ? 'var(--accent)' : 'inherit' }}>{i + 1} Avr</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayAssignments.map(a => {
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
              <button className="btn btn-accent" onClick={() => login(ROLES.PROPRIETAIRE)}>Espace Propriétaire</button>
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
    <nav className="navbar glass" style={{ position: 'sticky', top: 0, width: '100%', marginBottom: '2rem', zIndex: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>🐎</span>
        <h2 className="gradient-text">HorsePlanner</h2>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {!isDriveConnected ? (
          <button onClick={handleConnectDrive} className="btn" style={{ fontSize: '0.8rem', background: 'rgba(66, 133, 244, 0.1)', color: '#4285F4', border: '1px solid #4285F4' }}>☁️ Connecter Drive</button>
        ) : (
          <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span>✅ Cloud Sync On</span>
            {lastSync && <span>Dernière synchro: {lastSync}</span>}
          </div>
        )}
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user?.role === ROLES.GERANT ? '🛡️ Admin' : '👤 Propriétaire'}</span>
        <button onClick={logout} className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(244, 67, 54, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>Déconnexion</button>
      </div>
    </nav>
  );

  const Dashboard = () => {
    const today = new Date().toISOString().split('T')[0];
    const myHorses = user?.role === ROLES.PROPRIETAIRE 
      ? horses.filter(h => h.owner.toLowerCase() === user?.email?.split('@')[0].toLowerCase() || h.owner === 'Dupont')
      : horses;

    const todayAssignments = plannings.filter(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const current = new Date(today);
      return current >= start && current <= end;
    });

    const isOwner = user?.role === ROLES.PROPRIETAIRE;
    
    return (
      <div className="animate-fade">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Bonjour {user?.role === ROLES.GERANT ? 'Daniel' : 'Propriétaire'} 👋</h1>
            <p style={{ color: 'var(--text-muted)' }}>Bienvenue sur votre espace de gestion.</p>
          </div>
          {isOwner && (
            <div className="card glass" style={{ padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                 <span style={{ fontSize: '0.8rem' }}>Modifier l'icône :</span>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   {HORSE_ICONS.slice(0, 7).map(icon => (
                     <button key={icon} onClick={() => setHorses(horses.map(h => (h.owner.toLowerCase() === user?.email?.split('@')[0].toLowerCase() || h.owner === 'Dupont') ? { ...h, emoji: icon } : h))} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', transition: 'transform 0.2s' }}>{icon}</button>
                   ))}
                 </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                 <span style={{ fontSize: '0.8rem' }}>Couleur du cheval :</span>
                 <input type="color" value={myHorses[0]?.color || '#B08D57'} onChange={(e) => setHorses(horses.map(h => (h.owner.toLowerCase() === user?.email?.split('@')[0].toLowerCase() || h.owner === 'Dupont') ? { ...h, color: e.target.value } : h))} style={{ border: 'none', background: 'none', cursor: 'pointer' }} />
               </div>
            </div>
          )}
        </header>

        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          
          <div className="card glass">
            <h3>☀️ Matin - Départ au pré</h3>
            <p style={{ fontSize: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Chevaux commençant leur séjour aujourd'hui.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {todayAssignments.filter(a => a.startDate === today && a.status === 'pré').map(a => {
                const h = horses.find(h => h.id === a.horseId);
                return h ? (
                  <div key={a.id} className="glass" style={{ padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: `4px solid ${h.color || 'var(--success)'}` }}>
                    <span style={{ fontSize: '1.2rem' }}>{h.emoji}</span>
                    <strong>{h.name}</strong>
                    <span style={{ fontSize: '0.7rem', marginLeft: 'auto', color: 'var(--success)' }}>🌿 Sortie</span>
                  </div>
                ) : null;
              })}
              {todayAssignments.filter(a => a.startDate === today && a.status === 'pré').length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucun départ prévu ce matin.</p>}
            </div>
          </div>

          <div className="card glass">
            <h3>🌑 Soir - Retour box</h3>
            <p style={{ fontSize: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Chevaux terminant leur séjour aujourd'hui.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {todayAssignments.filter(a => a.endDate === today && a.status === 'pré').map(a => {
                const h = horses.find(h => h.id === a.horseId);
                return h ? (
                  <div key={a.id} className="glass" style={{ padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: `4px solid ${h.color || 'var(--warning)'}` }}>
                    <span style={{ fontSize: '1.2rem' }}>{h.emoji}</span>
                    <strong>{h.name}</strong>
                    <span style={{ fontSize: '0.7rem', marginLeft: 'auto', color: 'var(--warning)' }}>🏠 Rentrer</span>
                  </div>
                ) : null;
              })}
              {todayAssignments.filter(a => a.endDate === today && a.status === 'pré').length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucun retour prévu ce soir.</p>}
            </div>
          </div>

          {isOwner && (
            <div className="card glass" style={{ gridColumn: '1 / -1' }}>
              <h3>🐴 Mes Chevaux ({myHorses.length})</h3>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '10px' }}>
                {myHorses.map(h => (
                  <div key={h.id} className="glass" style={{ padding: '15px', borderRadius: '12px', minWidth: '150px', textAlign: 'center' }}>
                     <div style={{ fontSize: '2rem', marginBottom: '5px' }}>{h.emoji}</div>
                     <strong>{h.name}</strong>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.status === 'pré' ? '🌿 Au Pré' : '🏠 Au Box'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Réseau / Dossier Drive</label>
            <input 
              className="input" 
              value={syncPath} 
              onChange={e => setSyncPath(e.target.value)} 
              placeholder="ex: DigitalSaurien/AUTOMATE/HorsePlanner"
              style={{ width: '100%', padding: '12px', background: 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
            />
          </div>
          
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(66, 133, 244, 0.3)' }}>
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
    </div>
  );

  return (
    <div style={{ background: '#121212', minHeight: '100vh', color: '#fff' }}>
      {mode === APP_MODES.LOGIN ? <LoginView /> : (
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main className="main-content container" style={{ marginLeft: '250px', width: 'calc(100% - 250px)', marginTop: 0 }}>
            <Navbar />
            <div style={{ padding: '0 1rem' }}>
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
