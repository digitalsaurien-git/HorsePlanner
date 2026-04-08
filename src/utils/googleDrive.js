/**
 * Google Drive Sync Service for HorsePlanner
 * Path: /DigitalSaurien/AUTOMATE/HorsePlanner
 */

let currentClientId = "867619813314-h3gf1ro6fn1ddotkttso119lbiphi2rv.apps.googleusercontent.com";
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let ghisInited = false;

// Helper to wait for global scripts to load
function waitForScripts() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.gapi && window.google) {
        resolve();
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  });
}

// Initialize the GAPI and GIS libraries
export async function initGoogleDrive(customClientId) {
  if (customClientId) currentClientId = customClientId;
  if (!currentClientId) return;
  
  await waitForScripts();
  console.log("🛠️ Script Google détectés, initialisation...");

  return new Promise((resolve) => {
    console.log("📍 Origine actuelle détectée :", window.location.origin);
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          clientId: currentClientId,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        });
        gapiInited = true;
        console.log("✅ GAPI Initialisé avec ClientID:", currentClientId);
        checkInitialization(resolve);
      } catch (err) {
        console.error("❌ GAPI Init Error:", err);
      }
    });

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: currentClientId,
      scope: SCOPES,
      callback: '', // defined later for auth
    });
    ghisInited = true;
    console.log("✅ GIS Initialisé avec ClientID:", currentClientId);
    checkInitialization(resolve);
  });
}

function checkInitialization(resolve) {
  if (gapiInited && ghisInited) {
    resolve(true);
  }
}

// Start Auth Flow
export async function authenticateGoogle() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        reject(response);
      }
      resolve(response);
    };

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

// Helper to find or create a folder by name and parent
async function getOrCreateFolder(name, parentId = 'root') {
  const query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
  const response = await window.gapi.client.drive.files.list({
    q: query,
    fields: 'files(id, name)',
  });
  
  if (response.result.files.length > 0) {
    return response.result.files[0].id;
  } else {
    const createResponse = await window.gapi.client.drive.files.create({
      resource: {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      },
      fields: 'id'
    });
    return createResponse.result.id;
  }
}

// Helper to resolve a full path (e.g. "Folder/Subfolder/App") or a direct ID
async function resolvePath(pathString) {
  // If it looks like a direct Folder ID (no slashes, long string)
  if (!pathString.includes('/') && pathString.length > 20) {
    return pathString;
  }

  const folders = pathString.split('/').filter(f => f.length > 0);
  let currentId = 'root';

  // DigitalSaurien IDs (Anti-doublons)
  const rootId = window.SYNC_CONFIG?.rootId || "";
  const automateId = window.SYNC_CONFIG?.automateId || "";

  for (let i = 0; i < folders.length; i++) {
    const folderName = folders[i];

    if (folderName === 'DigitalSaurien' && i === 0 && rootId) {
      currentId = rootId;
      continue;
    }
    if (folderName === 'AUTOMATE' && i === 1 && automateId) {
      currentId = automateId;
      continue;
    }

    currentId = await getOrCreateFolder(folderName, currentId);
  }
  return currentId;
}

// Save Data to a specific path or direct Folder ID
export async function saveToDrive(data, pathString = 'DigitalSaurien/AUTOMATE/HorsePlanner') {
  if (!window.gapi.client.getToken()) {
    console.error("❌ [Drive] Aucun jeton d'authentification trouvé. Connectez-vous d'abord.");
    return false;
  }
  
  console.log(`💾 [Drive] Début de la sauvegarde vers "${pathString}"...`);
  try {
    const targetFolderId = await resolvePath(pathString);
    console.log("📂 [Drive] ID du dossier cible :", targetFolderId);

    const fileName = 'horseplanner_sync_backup.json';
    
    // Search for existing file
    const response = await window.gapi.client.drive.files.list({
      q: `name = '${fileName}' and '${targetFolderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
    });
    
    const file = response.result.files[0];
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    
    const metadata = {
      'name': fileName,
      'mimeType': 'application/json',
      'parents': [targetFolderId]
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(data) +
        close_delim;

    if (file) {
      await window.gapi.client.request({
        'path': '/upload/drive/v3/files/' + file.id,
        'method': 'PATCH',
        'params': {'uploadType': 'multipart'},
        'headers': { 'Content-Type': 'multipart/related; boundary=' + boundary },
        'body': multipartRequestBody
      });
      console.log("✅ [Drive] Mise à jour réussie !");
    } else {
      await window.gapi.client.request({
        'path': '/upload/drive/v3/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': { 'Content-Type': 'multipart/related; boundary=' + boundary },
        'body': multipartRequestBody
      });
      console.log("✅ [Drive] Création réussie !");
    }
    return true;
  } catch (err) {
    console.error('❌ [Drive] Erreur lors de la sauvegarde:', err);
    if (err.result?.error?.message) {
      console.error('Détails:', err.result.error.message);
    }
    return false;
  }
}

// Load Data from the specific path
export async function loadFromDrive(pathString = 'DigitalSaurien/AUTOMATE/HorsePlanner') {
  try {
    if (!window.gapi.client.getToken()) return null;

    const targetFolderId = await resolvePath(pathString);

    const response = await window.gapi.client.drive.files.list({
      q: `name = 'horseplanner_sync_backup.json' and '${targetFolderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
    });
    
    const file = response.result.files[0];
    if (!file) return null;

    const fileContent = await window.gapi.client.drive.files.get({
      fileId: file.id,
      alt: 'media',
    });
    
    return fileContent.result;
  } catch (err) {
    console.error('Drive Load Error:', err);
    return null;
  }
}
