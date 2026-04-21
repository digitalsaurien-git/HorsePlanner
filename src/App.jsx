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
  { id: 4, name: 'Conquérant', emoji: '🦓', owner: 'Propriétaire', color: '#333333', status: 'box' },
  { id: 5, name: 'Lipton', emoji: '🐰', owner: 'Propriétaire', color: '#90caf9', status: 'box' },
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

const getProprietaryHorseIds = (horsesList) => {
  return horsesList.filter(h => {
    if (!h.owner) return false;
    const ownerClean = h.owner.toLowerCase().trim();
    return ownerClean !== 'club';
  }).map(h => h.id);
};

const groupContinuous = (items) => {
  if (!items.length) return [];
  let sorted = [...items].sort((a,b) => a.startDate.localeCompare(b.startDate));
  let grouped = [];
  let current = {...sorted[0], sourceIds: [sorted[0].id]};
  for(let i=1; i<sorted.length; i++) {
     let next = sorted[i];
     let currEnd = new Date(current.endDate);
     currEnd.setDate(currEnd.getDate() + 1);
     let expectedNextStart = currEnd.toISOString().split('T')[0];
     if(next.startDate === expectedNextStart && next.period === current.period && next.note === current.note) {
        current.endDate = next.endDate;
        current.sourceIds.push(next.id);
     } else {
        grouped.push(current);
        current = {...next, sourceIds: [next.id]};
     }
  }
  grouped.push(current);
  return grouped;
};

const INITIAL_PLANNINGS = [
  // (Data recalée historique maintenue avec IDs locaux temporaires pour le regroupement)
  { id: "mock_1", horseId: 2, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré' },
  { id: "mock_2", horseId: 4, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré' },
  { id: "mock_3", horseId: 6, startDate: '2026-04-01', endDate: '2026-04-01', status: 'pré' },
  { id: "mock_4", horseId: 2, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' }, { id: "mock_5", horseId: 7, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: "mock_6", horseId: 4, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' }, { id: "mock_7", horseId: 8, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: "mock_8", horseId: 9, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' }, { id: "mock_9", horseId: 10, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: "mock_10", horseId: 6, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' }, { id: "mock_11", horseId: 3, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: "mock_12", horseId: 11, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' }, { id: "mock_13", horseId: 12, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: "mock_14", horseId: 5, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' }, { id: "mock_15", horseId: 13, startDate: '2026-04-02', endDate: '2026-04-02', status: 'pré' },
  { id: "mock_16", horseId: 6, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' }, { id: "mock_17", horseId: 4, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' },
  { id: "mock_18", horseId: 5, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' }, { id: "mock_19", horseId: 13, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' },
  { id: "mock_20", horseId: 14, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' }, { id: "mock_21", horseId: 3, startDate: '2026-04-03', endDate: '2026-04-03', status: 'pré' },
  { id: "mock_22", horseId: 4, startDate: '2026-04-04', endDate: '2026-04-04', status: 'pré' }, { id: "mock_23", horseId: 3, startDate: '2026-04-04', endDate: '2026-04-04', status: 'pré' },
  { id: "mock_24", horseId: 15, startDate: '2026-04-04', endDate: '2026-04-04', status: 'pré' }, { id: "mock_25", horseId: 12, startDate: '2026-04-04', endDate: '2026-04-04', status: 'pré' },
  { id: "mock_26", horseId: 13, startDate: '2026-04-04', endDate: '2026-04-04', status: 'pré' },
  { id: "mock_27", horseId: 4, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré' }, { id: "mock_28", horseId: 17, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré' },
  { id: "mock_29", horseId: 14, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré' }, { id: "mock_30", horseId: 5, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré' },
  { id: "mock_31", horseId: 11, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré', period: 'après-midi' }, { id: "mock_32", horseId: 13, startDate: '2026-04-05', endDate: '2026-04-05', status: 'pré' },
  { id: "mock_33", horseId: 15, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré' }, { id: "mock_34", horseId: 4, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré' },
  { id: "mock_35", horseId: 10, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré' }, { id: "mock_36", horseId: 3, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré' },
  { id: "mock_37", horseId: 6, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré' }, { id: "mock_38", horseId: 5, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré' },
  { id: "mock_39", horseId: 12, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré' }, { id: "mock_40", horseId: 9, startDate: '2026-04-06', endDate: '2026-04-06', status: 'pré' },
  { id: "mock_41", horseId: 2, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' }, { id: "mock_42", horseId: 7, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' },
  { id: "mock_43", horseId: 4, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' }, { id: "mock_44", horseId: 8, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' },
  { id: "mock_45", horseId: 18, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' }, { id: "mock_46", horseId: 5, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' },
  { id: "mock_47", horseId: 9, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' }, { id: "mock_48", horseId: 14, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' },
  { id: "mock_49", horseId: 6, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' }, { id: "mock_50", horseId: 11, startDate: '2026-04-07', endDate: '2026-04-07', status: 'pré' },
  { id: "mock_51", horseId: 4, startDate: '2026-04-08', endDate: '2026-04-08', status: 'pré' }, { id: "mock_52", horseId: 5, startDate: '2026-04-08', endDate: '2026-04-08', status: 'pré' },
  { id: "mock_53", horseId: 13, startDate: '2026-04-08', endDate: '2026-04-08', status: 'pré' }, { id: "mock_54", horseId: 6, startDate: '2026-04-08', endDate: '2026-04-08', status: 'pré' },
  { id: "mock_55", horseId: 2, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré' }, { id: "mock_56", horseId: 18, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré' },
  { id: "mock_57", horseId: 4, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré' }, { id: "mock_58", horseId: 10, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré' },
  { id: "mock_59", horseId: 5, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré' }, { id: "mock_60", horseId: 6, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré' },
  { id: "mock_61", horseId: 11, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré' }, { id: "mock_62", horseId: 3, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré' },
  { id: "mock_63", horseId: 13, startDate: '2026-04-09', endDate: '2026-04-09', status: 'pré' },
  { id: "mock_64", horseId: 4, startDate: '2026-04-10', endDate: '2026-04-10', status: 'pré' }, { id: "mock_65", horseId: 5, startDate: '2026-04-10', endDate: '2026-04-10', status: 'pré' },
  { id: "mock_66", horseId: 14, startDate: '2026-04-10', endDate: '2026-04-10', status: 'pré' }, { id: "mock_67", horseId: 15, startDate: '2026-04-10', endDate: '2026-04-10', status: 'pré' },
  { id: "mock_68", horseId: 6, startDate: '2026-04-10', endDate: '2026-04-10', status: 'pré' }, { id: "mock_69", horseId: 3, startDate: '2026-04-10', endDate: '2026-04-10', status: 'pré' },
  { id: "mock_70", horseId: 7, startDate: '2026-04-10', endDate: '2026-04-10', status: 'pré' },
  { id: "mock_71", horseId: 4, startDate: '2026-04-11', endDate: '2026-04-11', status: 'pré' }, { id: "mock_72", horseId: 5, startDate: '2026-04-11', endDate: '2026-04-11', status: 'pré' },
  { id: "mock_73", horseId: 15, startDate: '2026-04-11', endDate: '2026-04-11', status: 'pré' }, { id: "mock_74", horseId: 6, startDate: '2026-04-11', endDate: '2026-04-11', status: 'pré' },
  { id: "mock_75", horseId: 4, startDate: '2026-04-12', endDate: '2026-04-12', status: 'pré' }, { id: "mock_76", horseId: 5, startDate: '2026-04-12', endDate: '2026-04-12', status: 'pré' },
  { id: "mock_77", horseId: 6, startDate: '2026-04-12', endDate: '2026-04-12', status: 'pré' }, { id: "mock_78", horseId: 17, startDate: '2026-04-12', endDate: '2026-04-12', status: 'pré' },
  { id: "mock_79", horseId: 2, startDate: '2026-04-12', endDate: '2026-04-12', status: 'pré' },
  { id: "mock_80", horseId: 2, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' }, { id: "mock_81", horseId: 18, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' },
  { id: "mock_82", horseId: 4, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' }, { id: "mock_83", horseId: 17, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' },
  { id: "mock_84", horseId: 7, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' }, { id: "mock_85", horseId: 10, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' },
  { id: "mock_86", horseId: 3, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' }, { id: "mock_87", horseId: 5, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' },
  { id: "mock_88", horseId: 9, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' }, { id: "mock_89", horseId: 12, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' },
  { id: "mock_90", horseId: 11, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' }, { id: "mock_91", horseId: 6, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' },
  { id: "mock_92", horseId: 13, startDate: '2026-04-13', endDate: '2026-04-13', status: 'pré' },
  { id: "mock_93", horseId: 2, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' }, { id: "mock_94", horseId: 18, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' },
  { id: "mock_95", horseId: 4, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' }, { id: "mock_96", horseId: 5, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' },
  { id: "mock_97", horseId: 7, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' }, { id: "mock_98", horseId: 15, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' },
  { id: "mock_99", horseId: 6, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' }, { id: "mock_100", horseId: 14, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' },
  { id: "mock_101", horseId: 8, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' }, { id: "mock_102", horseId: 11, startDate: '2026-04-14', endDate: '2026-04-14', status: 'pré' },
  { id: "mock_103", horseId: 4, startDate: '2026-04-15', endDate: '2026-04-15', status: 'pré' }, { id: "mock_104", horseId: 6, startDate: '2026-04-15', endDate: '2026-04-15', status: 'pré' },
  { id: "mock_105", horseId: 3, startDate: '2026-04-15', endDate: '2026-04-15', status: 'pré' }, { id: "mock_106", horseId: 13, startDate: '2026-04-15', endDate: '2026-04-15', status: 'pré' },
  { id: "mock_107", horseId: 2, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré' }, { id: "mock_108", horseId: 4, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré' },
  { id: "mock_109", horseId: 8, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré' }, { id: "mock_110", horseId: 10, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré' },
  { id: "mock_111", horseId: 14, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré' }, { id: "mock_112", horseId: 12, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré' },
  { id: "mock_113", horseId: 6, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré' }, { id: "mock_114", horseId: 3, startDate: '2026-04-16', endDate: '2026-04-16', status: 'pré' },
  { id: "mock_115", horseId: 4, startDate: '2026-04-17', endDate: '2026-04-17', status: 'pré' }, { id: "mock_116", horseId: 5, startDate: '2026-04-17', endDate: '2026-04-17', status: 'pré' },
  { id: "mock_117", horseId: 6, startDate: '2026-04-17', endDate: '2026-04-17', status: 'pré' }, { id: "mock_118", horseId: 7, startDate: '2026-04-17', endDate: '2026-04-17', status: 'pré' },
  { id: "mock_119", horseId: 4, startDate: '2026-04-18', endDate: '2026-04-18', status: 'pré' }, { id: "mock_120", horseId: 5, startDate: '2026-04-18', endDate: '2026-04-18', status: 'pré' },
  { id: "mock_121", horseId: 12, startDate: '2026-04-18', endDate: '2026-04-18', status: 'pré' },
  { id: "mock_122", horseId: 4, startDate: '2026-04-19', endDate: '2026-04-19', status: 'pré' },
  { id: "mock_123", horseId: 2, startDate: '2026-04-20', endDate: '2026-04-20', status: 'pré' }, { id: "mock_124", horseId: 4, startDate: '2026-04-20', endDate: '2026-04-20', status: 'pré' },
  { id: "mock_125", horseId: 10, startDate: '2026-04-20', endDate: '2026-04-20', status: 'pré' }, { id: "mock_126", horseId: 6, startDate: '2026-04-20', endDate: '2026-04-20', status: 'pré' },
  { id: "mock_127", horseId: 8, startDate: '2026-04-20', endDate: '2026-04-20', status: 'pré' },
  { id: "mock_128", horseId: 2, startDate: '2026-04-21', endDate: '2026-04-21', status: 'pré' }, { id: "mock_129", horseId: 4, startDate: '2026-04-21', endDate: '2026-04-21', status: 'pré' },
  { id: "mock_130", horseId: 5, startDate: '2026-04-21', endDate: '2026-04-21', status: 'pré' }, { id: "mock_131", horseId: 6, startDate: '2026-04-21', endDate: '2026-04-21', status: 'pré' },
  { id: "mock_132", horseId: 4, startDate: '2026-04-22', endDate: '2026-04-22', status: 'pré' }, { id: "mock_133", horseId: 6, startDate: '2026-04-22', endDate: '2026-04-22', status: 'pré' },
  { id: "mock_134", horseId: 2, startDate: '2026-04-23', endDate: '2026-04-23', status: 'pré' }, { id: "mock_135", horseId: 4, startDate: '2026-04-23', endDate: '2026-04-23', status: 'pré' },
  { id: "mock_136", horseId: 6, startDate: '2026-04-23', endDate: '2026-04-23', status: 'pré' },
  { id: "mock_137", horseId: 4, startDate: '2026-04-24', endDate: '2026-04-24', status: 'pré' }, { id: "mock_138", horseId: 10, startDate: '2026-04-24', endDate: '2026-04-24', status: 'pré' },
  { id: "mock_139", horseId: 5, startDate: '2026-04-24', endDate: '2026-04-24', status: 'pré' }, { id: "mock_140", horseId: 6, startDate: '2026-04-24', endDate: '2026-04-24', status: 'pré' },
  { id: "mock_141", horseId: 14, startDate: '2026-04-24', endDate: '2026-04-24', status: 'pré' },
  { id: "mock_142", horseId: 4, startDate: '2026-04-25', endDate: '2026-04-25', status: 'pré' }, { id: "mock_143", horseId: 10, startDate: '2026-04-25', endDate: '2026-04-25', status: 'pré' },
  { id: "mock_144", horseId: 14, startDate: '2026-04-25', endDate: '2026-04-25', status: 'pré' },
  { id: "mock_145", horseId: 4, startDate: '2026-04-26', endDate: '2026-04-26', status: 'pré' }, { id: "mock_146", horseId: 10, startDate: '2026-04-26', endDate: '2026-04-26', status: 'pré' },
  { id: "mock_147", horseId: 14, startDate: '2026-04-26', endDate: '2026-04-26', status: 'pré' },
  { id: "mock_148", horseId: 2, startDate: '2026-04-27', endDate: '2026-04-27', status: 'pré' }, { id: "mock_149", horseId: 4, startDate: '2026-04-27', endDate: '2026-04-27', status: 'pré' },
  { id: "mock_150", horseId: 10, startDate: '2026-04-27', endDate: '2026-04-27', status: 'pré' }, { id: "mock_151", horseId: 6, startDate: '2026-04-27', endDate: '2026-04-27', status: 'pré' },
  { id: "mock_152", horseId: 12, startDate: '2026-04-27', endDate: '2026-04-27', status: 'pré' }, { id: "mock_153", horseId: 14, startDate: '2026-04-27', endDate: '2026-04-27', status: 'pré' },
  { id: "mock_154", horseId: 2, startDate: '2026-04-28', endDate: '2026-04-28', status: 'pré' }, { id: "mock_155", horseId: 4, startDate: '2026-04-28', endDate: '2026-04-28', status: 'pré' },
  { id: "mock_156", horseId: 10, startDate: '2026-04-28', endDate: '2026-04-28', status: 'pré' }, { id: "mock_157", horseId: 5, startDate: '2026-04-28', endDate: '2026-04-28', status: 'pré' },
  { id: "mock_158", horseId: 12, startDate: '2026-04-28', endDate: '2026-04-28', status: 'pré' }, { id: "mock_159", horseId: 6, startDate: '2026-04-28', endDate: '2026-04-28', status: 'pré' },
  { id: "mock_160", horseId: 14, startDate: '2026-04-28', endDate: '2026-04-28', status: 'pré' },
  { id: "mock_161", horseId: 4, startDate: '2026-04-29', endDate: '2026-04-29', status: 'pré' }, { id: "mock_162", horseId: 10, startDate: '2026-04-29', endDate: '2026-04-29', status: 'pré' },
  { id: "mock_163", horseId: 12, startDate: '2026-04-29', endDate: '2026-04-29', status: 'pré' }, { id: "mock_164", horseId: 6, startDate: '2026-04-29', endDate: '2026-04-29', status: 'pré' },
  { id: "mock_165", horseId: 14, startDate: '2026-04-29', endDate: '2026-04-29', status: 'pré' },
  { id: "mock_166", horseId: 2, startDate: '2026-04-30', endDate: '2026-04-30', status: 'pré' }, { id: "mock_167", horseId: 4, startDate: '2026-04-30', endDate: '2026-04-30', status: 'pré' },
  { id: "mock_168", horseId: 10, startDate: '2026-04-30', endDate: '2026-04-30', status: 'pré' }, { id: "mock_169", horseId: 6, startDate: '2026-04-30', endDate: '2026-04-30', status: 'pré' },
  { id: "mock_170", horseId: 14, startDate: '2026-04-30', endDate: '2026-04-30', status: 'pré' },
  { id: "mock_may_1", horseId: 10, startDate: '2026-05-01', endDate: '2026-05-04', status: 'pré' },
  { id: "mock_may_2", horseId: 14, startDate: '2026-05-01', endDate: '2026-05-03', status: 'pré' },
  { id: "mock_may_3", horseId: 2, startDate: '2026-05-04', endDate: '2026-05-05', status: 'pré' },
  { id: "mock_may_4", horseId: 14, startDate: '2026-05-07', endDate: '2026-05-07', status: 'pré' },
  { id: "mock_may_5", horseId: 2, startDate: '2026-05-07', endDate: '2026-05-07', status: 'pré' },
  { id: "mock_may_6", horseId: 2, startDate: '2026-05-11', endDate: '2026-05-12', status: 'pré' },
  { id: "mock_may_7", horseId: 2, startDate: '2026-05-14', endDate: '2026-05-16', status: 'pré' },
  { id: "mock_may_8", horseId: 2, startDate: '2026-05-18', endDate: '2026-05-19', status: 'pré' },
  { id: "mock_may_9", horseId: 2, startDate: '2026-05-21', endDate: '2026-05-21', status: 'pré' },
  { id: "mock_may_10", horseId: 2, startDate: '2026-05-25', endDate: '2026-05-26', status: 'pré' },
  { id: "mock_may_11", horseId: 2, startDate: '2026-05-28', endDate: '2026-05-28', status: 'pré' },
];

// --- Sub-components ---

const LoginView = ({ emailInput, setEmailInput, passwordInput, setPasswordInput, handleSupabaseLogin }) => (
  <div className="flex-center animate-fade" style={{ minHeight: '80vh' }}>
    <div className="card glass" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>HorsePlanner</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
        <h3 style={{opacity:0.8}}>Connexion Sécurisée</h3>
        <input type="email" className="input" placeholder="Email" value={emailInput} onChange={e => setEmailInput(e.target.value)} />
        <input type="password" className="input" placeholder="Mot de passe" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSupabaseLogin()} />
        <button className="btn btn-primary" onClick={handleSupabaseLogin}>Se connecter</button>
      </div>
    </div>
  </div>
);

const NoticeModal = ({ isGerant, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>
          {isGerant ? "Notice Gérant" : "Notice Propriétaire"}
        </h2>

        {isGerant ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <section>
               <h3 style={{ borderBottom: '1px solid rgba(150,150,150,0.2)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>1. Dashboard</h3>
               <ul style={{ paddingLeft: '1.2rem', listStyleType: 'square', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <li>Mouvements du jour : départs le matin et retours le soir.</li>
                 <li>Détails visibles : notes et périodes spécifiques (matin / après-midi).</li>
                 <li><strong>Règle des 20h :</strong> les chevaux en "journée simple" disparaissent du pré après 20h.</li>
               </ul>
            </section>
            <section>
               <h3 style={{ borderBottom: '1px solid rgba(150,150,150,0.2)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>2. Chevaux</h3>
               <ul style={{ paddingLeft: '1.2rem', listStyleType: 'square', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <li>Gestion complète : création, nom et propriétaire.</li>
                 <li>Distinction claire entre chevaux "Club" et "Propriétaires".</li>
                 <li>Les icônes personnalisées par les propriétaires sont visibles par le gérant.</li>
               </ul>
            </section>
            <section>
               <h3 style={{ borderBottom: '1px solid rgba(150,150,150,0.2)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>3. Affectations</h3>
               <ul style={{ paddingLeft: '1.2rem', listStyleType: 'square', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <li>Contrôle total des plannings et notes.</li>
                 <li>Gestion des périodes (matin, après-midi, journée).</li>
                 <li>Historisation : les affectations basculent automatiquement en "Passées" selon l'heure.</li>
               </ul>
            </section>
            <section>
               <h3 style={{ borderBottom: '1px solid rgba(150,150,150,0.2)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>4. Calendrier</h3>
               <ul style={{ paddingLeft: '1.2rem', listStyleType: 'square', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <li>Planning global avec filtres par cheval.</li>
                 <li>Compteur de jours : toute affectation sur une date compte comme <strong>1 jour plein</strong>.</li>
               </ul>
            </section>
            <section>
               <h3 style={{ borderBottom: '1px solid rgba(150,150,150,0.2)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>5. Navigation</h3>
               <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>L'application mémorise désormais votre menu courant (Calendrier, Chevaux, etc.) même après un changement d'onglet ou un rafraîchissement (F5).</p>
            </section>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <section>
               <h3 style={{ borderBottom: '1px solid rgba(150,150,150,0.2)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>1. Dashboard</h3>
               <ul style={{ paddingLeft: '1.2rem', listStyleType: 'square', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <li>Visualisez vos chevaux actuellement au pré.</li>
                 <li><strong>Règle des 20h :</strong> les sorties à la journée ne sont plus listées après 20h.</li>
               </ul>
            </section>
            <section>
               <h3 style={{ borderBottom: '1px solid rgba(150,150,150,0.2)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>2. Affectations</h3>
               <ul style={{ paddingLeft: '1.2rem', listStyleType: 'square', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <li>Planifiez les sorties de vos chevaux (début, fin et note).</li>
                 <li>Suivi des affectations Actives, À venir et Passées.</li>
               </ul>
            </section>
            <section>
               <h3 style={{ borderBottom: '1px solid rgba(150,150,150,0.2)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>3. Calendrier</h3>
               <ul style={{ paddingLeft: '1.2rem', listStyleType: 'square', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <li>Visualisation graphique de l'occupation des prés pour vos chevaux.</li>
                 <li>Le compteur de jours n'est pas affiché pour les propriétaires.</li>
               </ul>
            </section>
            <section>
               <h3 style={{ borderBottom: '1px solid rgba(150,150,150,0.2)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>4. Chevaux</h3>
               <ul style={{ paddingLeft: '1.2rem', listStyleType: 'square', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <li>Personnalisez l'icône de vos chevaux.</li>
                 <li>Le nom et le propriétaire restent fixés par le gérant.</li>
               </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, mode, setMode, user, setNoticeOpen, theme, toggleTheme }) => (
  <>
    <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <button className={`btn ${mode === APP_MODES.DASHBOARD ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.DASHBOARD)}>🏠 Dashboard</button>
        <button className={`btn ${mode === APP_MODES.HORSES ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.HORSES)}>🐴 Chevaux</button>
        <button className={`btn ${mode === APP_MODES.ASSIGNMENTS ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.ASSIGNMENTS)}>🗓️ Affectations</button>
        <button className={`btn ${mode === APP_MODES.CALENDAR ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.CALENDAR)}>📅 Calendrier</button>
        <div style={{ flex: 1 }} />
        <button className="btn" style={{ justifyContent: 'start', opacity: 0.8, fontSize: '0.9rem' }} onClick={toggleTheme}>
           {theme === 'light' ? '🌙 Thème Sombre' : '☀️ Thème Clair'}
        </button>
        <button className="btn" style={{ justifyContent: 'start', opacity: 0.8, fontSize: '0.9rem' }} onClick={() => setNoticeOpen(true)}>ℹ️ Notice</button>
        {user?.role === ROLES.GERANT && <button className={`btn ${mode === APP_MODES.SETTINGS ? 'btn-primary' : ''}`} style={{ justifyContent: 'start' }} onClick={() => setMode(APP_MODES.SETTINGS)}>⚙️ Paramètres</button>}
      </div>
    </aside>
  </>
);

const Navbar = ({ setIsSidebarOpen, user, logout }) => (
  <nav className="navbar glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button className="btn menu-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <h2 className="gradient-text hide-mobile">HorsePlanner</h2>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{user?.role === ROLES.GERANT ? "Chef d'écurie" : "Espace Propriétaire"}</span>
      <button className="btn btn-accent" onClick={logout}>Déconnexion</button>
    </div>
  </nav>
);

const HORSE_EMOJIS = [
  '🐎','🐴','🏇','🎠','🦄','🦓','🤠','🌟','✨','⚡','💫','🔥','❤️','💙','💚','💛','💜','🖤','🤍','🤎',
  '🏆','🏅','🎖️','🎯','👑','💎','🍀','🍎','🥕','🌻','🌞','🌙','🌊','❄️','🌈','🦋','🦅','🐲','🐉','🐾',
  '🍏','🍉','🍇','🍓','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍄','🧅','🌸','🌼','🌷','🌹','🌺','🌲','🌳',
  '🍁','🍂','🍃','🌍','🪐','☄️','☀️','⛅','☁️','⛈️','☔','⛄','💧','💦','💨','🌪️','🎈','🎉','🎊',
  '🎀','🎁','🪄','🛡️','⚔️','⭐','☄️','🚀','🛸','🚥','🚧','⚓','⛵','🚤','🚢','✈️','🚁','🚂','🚠','🚜'
];

const HorseManagement = ({ horses, user, ROLES, addHorse, updateHorse, syncDeleteHorse }) => {
  const isGerant = user?.role === ROLES.GERANT;
  const myHorseIds = !isGerant ? getProprietaryHorseIds(horses) : horses.map(h => h.id);
  const displayHorses = isGerant ? horses : horses.filter(h => myHorseIds.includes(h.id));

  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editEmoji, setEditEmoji] = useState('🐎');

  return (
    <div className="animate-fade">
      <h1>{isGerant ? "Gestion des Chevaux" : "Mes Chevaux"}</h1>
      
      {isGerant && (
        <div className="card glass" style={{ marginTop: '1rem' }}>
          <h4>Ajouter un cheval</h4>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <input className="input" placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />
            <input className="input" placeholder="Propriétaire" value={owner} onChange={e => setOwner(e.target.value)} />
            <button className="btn btn-primary" onClick={()=>{if(name&&owner){addHorse({name, owner, emoji:'🐎', status:'box'});setName('');setOwner('');}}}>Ajouter</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {displayHorses.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(h => (
          <div key={h.id} className="glass" style={{ padding: '15px', borderRadius: '12px', borderLeft: `4px solid ${h.color||'var(--accent)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {editingId === h.id ? (
               <div style={{display:'flex', flexDirection:'column', gap:'10px', flex:1}}>
                 {isGerant ? (
                   <>
                     <input className="input" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Nom" autoFocus />
                     <input className="input" value={editOwner} onChange={e=>setEditOwner(e.target.value)} placeholder="Propriétaire" />
                   </>
                 ) : (
                   <>
                     <label style={{fontSize:'0.8rem', opacity:0.8}}>Choisir une icône :</label>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto', padding: '6px', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid rgba(150,150,150,0.1)' }}>
                        {HORSE_EMOJIS.map(e => (
                           <button key={e} onClick={() => setEditEmoji(e)} style={{ background: editEmoji === e ? 'var(--bg-card)' : 'transparent', border: editEmoji === e ? '1px solid var(--accent)' : '1px solid transparent', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', borderRadius: '4px', transition: 'var(--transition-smooth)' }}>{e}</button>
                        ))}
                     </div>
                   </>
                 )}
                 <button className="btn btn-primary" style={{marginTop:'5px', alignSelf:'flex-start'}} onClick={()=>{
                   if(isGerant) updateHorse(h.id, {name:editName, owner:editOwner});
                   else updateHorse(h.id, {emoji:editEmoji});
                   setEditingId(null);
                 }}>Valider</button>
               </div>
            ) : (
               <div style={{ flex: 1 }}><strong>{h.emoji} {h.name}</strong><br/><small style={{opacity:0.6}}>{h.owner}</small></div>
            )}
            
            {editingId !== h.id && (
               <div style={{ display: 'flex', gap: '10px' }}>
                 <button onClick={()=>{
                   setEditingId(h.id); 
                   setEditName(h.name); 
                   setEditOwner(h.owner);
                   setEditEmoji(h.emoji || '🐎');
                 }} style={{background:'transparent', border:'none', cursor:'pointer'}}>✏️</button>
                 {isGerant && <button onClick={()=>syncDeleteHorse(h.id)} style={{background:'transparent', border:'none', cursor:'pointer'}}>🗑️</button>}
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AssignmentView = ({ user, ROLES, horses, assignments, formatDate, addAssignment, deleteAssignments, updateAssignments }) => {
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [period, setPeriod] = useState('journée');
  const [activeTab, setActiveTab] = useState('actives');
  
  const [editingGroup, setEditingGroup] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const isGerant = user?.role === ROLES.GERANT;
  const myHorseIds = !isGerant ? getProprietaryHorseIds(horses) : horses.map(h => h.id);
  const filtered = assignments.filter(a => myHorseIds.includes(a.horseId));

  const sanitizeDate = (d) => (d ? String(d).split('T')[0] : '');
  
  const now = new Date();
  const currentHour = now.getHours();

  const actives = filtered.filter(p => {
    const start = sanitizeDate(p.startDate);
    const end = sanitizeDate(p.endDate || p.startDate);
    if (start <= today && end >= today) {
      if (currentHour >= 20 && end === today) return false;
      return true;
    }
    return false;
  });

  const upcoming = filtered.filter(p => sanitizeDate(p.startDate) > today);
  
  const past = filtered.filter(p => {
    const start = sanitizeDate(p.startDate);
    const end = sanitizeDate(p.endDate || p.startDate);
    if (end < today) return true;
    if (start <= today && end >= today && currentHour >= 20 && end === today) return true;
    return false;
  });

  const groupByHorse = (list) => {
    const grouped = {};
    list.forEach(p => { const h = horses.find(h => h.id === p.horseId); if (!h) return; if (!grouped[h.name]) grouped[h.name] = { horse: h, items: [] }; grouped[h.name].items.push(p); });
    return Object.keys(grouped).sort().map(k => ({ horse: grouped[k].horse, items: grouped[k].items }));
  };
  
  // Rendu des affectations
  const renderActivesForGerant = () => {
    if(!isGerant) return null;
    const pastureToday = horses.filter(h => assignments.some(a => {
      if (a.horseId !== h.id || a.status !== 'pré') return false;
      const coversToday = sanitizeDate(a.startDate) <= today && sanitizeDate(a.endDate || a.startDate) >= today;
      if (!coversToday) return false;
      if (currentHour >= 20) return sanitizeDate(a.endDate || a.startDate) > today;
      return true;
    }));
    return (
      <div className="card glass" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--success)' }}>
         <h3 style={{marginBottom: '1rem'}}>🌿 Actuellement au pré ({pastureToday.length})</h3>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {pastureToday.map(h => (
              <div key={h.id} className="glass" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>{h.emoji} {h.name}</div>
            ))}
            {pastureToday.length === 0 && <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>Aucun cheval au pré en ce moment.</span>}
         </div>
      </div>
    );
  };

  return (
    <div className="animate-fade">
      <h1>Affectations & Planning</h1>
      {renderActivesForGerant()}
      
      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <h4>Nouvelle affectation</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{fontSize:'0.8rem', opacity:0.6}}>Cheval</label>
            <select className="input" value={selectedHorseId} onChange={e => setSelectedHorseId(e.target.value)}>
              <option value="">Sélectionner...</option>
              {horses.filter(h => myHorseIds.includes(h.id)).map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:'0.8rem', opacity:0.6}}>Date de début</label>
            <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={{fontSize:'0.8rem', opacity:0.6}}>Date de fin</label>
            <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          {isGerant && (
            <div>
              <label style={{fontSize:'0.8rem', opacity:0.6}}>Période</label>
              <select className="input" value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="journée">Journée</option>
                <option value="matin">Matin</option>
                <option value="après-midi">Après-midi</option>
              </select>
            </div>
          )}
          <div>
            <label style={{fontSize:'0.8rem', opacity:0.6}}>Note</label>
            <input className="input" placeholder="Instruction..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div style={{alignSelf:'end'}}><button className="btn btn-primary" style={{width:'100%'}} onClick={()=>{if(selectedHorseId&&startDate&&endDate){addAssignment({horseId:Number(selectedHorseId),startDate,endDate,status:'pré',period:isGerant?period:'journée',note});setStartDate('');setEndDate('');setNote('');}}}>✅ Planifier</button></div>
        </div>
      </div>

      <div className="card glass">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
           {['actives', 'upcoming', 'past'].map(t => <button key={t} className={`btn ${activeTab === t ? 'btn-primary' : ''}`} style={{ flex: 1 }} onClick={() => setActiveTab(t)}>{t === 'actives' ? 'Actives' : t === 'upcoming' ? 'À venir' : 'Passées'}</button>)}
        </div>
        {groupByHorse(activeTab === 'actives' ? actives : activeTab === 'upcoming' ? upcoming : past).map(({horse, items}) => (
          <div key={horse.id} style={{ marginBottom: '1.5rem' }}>
             <div style={{ fontWeight: '600', marginBottom: '8px' }}>{horse.emoji} {horse.name}</div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                {items.map(p => (
                   <div key={p.sourceIds.join('_')} className="glass" style={{ padding: '10px', borderRadius: '10px', borderLeft: `3px solid ${horse.color}`, fontSize: '0.85rem' }}>
                      {editingGroup && editingGroup.sourceIds.join('_') === p.sourceIds.join('_') ? (
                         <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                            <input type="date" className="input" value={editingGroup.startDate} onChange={e=>setEditingGroup({...editingGroup, startDate: e.target.value})} />
                            <input type="date" className="input" value={editingGroup.endDate} onChange={e=>setEditingGroup({...editingGroup, endDate: e.target.value})} />
                            {isGerant && (
                               <select className="input" value={editingGroup.period} onChange={e=>setEditingGroup({...editingGroup, period: e.target.value})}>
                                  <option value="journée">Journée</option>
                                  <option value="matin">Matin</option>
                                  <option value="après-midi">Après-midi</option>
                               </select>
                            )}
                            <input className="input" value={editingGroup.note} onChange={e=>setEditingGroup({...editingGroup, note: e.target.value})} placeholder="Note..." />
                            <div style={{display:'flex', gap:'5px'}}>
                               <button className="btn btn-primary" onClick={()=>{updateAssignments(editingGroup.sourceIds, {horseId: editingGroup.horseId, startDate: editingGroup.startDate, endDate: editingGroup.endDate, period: editingGroup.period || 'journée', note: editingGroup.note, status: 'pré'}); setEditingGroup(null);}}>Sauver</button>
                               <button className="btn" onClick={()=>setEditingGroup(null)}>Annuler</button>
                            </div>
                         </div>
                      ) : (
                         <>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                               <span>Du {formatDate(p.startDate)} au {formatDate(p.endDate)}</span>
                               {isGerant && (
                                  <div style={{display:'flex', gap:'5px'}}>
                                     <button onClick={()=>setEditingGroup({...p, period: p.period || 'journée', note: p.note || ''})} style={{background:'transparent', border:'none', cursor:'pointer'}}>✏️</button>
                                     <button onClick={()=>deleteAssignments(p.sourceIds)} style={{background:'transparent', border:'none', cursor:'pointer'}}>🗑️</button>
                                  </div>
                               )}
                            </div>
                            <div style={{opacity:0.7, marginTop: '4px'}}>{(p.period && p.period !== 'journée') ? `(${p.period}) ` : ''}{p.note ? `📝 ${p.note}` : ''}</div>
                         </>
                      )}
                   </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CalendarView = ({ horses, assignments, user, ROLES }) => {
  const [activeMonth, setActiveMonth] = useState(3); // Avril
  const [activeYear, setActiveYear] = useState(2026);
  const [selectedHorseId, setSelectedHorseId] = useState('all');
  
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const firstDay = new Date(activeYear, activeMonth, 1).getDay();
  const isGerant = user?.role === ROLES.GERANT;
  const myHorseIds = !isGerant ? getProprietaryHorseIds(horses) : horses.map(h => h.id);

  const getDaysAtPasture = () => {
    if (selectedHorseId === 'all') return 0;
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${activeYear}-${(activeMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const assignsForDay = assignments.filter(a => a.horseId === Number(selectedHorseId) && dateStr >= a.startDate && dateStr <= a.endDate);
      if (assignsForDay.length > 0) {
        count += 1;
      }
    }
    return count;
  };

  return (
    <div className="animate-fade">
      <h1>Calendrier des Pâturages</h1>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginTop: '1rem' }}>
        {monthNames.map((m, i) => <button key={m} className={`btn ${activeMonth === i ? 'btn-primary' : ''}`} onClick={() => setActiveMonth(i)} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{m}</button>)}
      </div>
      <div className="card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
           <h2 style={{ color: 'var(--accent)' }}>{monthNames[activeMonth]} {activeYear}</h2>
           {isGerant && selectedHorseId !== 'all' && <div className="pasture-count">{getDaysAtPasture()} jours au pré</div>}
           <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
              <select className="input" value={selectedHorseId} onChange={e => setSelectedHorseId(e.target.value)}>
                <option value="all">Tous les chevaux</option>
                {horses.filter(h => myHorseIds.includes(h.id)).map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
              </select>
           </div>
        </div>
        <div className="calendar-grid">
           {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} className="calendar-header-cell">{d}</div>)}
           {Array.from({ length: (firstDay + 6) % 7 }).map((_, i) => <div key={`e-${i}`} />)}
           {Array.from({ length: daysInMonth }).map((_, i) => {
             const day = i + 1;
             const dateStr = `${activeYear}-${(activeMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
             const dayAssigns = assignments.filter(a => {
               const match = dateStr >= a.startDate && dateStr <= a.endDate;
               const horseMatch = selectedHorseId === 'all' || a.horseId === Number(selectedHorseId);
               return match && horseMatch && myHorseIds.includes(a.horseId);
             });
             const uniqueDayAssigns = dayAssigns.filter((val, idx, arr) => arr.findIndex(t => t.horseId === val.horseId) === idx);
             return (
               <div key={day} className="calendar-day">
                 <div style={{ fontSize: '0.75rem', textAlign: 'right', opacity: 0.5 }}>{day}</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {uniqueDayAssigns.map(a => {
                       const h = horses.find(h => h.id === a.horseId);
                       return h ? (
                         <div key={a.id} className="calendar-badge" style={{ background: `${h.color}33`, borderLeft: `2px solid ${h.color}`, display: 'flex', gap: '4px', alignItems: 'center' }}>
                           <span>{h.emoji}</span> <span style={{fontSize: '0.65rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}} title={h.name}>{h.name}</span>
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

const Dashboard = ({ user, ROLES, horses, assignments }) => {
  const today = new Date().toISOString().split('T')[0];
  const isGerant = user?.role === ROLES.GERANT;
  const myHorseIds = !isGerant ? getProprietaryHorseIds(horses) : horses.map(h => h.id);
  
  const now = new Date();
  const currentHour = now.getHours();
  
  const pastureToday = horses.filter(h => {
    if (!myHorseIds.includes(h.id)) return false;
    return assignments.some(a => {
      if (a.horseId !== h.id || a.status !== 'pré') return false;
      const coversToday = a.startDate <= today && a.endDate >= today;
      if (!coversToday) return false;
      
      // Regle metier : apres 20h, on ne garde que ceux qui sont encore au pré demain (periodes continues)
      if (currentHour >= 20) {
        return a.endDate > today;
      }
      return true;
    });
  });

  if (isGerant) {
    return (
      <div className="animate-fade">
        <header style={{ marginBottom: '2rem' }}>
          <h1>Bonjour Daniel 👋</h1>
          <p style={{ opacity: 0.7 }}>Tableau de bord</p>
        </header>

        <div className="grid">
          <div className="card glass" style={{ borderLeft: '4px solid var(--success)' }}>
            <h3>☀️ Matin - Départ au pré</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {assignments.filter(a => a.startDate === today && a.status === 'pré').map(a => {
                const h = horses.find(h => h.id === a.horseId);
                if (!h) return null;
                const showPeriod = a.period && a.period !== 'journée';
                return (
                  <div key={a.sourceIds ? a.sourceIds[0] : a.id} className="glass" style={{ padding: '8px 12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{h.emoji} {h.name}</div>
                    {(showPeriod || a.note) && (
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(150,150,150,0.1)' }}>
                        {showPeriod && <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent)', fontWeight: '500' }}>⏰ {a.period}</span>}
                        {a.note && <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.8 }}>📝 {a.note}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
              {assignments.filter(a => a.startDate === today && a.status === 'pré').length === 0 && <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Aucun départ prévu ce jour.</p>}
            </div>
          </div>
          <div className="card glass" style={{ borderLeft: '4px solid var(--warning)' }}>
            <h3>🌑 Soir - Retour box</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {assignments.filter(a => a.endDate === today && a.status === 'pré').map(a => {
                const h = horses.find(h => h.id === a.horseId);
                if (!h) return null;
                const showPeriod = a.period && a.period !== 'journée';
                return (
                  <div key={a.sourceIds ? a.sourceIds[0] : a.id} className="glass" style={{ padding: '8px 12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{h.emoji} {h.name}</div>
                    {(showPeriod || a.note) && (
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(150,150,150,0.1)' }}>
                        {showPeriod && <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent)', fontWeight: '500' }}>⏰ {a.period}</span>}
                        {a.note && <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.8 }}>📝 {a.note}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
              {assignments.filter(a => a.endDate === today && a.status === 'pré').length === 0 && <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Aucun retour prévu ce soir.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Bonjour 👋</h1>
        <p style={{ opacity: 0.7 }}>Emplacement de vos chevaux</p>
      </header>
      <div className="card glass" style={{ background: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33,150,243,0.3)', marginBottom: '1.5rem', display: 'flex', gap: '15px', alignItems: 'center', padding: '1.2rem' }}>
        <span style={{fontSize: '1.2rem'}}>ℹ️</span><p style={{ fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>Pour toute modification, veuillez contacter le club par téléphone ou par mail.</p>
      </div>
      <div className="card glass">
         <h3>🌿 Chevaux Propriétaires (au Pré) ({pastureToday.length})</h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginTop: '1rem' }}>
            {pastureToday.map(h => (
              <div key={h.id} className="glass" style={{ padding: '10px', textAlign: 'center', borderRadius: '12px', border: `1px solid ${h.color}33` }}>
                <div style={{ fontSize: '1.8rem' }}>{h.emoji}</div>
                <div style={{ fontWeight: '600' }}>{h.name}</div>
              </div>
            ))}
            {pastureToday.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Aucun cheval au pré.</p>}
         </div>
      </div>
    </div>
  );
};

function SettingsView() {
  const [syncPath, setSyncPath] = useState('');
  const [clientId, setClientId] = useState('');
  return (
    <div className="animate-fade">
      <h1>Paramètres</h1>
      <div className="grid" style={{marginTop:'20px'}}>
        <div className="card glass">
          <h3>📂 Automate Sync</h3>
          <div style={{marginTop:'15px', display:'flex', flexDirection:'column', gap:'10px'}}>
            <label style={{fontSize:'0.8rem', opacity:0.6}}>ID Dossier Google Drive</label>
            <input className="input" value={syncPath} onChange={e=>setSyncPath(e.target.value)} placeholder="ID du dossier..." />
            <label style={{fontSize:'0.8rem', opacity:0.6}}>Google Client ID (OAuth 2.0)</label>
            <input className="input" value={clientId} onChange={e=>setClientId(e.target.value)} placeholder="000000-xxxx.apps.google.com" />
            <button className="btn btn-primary">Appliquer</button>
            <div className="glass" style={{padding:'10px', marginTop:'10px', borderRadius:'8px', fontSize:'0.8rem'}}>Statut : <span style={{color:'var(--danger)'}}>INACTIF</span></div>
            <button className="btn btn-accent">Établir la liaison Google Drive</button>
          </div>
        </div>
        <div className="card glass">
          <h3>☁️ Synchronisation Cloud</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'15px'}}>
            <button className="btn btn-primary">Sauvegarder</button>
            <button className="btn btn-primary">Charger</button>
          </div>
          <h3 style={{marginTop:'20px', color:'var(--danger)'}}>⚠️ Zone de danger</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'10px'}}>
             <button className="btn" style={{background:'rgba(244,67,54,0.1)', color:'var(--danger)', width:'100%'}}>Injection Chevaux (Captures)</button>
             <button className="btn" style={{background:'rgba(244,67,54,0.1)', color:'var(--danger)', width:'100%'}}>Réinstaller le Planning de Démo</button>
          </div>
          <h3 style={{marginTop:'20px'}}>🛡️ Zone de Secours</h3>
          <button className="btn btn-accent" style={{width:'100%', marginTop:'10px'}} onClick={()=>{localStorage.clear(); window.location.reload();}}>Réinitialiser tout le cache</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  console.log("[DEBUG HP] App Rendering - Mode:", localStorage.getItem('hp_mode') || 'unknown');
  const [theme, setTheme] = useState(() => localStorage.getItem('hp_theme') || 'dark');
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('hp_mode');
    return (saved && saved !== APP_MODES.LOGIN) ? saved : APP_MODES.LOGIN;
  });
  const [horses, setHorses] = useState(INITIAL_HORSES);
  const [assignments, setAssignments] = useState(INITIAL_PLANNINGS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNoticeOpen, setNoticeOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const formatDate = (iso) => iso ? iso.split('-').reverse().join('/') : '';

  const fetchSupabaseData = async () => {
    try {
      const { data: hData } = await supabase.from('horses').select('*').order('name');
      if (hData && hData.length > 0) setHorses(hData.map(h => ({...h, id: Number(h.id)})));
      const { data: aData } = await supabase.from('assignments').select('*');
      if (aData) {
        const mapped = aData.map(a => {
          const start = a.start_date ? a.start_date.split('T')[0] : '';
          const end = (a.end_date || a.start_date) ? (a.end_date || a.start_date).split('T')[0] : '';
          return { id: a.id, horseId: Number(a.horse_id), startDate: start, endDate: end, status: a.status, period: a.period, note: a.note || '' };
        });
        const combined = [...INITIAL_PLANNINGS];
        mapped.forEach(m => {
          if (!combined.some(c => c.id === m.id)) combined.push(m);
        });
        setAssignments(combined);
      }
    } catch (err) { console.error("Erreur de récupération :", err); }
  };

  const handleAuthSession = async (session) => {
    console.log("[DEBUG HP] handleAuthSession - Session:", session ? "Trouvée (" + session.user.email + ")" : "Nulle");
    if (session) {
      try {
        const { data: profile, error: pError } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        console.log("[DEBUG HP] Profile Reçu:", profile, "Error:", pError);
        
        if (pError || !profile) {
          console.error("[DEBUG HP] Profil inaccessible ou inexistant. Déconnexion forcée.");
          await supabase.auth.signOut();
          setUser(null);
          setMode(APP_MODES.LOGIN);
          return;
        }

        const roleStr = profile.role === 'gerant' ? ROLES.GERANT : ROLES.PROPRIETAIRE;
        setUser({ id: session.user.id, role: roleStr, name: profile.role === 'gerant' ? 'Daniel' : 'Propriétaire' }); 
        
        // On ne force le Dashboard que si on est sur la page de Login
        setMode(prev => (prev === APP_MODES.LOGIN) ? APP_MODES.DASHBOARD : prev);
        
        console.log("[DEBUG HP] Authentification Réussie");
      } catch (err) {
        console.error("[DEBUG HP] Erreur critique handleAuthSession:", err);
      }
    } else {
      setUser(null);
      setMode(APP_MODES.LOGIN);
    }
  };

  useEffect(() => {
    localStorage.setItem('hp_theme', theme);
    document.body.classList.toggle('theme-light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hp_mode', mode);
  }, [mode]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    console.log("[DEBUG HP] useEffect Auth Initialisation");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[DEBUG HP] getSession retourné");
      handleAuthSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[DEBUG HP] onAuthStateChange déclenché - Event:", _event);
      handleAuthSession(session);
    });
    fetchSupabaseData();
    return () => subscription?.unsubscribe();
  }, []);

  const handleSupabaseLogin = async () => {
    console.log("[DEBUG HP] handleSupabaseLogin - Clic reçu pour:", emailInput);
    const { error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput });
    if (error) {
       console.error("[DEBUG HP] Erreur signInWithPassword:", error.message);
       alert("Échec de connexion : " + error.message);
    } else { 
       console.log("[DEBUG HP] signInWithPassword SUCCESS");
       setEmailInput(''); 
       setPasswordInput(''); 
    }
  };

  const logout = async () => { 
    await supabase.auth.signOut();
    setUser(null); setMode(APP_MODES.LOGIN); 
  };

  const globalGroupedAssignments = Object.values(
    assignments.reduce((acc, curr) => {
      if (!acc[curr.horseId]) acc[curr.horseId] = [];
      acc[curr.horseId].push(curr);
      return acc;
    }, {})
  ).flatMap(items => groupContinuous(items));

  return (
    <div style={{ minHeight: '100vh', transition: 'var(--transition-smooth)' }}>
      {mode === APP_MODES.LOGIN ? <LoginView emailInput={emailInput} setEmailInput={setEmailInput} passwordInput={passwordInput} setPasswordInput={setPasswordInput} handleSupabaseLogin={handleSupabaseLogin} /> : (
        <div style={{ display: 'flex' }}>
          {isNoticeOpen && <NoticeModal isGerant={user?.role === ROLES.GERANT} onClose={() => setNoticeOpen(false)} />}
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} mode={mode} setMode={setMode} user={user} logout={logout} setNoticeOpen={setNoticeOpen} theme={theme} toggleTheme={toggleTheme} />
          <main className="main-content container">
            <Navbar setIsSidebarOpen={setIsSidebarOpen} user={user} logout={logout} />
            <div style={{ padding: '1rem' }}>
              {mode === APP_MODES.DASHBOARD && <Dashboard user={user} ROLES={ROLES} horses={horses} assignments={globalGroupedAssignments} />}
              {mode === APP_MODES.HORSES && <HorseManagement horses={horses} user={user} ROLES={ROLES} addHorse={async (h)=>{await supabase.from('horses').insert([h]); fetchSupabaseData();}} updateHorse={async (id,u)=>{await supabase.from('horses').update(u).eq('id',id); fetchSupabaseData();}} syncDeleteHorse={async (id)=>{await supabase.from('horses').delete().eq('id',id); fetchSupabaseData();}} />}
              {mode === APP_MODES.ASSIGNMENTS && (
                <AssignmentView 
                  horses={horses} 
                  assignments={globalGroupedAssignments} 
                  user={user} 
                  ROLES={ROLES} 
                  formatDate={formatDate} 
                  addAssignment={async (a) => {
                    const sbPayload = { horse_id: a.horseId, start_date: a.startDate, end_date: a.endDate, status: a.status, period: a.period, note: a.note };
                    await supabase.from('assignments').insert([sbPayload]);
                    await fetchSupabaseData();
                  }} 
                  deleteAssignments={async (ids) => { 
                    await Promise.all(ids.map(id => typeof id === 'string' && id.startsWith('mock_') ? Promise.resolve() : supabase.from('assignments').delete().eq('id',id))); 
                    if(ids.some(id => typeof id === 'string' && id.startsWith('mock_'))) { 
                      setAssignments(prev => prev.filter(c => !ids.includes(c.id))); 
                    } else { 
                      await fetchSupabaseData(); 
                    } 
                  }} 
                  updateAssignments={async (sourceIds, payload) => { 
                    await Promise.all(sourceIds.map(id => typeof id === 'string' && id.startsWith('mock_') ? Promise.resolve() : supabase.from('assignments').delete().eq('id',id))); 
                    const sbPayload = { horse_id: payload.horseId, start_date: payload.startDate, end_date: payload.endDate, status: payload.status, period: payload.period, note: payload.note }; 
                    await supabase.from('assignments').insert([sbPayload]); 
                    if(sourceIds.some(id => typeof id === 'string' && id.startsWith('mock_'))) { 
                      setAssignments(prev => [...prev.filter(c => !sourceIds.includes(c.id)), {id: Date.now(), ...payload}]); 
                    } else { 
                      await fetchSupabaseData(); 
                    } 
                  }} 
                />
              )}
              {mode === APP_MODES.CALENDAR && <CalendarView horses={horses} assignments={globalGroupedAssignments} user={user} ROLES={ROLES} />}
              {mode === APP_MODES.SETTINGS && <SettingsView />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
