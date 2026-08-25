import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Exact Geographic Region Mapping for all 30 Midrashot
const REGION_MAPPING = {
  "אוריה - גבעת שמואל": "center",
  "בת ציון": "jerusalem",
  "מדרשת דניאלי": "north",
  "יעלה- מצפה רמון": "south",
  "מבראשית": "south",
  "מדרשת מעיין - שדרות": "south",
  "נוב": "north",
  "מדרשת נטע - בית שאן": "north",
  "שירת חברון": "south",
  "תכלת - צפת": "north",
  "הרובע": "jerusalem",
  "שילת - קרני שומרון": "north",
  "יפו": "center",
  "אורות עציון - גבעת וושינגטון": "center",
  "מכון אורה": "jerusalem",
  "מעון": "south", // דרום הר חברון
  "מכינת לפידות": "south",
  "שחרי - עופרה": "jerusalem",
  "בינת - שבות רחל": "jerusalem",
  "אשירה - קרית מוצקין": "north",
  "מתת לינדנבאום - כרמיאל": "north",
  "באר ירוחם": "south",
  "לוד- לינדנבאום": "center",
  "באר אשדוד": "south",
  "עין הנציב": "north",
  "מגדל עוז": "jerusalem",
  "נשמת": "jerusalem",
  "דרישה": "jerusalem",
  "לינדנבאום-ירושלים": "jerusalem",
  "מדרשת רוני": "south"
};

const jsonPath = './src/data/initialMidrashot.json';
const midrashot = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

let updatedCount = 0;
const updatedMidrashot = midrashot.map(m => {
  const nameTrimmed = m.name.trim();
  const correctRegion = REGION_MAPPING[nameTrimmed] || REGION_MAPPING[m.name];
  if (correctRegion) {
    if (m.region !== correctRegion) {
      console.log(`Updated region for "${m.name}": ${m.region} -> ${correctRegion}`);
      updatedCount++;
    }
    return { ...m, region: correctRegion };
  }
  return m;
});

fs.writeFileSync(jsonPath, JSON.stringify(updatedMidrashot, null, 2), 'utf-8');
console.log(`✓ Updated regions for ${updatedCount} midrashot in initialMidrashot.json`);

// Now update live Firebase Firestore (midrashon-64d94)
const firebaseConfig = {
  apiKey: "AIzaSyCa_Ma7rsywO5f1vyITz5NOx2Lpe-TG790",
  authDomain: "midrashon-64d94.firebaseapp.com",
  projectId: "midrashon-64d94",
  storageBucket: "midrashon-64d94.firebasestorage.app",
  messagingSenderId: "821311184972",
  appId: "1:821311184972:web:9c73b35763a10fec7a54e9",
  measurementId: "G-PG012DBX1P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncToFirebase() {
  console.log("Syncing updated regions to Live Firebase Firestore (midrashon-64d94)...");
  for (const m of updatedMidrashot) {
    await setDoc(doc(db, "midrashot", m.id), m, { merge: true });
    console.log(`✓ Firestore updated: ${m.name} (${m.region})`);
  }
  console.log("🎉 Live Firestore sync complete!");
  process.exit(0);
}

syncToFirebase();
