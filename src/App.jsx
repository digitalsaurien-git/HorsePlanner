import React, { useState, useEffect } from 'react';
import './index.css';

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
  MY_HORSES: 'my_horses'
};

const INITIAL_HORSES = [
  { id: 1, name: 'Storm', emoji: '⚡', owner: 'Dupont', color: '#B08D57', status: 'pré' },
  { id: 2, name: 'Spirit', emoji: '👻', owner: 'Martin', color: '#D2B48C', status: 'box' },
  { id: 3, name: 'Blacky', emoji: '🖤', owner: 'Robert', color: '#333333', status: 'pré' },
  { id: 4, name: 'Bella', emoji: '🌸', owner: 'Dupont', color: '#F0EAD6', status: 'box' },
];

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState(APP_MODES.LOGIN);
  const [horses, setHorses] = useState(INITIAL_HORSES);
  const [plannings, setPlannings] = useState([]); // Array of assignments: { horseId, date, period, location }

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
    if (savedPlannings) setPlannings(JSON.parse(savedPlannings));
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('hp_horses', JSON.stringify(horses));
    localStorage.setItem('hp_plannings', JSON.stringify(plannings));
  }, [horses, plannings]);

  const login = (role, email = '') => {
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
        <button className={`btn ${mode === APP_MODES.HORSES ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.HORSES)}>🐴 Chevaux</button>
      )}
      <button className={`btn ${mode === APP_MODES.CALENDAR ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.CALENDAR)}>📅 Calendrier</button>
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
            <input className="input" placeholder="Nom" value={name} onChange={e => setName(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--bg-glass)', color: '#fff' }} />
            <input className="input" placeholder="Émoticône" value={emoji} onChange={e => setEmoji(e.target.value)} style={{ width: '60px', padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--bg-glass)', color: '#fff', textAlign: 'center' }} />
            <input className="input" placeholder="Propriétaire" value={owner} onChange={e => setOwner(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--bg-glass)', color: '#fff' }} />
            <button className="btn btn-accent">Ajouter</button>
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {horses.map(h => (
            <div key={h.id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '2rem' }}>{h.emoji}</span>
                <div>
                  <strong>{h.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prop: {h.owner}</div>
                </div>
              </div>
              <button onClick={() => deleteHorse(h.id)} style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const [assignHorseId, setAssignHorseId] = useState(horses[0]?.id || '');
    const [assignDate, setAssignDate] = useState(new Date().toISOString().split('T')[0]);
    const [assignStatus, setAssignStatus] = useState('pré');
    const daysInMonth = 30;

    const handleAssign = () => {
      addAssignment({ horseId: Number(assignHorseId), date: assignDate, status: assignStatus });
      // Update horse status for immediate effect in this demo
      updateHorseStatus(Number(assignHorseId), assignStatus);
      alert('Placement enregistré !');
    };

    return (
      <div className="animate-fade">
         <header style={{ marginBottom: '2rem' }}>
          <h1>Calendrier Planning</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visualisez et organisez les placements.</p>
        </header>

        <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)' }}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} style={{ padding: '12px', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {[...Array(daysInMonth)].map((_, i) => {
              const dateStr = `2026-04-${String(i + 1).padStart(2, '0')}`;
              const dayAssignments = plannings.filter(p => p.date === dateStr);
              
              return (
                <div key={i} style={{ minHeight: '120px', padding: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', opacity: i + 1 === 2 ? 1 : 0.4, color: i + 1 === 2 ? 'var(--accent)' : 'inherit' }}>{i + 1} Avr</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayAssignments.map(a => {
                      const h = horses.find(h => h.id === a.horseId);
                      return h ? (
                        <div key={a.id} style={{ fontSize: '0.65rem', padding: '2px 5px', borderRadius: '4px', background: a.status === 'pré' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(139, 107, 97, 0.2)', color: a.status === 'pré' ? '#81c784' : '#d7ccc8', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {h.emoji} {h.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {user?.role === ROLES.GERANT && (
          <div className="card glass" style={{ marginTop: '2rem' }}>
            <h4>🛡️ Attribuer un placement</h4>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
               <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Cheval</label>
                 <select className="input" value={assignHorseId} onChange={e => setAssignHorseId(e.target.value)}>
                   {horses.map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
                 </select>
               </div>
               <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Date</label>
                 <input type="date" className="input" value={assignDate} onChange={e => setAssignDate(e.target.value)} />
               </div>
               <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Lieu</label>
                 <select className="input" value={assignStatus} onChange={e => setAssignStatus(e.target.value)}>
                   <option value="pré">🌿 Mise au pré</option>
                   <option value="box">🏠 Mise au box</option>
                 </select>
               </div>
               <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                 <button className="btn btn-primary" onClick={handleAssign}>Enregistrer</button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const LoginView = () => (
    <div className="flex-center animate-fade" style={{ minHeight: '80vh' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>HorsePlanner</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Gérez votre club avec élégance.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => login(ROLES.GERANT)}>Connexion Gérant</button>
          <button className="btn btn-accent" onClick={() => login(ROLES.PROPRIETAIRE)}>Espace Propriétaire</button>
        </div>
      </div>
    </div>
  );

  const Navbar = () => (
    <nav className="navbar glass" style={{ position: 'sticky', top: 0, width: '100%', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>🐎</span>
        <h2 className="gradient-text">HorsePlanner</h2>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user?.role === ROLES.GERANT ? '🛡️ Admin' : '👤 Propriétaire'}</span>
        <button onClick={logout} className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(244, 67, 54, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>Déconnexion</button>
      </div>
    </nav>
  );

  const Dashboard = () => {
    const today = new Date().toISOString().split('T')[0];
    const myHorses = user?.role === ROLES.PROPRIETAIRE 
      ? horses.filter(h => h.owner.toLowerCase() === user.email.split('@')[0].toLowerCase() || h.owner === 'Dupont') // Mock filtering
      : horses;

    const todayAssignments = plannings.filter(p => p.date === today);
    
    return (
      <div className="animate-fade">
        <header style={{ marginBottom: '2rem' }}>
          <h1>Bonjour, {user?.role === ROLES.GERANT ? 'Gérant' : 'Propriétaire'} 👋</h1>
          <p style={{ color: 'var(--text-muted)' }}>Bienvenue sur votre espace de gestion.</p>
        </header>

        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          
          <div className="card glass">
            <h3>📈 Chevaux du jour ({myHorses.length})</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Statut actuel des pensionnaires.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myHorses.map(h => (
                <div key={h.id} className="glass" style={{ padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <span style={{ fontSize: '1.5rem' }}>{h.emoji}</span>
                     <div>
                       <div style={{ fontWeight: '600' }}>{h.name}</div>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.owner}</div>
                     </div>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                     <span className={`badge ${h.status === 'pré' ? 'success' : 'info'}`}>
                       {h.status === 'pré' ? '🌿 Au Pré' : '🏠 Au Box'}
                     </span>
                     {todayAssignments.find(p => p.horseId === h.id) && (
                       <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>⚠️ Déplacement prévu</span>
                     )}
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3>📅 Planning Semaine</h3>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[0, 1, 2].map(i => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  return (
                    <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ width: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent)' }}>{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                        <div style={{ fontWeight: '700' }}>{d.getDate()}</div>
                      </div>
                      <div style={{ flex: 1, padding: '10px', height: '40px', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button className="btn btn-accent" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setMode(APP_MODES.CALENDAR)}>Voir planning complet</button>
          </div>

        </div>
      </div>
    );
  };

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
              {mode === APP_MODES.CALENDAR && <CalendarView />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
