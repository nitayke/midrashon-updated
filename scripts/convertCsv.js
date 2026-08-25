import fs from 'fs';
import path from 'path';

const csvPath = 'c:/Users/user/Desktop/projects/shvushon/midrashon/midrashon.csv';
const outputPath = 'c:/Users/user/Desktop/projects/shvushon/midrashon1-updated/src/data/initialMidrashot.json';

const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

const paramKeys = [
  'halacha',
  'gemara',
  'rav_kook',
  'female_figures',
  'chassidut',
  'social',
  'personal_relation',
  'liberalism',
  'halacha_commitment',
  'conditions',
  'emunah',
  'tanach',
  'non_torah_activities'
];

const trackKeys = [
  'before_service',
  'after_service',
  'before_army',
  'service_combo',
  'academic_combo'
];

// Skip header (line 0) and weight row (line 1)
const midrashot = [];

for (let i = 2; i < lines.length; i++) {
  const parts = lines[i].split(',');
  const name = parts[0].trim();
  if (!name) continue;

  const ratings = {};
  paramKeys.forEach((key, idx) => {
    ratings[key] = parseFloat(parts[idx + 1]) || 3;
  });

  const tracks = {};
  trackKeys.forEach((key, idx) => {
    tracks[key] = parseInt(parts[idx + 14], 10) === 1;
  });

  // Infer region from name or default to center/jerusalem/north/south
  let region = 'center';
  if (name.includes('ירושלים') || name.includes('הרובע') || name.includes('נשמת') || name.includes('מגדל עוז') || name.includes('עפרה') || name.includes('שבות רחל') || name.includes('חברון') || name.includes('מעון')) {
    region = 'jerusalem';
  } else if (name.includes('צפת') || name.includes('שומרון') || name.includes('כרמיאל') || name.includes('בית שאן') || name.includes('מוצקין') || name.includes('מצפה רמון') || name.includes('שדרות') || name.includes('ירוחם') || name.includes('אשדוד')) {
    if (name.includes('שדרות') || name.includes('ירוחם') || name.includes('אשדוד') || name.includes('מצפה רמון')) {
      region = 'south';
    } else {
      region = 'north';
    }
  }

  midrashot.push({
    id: `m_${i - 1}`,
    name,
    type: tracks.before_service ? 'before_service' : (tracks.after_service ? 'after_service' : (tracks.before_army ? 'before_army' : 'service_combo')),
    region,
    tracks,
    ratings,
    submissions_count: 1,
    created_at: new Date().toISOString()
  });
}

fs.writeFileSync(outputPath, JSON.stringify(midrashot, null, 2), 'utf-8');
console.log(`Successfully converted ${midrashot.length} midrashot to ${outputPath}`);
