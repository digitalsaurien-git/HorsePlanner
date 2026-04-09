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
  { id: 2, name: 'Cliff', emoji: '🐴', owner: 'Club', color: '#b08d57', status: 'box' },
  { id: 3, name: 'Cloony', emoji: '🍀', owner: 'Club', color: '#4caf50', status: 'box' },
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
  { id: 15, name: 'Fakir', emoji: '🐹', owner: 'Club', color: '#ff8a65', status: 'box' },
  { id: 16, name: 'Towingo', emoji: '🐅', owner: 'Club', color: '#9575cd', status: 'box' },
  { id: 17, name: 'Gemini', emoji: '👯', owner: 'Club', color: '#4fc3f7', status: 'box' },
  { id: 18, name: 'Bally', emoji: '🏐', owner: 'Club', color: '#aed581', status: 'box' },
  { id: 19, name: 'Elégante', emoji: '🦒', owner: 'Club', color: '#ffd54f', status: 'box' },
  { id: 20, name: 'Haker', emoji: '🕶️', owner: 'Club', color: '#90a4ae', status: 'box' },
];

const INITIAL_PLANNINGS = [
  // Fevrier 2026
  { id: 1001, horseId: 3, startDate: '2026-02-01', endDate: '2026-02-01', status: 'pré' },
  { id: 1002, horseId: 12, startDate: '2026-02-01', endDate: '2026-02-01', status: 'pré' },
  { id: 1003, horseId: 5, startDate: '2026-02-01', endDate: '2026-02-01', status: 'pré' },
  { id: 1004, horseId: 13, startDate: '2026-02-01', endDate: '2026-02-01', status: 'pré' },
  
  // Mars 2026
  { id: 2001, horseId: 6, startDate: '2026-03-02', endDate: '2026-03-05', status: 'pré' },
  { id: 2002, horseId: 2, startDate: '2026-03-02', endDate: '2026-03-02', status: 'pré' },
  { id: 2003, horseId: 17, startDate: '2026-03-02', endDate: '2026-03-02', status: 'pré' },
  { id: 2004, horseId: 3, startDate: '2026-03-02', endDate: '2026-03-02', status: 'pré' },
  { id: 2005, horseId: 4, startDate: '2026-03-02', endDate: '2026-03-10', status: 'pré' },
  { id: 2006, horseId: 10, startDate: '2026-03-02', endDate: '2026-03-02', status: 'pré' },
  { id: 2007, horseId: 8, startDate: '2026-03-02', endDate: '2026-03-02', status: 'pré' },
  { id: 2008, horseId: 11, startDate: '2026-03-02', endDate: '2026-03-02', status: 'pré' },
  
  // Avril 2026
  { id: 3001, horseId: 2, startDate: '2026-04-01', endDate: '2026-04-04', status: 'pré' },
  { id: 3002, horseId: 4, startDate: '2026-04-01', endDate: '2026-04-05', status: 'pré' },
  { id: 3003, horseId: 6, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré' },
  
  // Mai 2026 (simplified for brevity)
  { id: 4001, horseId: 10, startDate: '2026-05-01', endDate: '2026-05-05', status: 'pré' },
];

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
      if (assignData) {
        const mapped = assignData.map(a => ({
          id: a.id,
          horseId: Number(a.horse_id),
          startDate: a.start_date,
          endDate: a.end_date,
          status: a.status,
          period: a.period
        }));
        setAssignments(mapped);
      }
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
      if (savedHorses && JSON.parse(savedHorses).length > 0) setHorses(JSON.parse(savedHorses));
      else setHorses(INITIAL_HORSES);

      const savedClientId = localStorage.getItem('hp_client_id');
      if (savedClientId) setClientId(savedClientId);

      const savedAssignments = localStorage.getItem('horsePlanner_assignments_v1.1');
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
    localStorage.setItem('horsePlanner_horses_v1.2', JSON.stringify(horses));
    localStorage.setItem('horsePlanner_assignments_v1.2', JSON.stringify(assignments));
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

  // --- Components ---

  const Sidebar = () => (
    <>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className={`btn ${mode === APP_MODES.DASHBOARD ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.DASHBOARD)}>🏠 Dashboard</button>
        {user?.role === ROLES.GERANT && (
          <button className={`btn ${mode === APP_MODES.HORSES ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.HORSES)}>🐴 Chevaux</button>
        )}
        <button className={`btn ${mode === APP_MODES.ASSIGNMENTS ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.ASSIGNMENTS)}>🗓️ Affectations</button>
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
                      <input className="input" value={editName} onChange={e => setEditName(e.target.value)} style={{ flex: 1 }} />
                    </div>
                    <input className="input" value={editOwner} onChange={e => setEditOwner(e.target.value)} placeholder="Propriétaire" />
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                      <button className="btn btn-success" style={{ flex: 1, padding: '5px', fontSize: '0.8rem' }} onClick={() => saveEdit(h.id)}>Valider</button>
                      <button className="btn" style={{ flex: 1, padding: '5px', fontSize: '0.8rem' }} onClick={() => setEditingHorseId(null)}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '2.5rem' }}>{h.emoji}</span>
                      <div>
                        <strong style={{ fontSize: '1.1rem' }}>{h.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Propriétaire: {h.owner}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => startEditing(h)} style={{ padding: '8px', background: 'rgba(66, 133, 244, 0.1)', border: 'none', color: 'var(--accent)', borderRadius: '50%', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => deleteHorse(h.id)} style={{ padding: '8px', background: 'rgba(244, 67, 54, 0.1)', border: 'none', color: 'var(--danger)', borderRadius: '50%', cursor: 'pointer' }}>🗑️</button>
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

  const AssignmentView = () => {
    const isOwner = user?.role === ROLES.PROPRIETAIRE;
    const myHorses = isOwner ? horses.filter(h => h.owner.toLowerCase() !== 'club') : horses;
    
    const [hId, setHId] = useState(myHorses[0]?.id || '');
    const [start, setStart] = useState(new Date().toISOString().split('T')[0]);
    const [end, setEnd] = useState(new Date().toISOString().split('T')[0]);
    const [loc, setLoc] = useState('pré');
    const [period, setPeriod] = useState('journée');
    const [viewType, setViewType] = useState('all');

    useEffect(() => {
      if (myHorses.length > 0 && !hId) setHId(myHorses[0].id);
    }, [myHorses]);

    const handleBulkAssign = (e) => {
      e.preventDefault();
      addAssignment({ horseId: Number(hId), startDate: start, endDate: end, status: loc, period });
      alert('Affectation enregistrée !');
    };

    const todayStr = new Date().toISOString().split('T')[0];
    
    const filteredAssignments = assignments.filter(p => {
      const h = horses.find(h => h.id === p.horseId);
      if (!h) return false;
      if (isOwner) return h.owner.toLowerCase() !== 'club';
      if (viewType === 'club') return h.owner.toLowerCase() === 'club';
      if (viewType === 'owner') return h.owner.toLowerCase() !== 'club';
      return true;
    }).sort((a, b) => {
      const hA = horses.find(h => h.id === a.horseId);
      const hB = horses.find(h => h.id === b.horseId);
      return (hA?.name || "").localeCompare(hB?.name || "");
    });

    const activeAssignments = filteredAssignments.filter(p => p.endDate >= todayStr);
    const pastAssignments = filteredAssignments.filter(p => p.endDate < todayStr);

    // Group past by month
    const groupedPast = pastAssignments.reduce((acc, p) => {
      const date = new Date(p.endDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(p);
      return acc;
    }, {});

    const sortedMonthKeys = Object.keys(groupedPast).sort().reverse();

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

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
                 {myHorses.slice().sort((a, b) => a.name.localeCompare(b.name)).map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
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
            <div style={{ flex: 1, minWidth: '150px' }}>
               <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Période</label>
               <select className="input" value={period} onChange={e => setPeriod(e.target.value)}>
                 <option value="journée">Journée entière</option>
                 <option value="matin">Matin</option>
                 <option value="après-midi">Après-midi</option>
               </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary">Enregistrer la période</button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h4>Affectations actives et à venir</h4>
          {!isOwner && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', marginBottom: '1rem' }}>
              <button className={`btn ${viewType === 'all' ? 'btn-primary' : ''}`} onClick={() => setViewType('all')}>Toutes</button>
              <button className={`btn ${viewType === 'club' ? 'btn-primary' : ''}`} onClick={() => setViewType('club')}>Equidés du Club</button>
              <button className={`btn ${viewType === 'owner' ? 'btn-primary' : ''}`} onClick={() => setViewType('owner')}>Equidés Propriétaires</button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: isOwner ? '1rem' : '0' }}>
            {activeAssignments.map(p => {
              const h = horses.find(h => h.id === p.horseId);
              return h ? (
                <div key={p.id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', alignItems: 'center' }}>
                  <span>{h.emoji} <strong>{h.name}</strong> du {formatDate(p.startDate)} au {formatDate(p.endDate)}</span>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className={`badge ${p.status === 'pré' ? 'success' : 'info'}`} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      {p.status} 
                      {user?.role === ROLES.GERANT ? (
                        <select value={p.period || 'journée'} onChange={(e) => updateAssignmentPeriod(p.id, e.target.value)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit', fontSize: 'inherit', borderRadius: '4px', cursor: 'pointer' }}>
                          <option value="journée" style={{ color: '#000', background: '#fff' }}>Journée</option>
                          <option value="matin" style={{ color: '#000', background: '#fff' }}>Matin</option>
                          <option value="après-midi" style={{ color: '#000', background: '#fff' }}>Après-midi</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                          ({p.period === 'matin' ? 'Matin' : p.period === 'après-midi' ? 'Après-midi' : 'Journée'})
                        </span>
                      )}
                    </span>
                    {user?.role === ROLES.GERANT && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <div style={{ position: 'relative' }}>
                          <button onClick={() => {
                            const container = document.getElementById(`edit-${p.id}`);
                            container.style.display = container.style.display === 'none' ? 'flex' : 'none';
                          }} style={{ padding: '0px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✏️</button>
                          <div id={`edit-${p.id}`} className="glass" style={{ display: 'none', position: 'absolute', top: '100%', right: 0, zIndex: 10, padding: '15px', borderRadius: '12px', flexDirection: 'column', gap: '8px', minWidth: '220px', background: '#ffffff', border: '2px solid var(--accent)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                            <label style={{ fontSize: '0.8rem', color: '#333', fontWeight: 'bold' }}>📅 Date de début :</label>
                            <input type="date" value={p.startDate} onChange={(e) => updateAssignmentDates(p.id, e.target.value, p.endDate)} className="input" style={{ padding: '8px', color: '#000', border: '1px solid #ccc', background: '#f5f5f5' }} />
                            <label style={{ fontSize: '0.8rem', color: '#333', fontWeight: 'bold', marginTop: '5px' }}>📅 Date de fin :</label>
                            <input type="date" value={p.endDate} onChange={(e) => updateAssignmentDates(p.id, p.startDate, e.target.value)} className="input" style={{ padding: '8px', color: '#000', border: '1px solid #ccc', background: '#f5f5f5' }} />
                            <button onClick={() => document.getElementById(`edit-${p.id}`).style.display = 'none'} className="btn btn-primary" style={{ width: '100%', marginTop: '10px', fontSize: '0.8rem', padding: '5px' }}>Fermer</button>
                          </div>
                        </div>
                        <button onClick={() => deleteAssignment(p.id)} style={{ padding: '0px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null;
            })}
            {activeAssignments.length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Aucune affectation active.</p>}
          </div>
        </div>

        {pastAssignments.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>📂 Archives (Affectations passées)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '1rem' }}>
              {sortedMonthKeys.map(key => {
                const [year, month] = key.split('-');
                const monthName = monthNames[parseInt(month) - 1];
                return (
                  <div key={key}>
                    <h5 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', marginBottom: '10px', color: 'var(--text-muted)' }}>
                      {monthName} {year}
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {groupedPast[key].map(p => {
                        const h = horses.find(h => h.id === p.horseId);
                        return h ? (
                          <div key={p.id} className="glass" style={{ padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{h.emoji}</span> 
                            <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{h.name}</strong>
                            <span style={{ fontSize: '0.8rem', opacity: 0.7, flexShrink: 0 }}>du {formatDate(p.startDate)} au {formatDate(p.endDate)}</span>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)' }}>{p.status}</span>
                              {user?.role === ROLES.GERANT && (
                                <button onClick={() => deleteAssignment(p.id)} style={{ padding: '0px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                              )}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const CalendarView = () => {
    const [filterHorseId, setFilterHorseId] = useState('all');
    const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
    const [activeYear, setActiveYear] = useState(new Date().getFullYear());

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => {
      let day = new Date(y, m, 1).getDay();
      return day === 0 ? 6 : day - 1; // 0=Lun, 6=Dim
    };

    const myHorses = user?.role === ROLES.PROPRIETAIRE 
      ? horses.filter(h => h.owner.toLowerCase() !== 'club')
      : horses;

    const myAssignments = user?.role === ROLES.PROPRIETAIRE 
      ? assignments.filter(a => myHorses.some(h => h.id === a.horseId)) 
      : assignments;

    const daysCount = getDaysInMonth(activeYear, activeMonth);
    const firstDayIdx = getFirstDayOfMonth(activeYear, activeMonth);
    const calendarDays = [];
    for (let i = 0; i < firstDayIdx; i++) calendarDays.push(null);
    for (let i = 1; i <= daysCount; i++) calendarDays.push(i);

    let daysAuPre = 0;
    if (filterHorseId !== 'all') {
      const filteredAssignments = myAssignments.filter(a => String(a.horseId) === String(filterHorseId) && a.status === 'pré');
      for (let i = 1; i <= daysCount; i++) {
        const dateStr = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const current = new Date(dateStr);
        const dayAssigns = filteredAssignments.filter(p => current >= new Date(p.startDate) && current <= new Date(p.endDate));
        
        let dayValue = 0;
        dayAssigns.forEach(a => {
           if (!a.period || a.period === 'journée') dayValue = 1;
           else if ((a.period === 'matin' || a.period === 'après-midi') && dayValue < 1) dayValue += 0.5;
        });
        daysAuPre += dayValue > 1 ? 1 : dayValue;
      }
    }

    return (
      <div className="animate-fade">
         <header style={{ marginBottom: '1rem' }}>
            <h1>Calendrier {activeYear}</h1>
            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', padding: '10px 0', scrollbarWidth: 'none' }} className="hide-scrollbar">
              {monthNames.map((m, idx) => (
                <button 
                  key={m} 
                  className={`btn ${activeMonth === idx ? 'btn-primary' : ''}`} 
                  style={{ fontSize: '0.7rem', padding: '6px 12px', whiteSpace: 'nowrap' }} 
                  onClick={() => setActiveMonth(idx)}
                >
                  {m}
                </button>
              ))}
            </div>
         </header>

         <header style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Visualisation globale pour {monthNames[activeMonth]}.</p>
            <span style={{ color: 'var(--warning)', fontWeight: 'bold', fontSize: '1.2rem', whiteSpace: 'nowrap', opacity: filterHorseId === 'all' ? 0 : 1, transition: 'opacity 0.2s ease', pointerEvents: 'none' }}>
              Ce mois-ci : {daysAuPre} jour{daysAuPre > 1 ? 's' : ''} au pré
            </span>
          </div>
          <select className="input" style={{ width: '100%', minWidth: '150px', maxWidth: '200px' }} value={filterHorseId} onChange={e => setFilterHorseId(e.target.value)}>
            <option value="all">Tous les chevaux</option>
            {myHorses.slice().sort((a, b) => a.name.localeCompare(b.name)).map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
          </select>
        </header>

        <div className="card glass" style={{ padding: '0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div className="calendar-wrapper">

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)' }}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} style={{ padding: '12px', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} style={{ border: '1px solid rgba(255,255,255,0.02)' }}></div>;

              const dateStr = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = dateStr === todayStr;
              
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
                <div key={i} style={{ minHeight: '120px', padding: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px', background: isToday ? 'rgba(66, 133, 244, 0.05)' : 'transparent' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isToday ? 'var(--accent)' : 'inherit', opacity: isToday ? 1 : 0.4 }}>{day} {monthNames[activeMonth].substring(0, 3)}</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayAssignments.slice().sort((a, b) => {
                      const hA = horses.find(h => h.id === a.horseId);
                      const hB = horses.find(h => h.id === b.horseId);
                      return (hA?.name || "").localeCompare(hB?.name || "");
                    }).map(a => {
                      const h = horses.find(h => h.id === a.horseId);
                      return h ? (
                        <div key={a.id} className="calendar-item" style={{ 
                          fontSize: '0.7rem', 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          background: h.color || (a.status === 'pré' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(139, 107, 97, 0.4)'), 
                          color: '#fff', 
                          border: '1px solid rgba(255,255,255,0.4)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                          width: '100%',
                          minWidth: 0
                        }}>
                          <span className="hide-very-small" style={{ fontSize: '0.9rem', flexShrink: 0 }}>{h.emoji}</span> 
                          <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{h.name}</strong>
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
        {!user?.isDemo && (
          <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span>⚡ Temps réel On (Supabase)</span>
          </div>
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
                <div key={a.id} className="glass" style={{ padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{h.emoji}</span> 
                    <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{h.name}</strong>

                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 'bold', wordBreak: 'break-word' }}>🌿 Sortie {a.period && a.period !== 'journée' ? `(${a.period})` : ''}</span>
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
                <div key={a.id} className="glass" style={{ padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{h.emoji}</span> 
                    <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{h.name}</strong>

                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 'bold', wordBreak: 'break-word' }}>🏠 Rentrée {a.period && a.period !== 'journée' ? `(${a.period})` : ''}</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginTop: '1rem' }}>
               {atPasture.sort((a, b) => a.horse.name.localeCompare(b.horse.name)).map(({horse: h, assignment: a}) => {
                const days = Math.ceil((new Date(a.endDate) - new Date(a.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <div key={h.id} className="horse-item glass" style={{ borderLeft: `4px solid ${h.color || 'var(--primary)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }} onClick={() => alert(`Au pré du ${a.startDate} au ${a.endDate} (${days} jours)`)}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{h.emoji}</span>
                    <strong style={{ fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{h.name}</strong>
                    <span style={{ fontSize: '0.7rem', opacity: 0.7, flexShrink: 0 }}>📍 au pré {a.period && a.period !== 'journée' ? `(${a.period}) ` : ''}({days}j)</span>
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
        <header style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h1 style={{ margin: 0 }}>Bonjour {isManager ? 'Daniel' : ''} 👋</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{isManager ? 'Tableau de bord' : 'Emplacement actuel des chevaux propriétaires'}</p>
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
