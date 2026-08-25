import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from 'fs';

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

const midrashotData = JSON.parse(fs.readFileSync('./src/data/initialMidrashot.json', 'utf-8'));

async function seedMidrashot() {
  console.log(`Starting migration of ${midrashotData.length} midrashot to Live Firebase Firestore (midrashon-64d94)...`);
  
  for (const midrasha of midrashotData) {
    try {
      await setDoc(doc(db, "midrashot", midrasha.id), midrasha, { merge: true });
      console.log(`✓ Seeded: ${midrasha.name}`);
    } catch (err) {
      console.error(`X Failed to seed ${midrasha.name}:`, err);
    }
  }
  
  console.log("🎉 Firestore migration complete!");
  process.exit(0);
}

seedMidrashot();
