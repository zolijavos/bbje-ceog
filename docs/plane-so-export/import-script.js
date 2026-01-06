/**
 * Plane.so Import Script - CEO Gala Project
 *
 * Használat:
 * 1. Generálj API kulcsot: Plane.so → Settings → API Tokens
 * 2. Állítsd be a környezeti változókat:
 *    export PLANE_API_KEY="your-api-key"
 *    export PLANE_WORKSPACE="your-workspace-slug"
 *    export PLANE_PROJECT="your-project-id"
 * 3. Futtatás: node import-script.js
 */

const fs = require('fs');
const path = require('path');

// Konfiguráció
const CONFIG = {
  apiKey: process.env.PLANE_API_KEY,
  workspace: process.env.PLANE_WORKSPACE,
  projectId: process.env.PLANE_PROJECT,
  baseUrl: 'https://api.plane.so/api/v1'
};

// CSV beolvasás
function parseCSV(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || '';
    });
    return obj;
  });
}

// Plane API hívás
async function planeAPI(endpoint, method = 'GET', body = null) {
  const url = `${CONFIG.baseUrl}/workspaces/${CONFIG.workspace}/projects/${CONFIG.projectId}${endpoint}`;

  const options = {
    method,
    headers: {
      'X-API-Key': CONFIG.apiKey,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Epic/Module létrehozás
async function createModule(name, description) {
  return planeAPI('/modules/', 'POST', {
    name,
    description,
    status: 'completed'
  });
}

// Issue (Story) létrehozás
async function createIssue(data, moduleId = null) {
  const issueData = {
    name: data.name,
    description: data.description,
    priority: data.priority === 'high' ? 'urgent' :
              data.priority === 'medium' ? 'medium' : 'low',
    state: 'done' // Vagy a projekt "Done" state ID-ja
  };

  const issue = await planeAPI('/issues/', 'POST', issueData);

  // Hozzáadás a modulhoz (Epic)
  if (moduleId) {
    await planeAPI(`/modules/${moduleId}/issues/`, 'POST', {
      issues: [issue.id]
    });
  }

  return issue;
}

// Fő import függvény
async function importProject() {
  console.log('🚀 CEO Gala Import indítása...\n');

  // Konfiguráció ellenőrzés
  if (!CONFIG.apiKey || !CONFIG.workspace || !CONFIG.projectId) {
    console.error('❌ Hiányzó környezeti változók!');
    console.log('Szükséges: PLANE_API_KEY, PLANE_WORKSPACE, PLANE_PROJECT');
    process.exit(1);
  }

  // CSV betöltés
  const csvPath = path.join(__dirname, 'epics-stories.csv');
  const items = parseCSV(csvPath);

  console.log(`📋 ${items.length} elem betöltve a CSV-ből\n`);

  // Epic-ek és Story-k szétválasztása
  const epics = items.filter(i => i.type === 'epic');
  const stories = items.filter(i => i.type === 'story');

  console.log(`📦 ${epics.length} Epic, ${stories.length} Story\n`);

  // Epic-ek (modulok) létrehozása
  const moduleMap = {};

  for (const epic of epics) {
    console.log(`📦 Epic létrehozása: ${epic.name}`);
    try {
      const module = await createModule(epic.name, epic.description);
      moduleMap[epic.id] = module.id;
      console.log(`   ✅ Létrehozva: ${module.id}`);
    } catch (err) {
      console.log(`   ❌ Hiba: ${err.message}`);
    }
  }

  console.log('\n');

  // Story-k (issue-k) létrehozása
  for (const story of stories) {
    const moduleId = moduleMap[story.epic_id];
    console.log(`📝 Story létrehozása: ${story.name}`);
    try {
      const issue = await createIssue(story, moduleId);
      console.log(`   ✅ Létrehozva: ${issue.id}`);
    } catch (err) {
      console.log(`   ❌ Hiba: ${err.message}`);
    }
  }

  console.log('\n🎉 Import befejezve!');
  console.log(`   - ${Object.keys(moduleMap).length} Epic (Module)`);
  console.log(`   - ${stories.length} Story (Issue)`);
}

// Futtatás
importProject().catch(err => {
  console.error('Kritikus hiba:', err);
  process.exit(1);
});
