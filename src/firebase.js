import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  deleteDoc 
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import initialMidrashot from './data/initialMidrashot.json';

// Read Firebase keys from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID"
);

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("🔥 Live Firebase Firestore connected for Midrashon!");
  } catch (err) {
    console.error("Firebase Initialization Error:", err);
  }
}

// Admin Authentication function
export const authenticateAdminDB = async () => {
  if (isFirebaseConfigured && auth) {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
        console.log("🔒 Firebase Admin session authenticated successfully!");
      }
    } catch (err) {
      console.warn("Notice: Firebase Anonymous Auth is not enabled in Firebase Console. Proceeding directly with Firestore queries:", err?.message || err);
    }
  }
};

// Local Storage Fallback keys for Midrashon
const LOCAL_MIDRASHOT_KEY = 'midrashon_midrashot_v1';
const LOCAL_SUBMISSIONS_KEY = 'midrashon_submissions_v1';
const LOCAL_REQUESTS_KEY = 'midrashon_requests_v1';

const getLocalMidrashot = () => {
  const saved = localStorage.getItem(LOCAL_MIDRASHOT_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error("Cache parse error:", e);
    }
  }
  localStorage.setItem(LOCAL_MIDRASHOT_KEY, JSON.stringify(initialMidrashot));
  return initialMidrashot;
};

// 1. Get all Midrashot directly from Firebase Firestore (or fallback to initial json)
export const getYeshivotDB = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "midrashot"));
      const list = [];
      querySnapshot.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
      
      if (list.length > 0) {
        localStorage.setItem(LOCAL_MIDRASHOT_KEY, JSON.stringify(list));
        return list;
      }
    } catch (err) {
      console.error("Firestore getMidrashot error, using initial midrashot data:", err);
    }
  }
  return getLocalMidrashot();
};

// 2. Save Student Submission
export const saveStudentSubmissionDB = async (submission) => {
  const dataToSave = {
    ...submission,
    processed: false,
    created_at: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, "student_submissions_midrashon"), dataToSave);
      console.log("Saved student submission to Firestore!");
    } catch (err) {
      console.error("Firestore save submission error:", err);
    }
  }

  const existing = JSON.parse(localStorage.getItem(LOCAL_SUBMISSIONS_KEY) || '[]');
  existing.push({ id: 'sub_' + Date.now(), ...dataToSave });
  localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(existing));
  return true;
};

// 3. Save Midrasha Addition Request
export const saveYeshivaRequestDB = async (request) => {
  const dataToSave = {
    ...request,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, "midrasha_requests"), dataToSave);
      console.log("Saved midrasha request to Firestore!");
      return { id: docRef.id, ...dataToSave };
    } catch (err) {
      console.error("Firestore save request error:", err);
    }
  }

  const existing = JSON.parse(localStorage.getItem(LOCAL_REQUESTS_KEY) || '[]');
  const newReq = { id: 'req_' + Date.now(), ...dataToSave };
  existing.push(newReq);
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(existing));
  return newReq;
};

// 4. Get Student Submissions (For Admin)
export const getStudentSubmissionsDB = async () => {
  await authenticateAdminDB();
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "student_submissions_midrashon"));
      const list = [];
      querySnapshot.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
      return list;
    } catch (err) {
      console.error("Firestore getSubmissions error:", err);
    }
  }
  return JSON.parse(localStorage.getItem(LOCAL_SUBMISSIONS_KEY) || '[]');
};

// 5. Get Midrasha Addition Requests (For Admin)
export const getYeshivaRequestsDB = async () => {
  await authenticateAdminDB();
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "midrasha_requests"));
      const list = [];
      querySnapshot.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
      return list;
    } catch (err) {
      console.error("Firestore getRequests error:", err);
    }
  }
  return JSON.parse(localStorage.getItem(LOCAL_REQUESTS_KEY) || '[]');
};

// 6. Approve Midrasha Request (For Admin)
export const approveYeshivaRequestDB = async (request) => {
  await authenticateAdminDB();
  const newMidrasha = {
    id: 'm_' + Date.now(),
    name: request.yeshiva_name,
    type: request.type,
    region: request.region,
    ratings: request.ratings,
    submissions_count: 1
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "midrashot", newMidrasha.id), newMidrasha);
      if (request.id) {
        await setDoc(doc(db, "midrasha_requests", request.id), { status: 'approved' }, { merge: true });
      }
    } catch (err) {
      console.error("Firestore approve request error:", err);
    }
  }

  const list = await getYeshivotDB();
  list.push(newMidrasha);
  localStorage.setItem(LOCAL_MIDRASHOT_KEY, JSON.stringify(list));
  return newMidrasha;
};

// 7. Save / Edit Midrasha (For Admin)
export const saveYeshivaDB = async (midrashaData) => {
  await authenticateAdminDB();
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "midrashot", midrashaData.id), midrashaData, { merge: true });
    } catch (err) {
      console.error("Firestore save midrasha error:", err);
    }
  }

  const list = await getYeshivotDB();
  const idx = list.findIndex(y => y.id === midrashaData.id);
  if (idx >= 0) {
    list[idx] = midrashaData;
  } else {
    list.push(midrashaData);
  }
  localStorage.setItem(LOCAL_MIDRASHOT_KEY, JSON.stringify(list));
  return midrashaData;
};

// 8. Delete Midrasha (For Admin)
export const deleteYeshivaDB = async (midrashaId) => {
  await authenticateAdminDB();
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "midrashot", midrashaId));
    } catch (err) {
      console.error("Firestore delete midrasha error:", err);
    }
  }

  let list = await getYeshivotDB();
  list = list.filter(y => y.id !== midrashaId);
  localStorage.setItem(LOCAL_MIDRASHOT_KEY, JSON.stringify(list));
  return true;
};

// 9. Recalculate Midrasha Averages based on all Student Submissions (For Admin)
export const recalculateYeshivaAveragesDB = async () => {
  await authenticateAdminDB();
  const [midrashotList, submissionsList] = await Promise.all([
    getYeshivotDB(),
    getStudentSubmissionsDB()
  ]);

  // Filter only UNPROCESSED submissions
  const pendingSubs = submissionsList.filter(s => s.processed !== true);

  if (pendingSubs.length === 0) return midrashotList;

  const grouped = {};
  pendingSubs.forEach(sub => {
    const name = sub.yeshiva_name;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(sub);
  });

  const updatedMidrashot = [...midrashotList];

  for (const [midrashaName, subs] of Object.entries(grouped)) {
    const targetMidrasha = updatedMidrashot.find(y => y.name === midrashaName);
    if (targetMidrasha) {
      const paramSums = {};
      const count = subs.length;

      subs.forEach(s => {
        if (s.ratings) {
          Object.entries(s.ratings).forEach(([paramKey, score]) => {
            paramSums[paramKey] = (paramSums[paramKey] || 0) + Number(score);
          });
        }
      });

      const newRatings = { ...targetMidrasha.ratings };
      const currentCount = targetMidrasha.submissions_count || 1;
      const totalCount = currentCount + count;

      Object.keys(paramSums).forEach(paramKey => {
        const oldSum = (targetMidrasha.ratings[paramKey] || 3) * currentCount;
        const newSum = oldSum + paramSums[paramKey];
        newRatings[paramKey] = Number((newSum / totalCount).toFixed(1));
      });

      targetMidrasha.ratings = newRatings;
      targetMidrasha.submissions_count = totalCount;

      await saveYeshivaDB(targetMidrasha);
    }
  }

  // Mark all processed submissions as processed: true in Firestore & LocalStorage
  if (isFirebaseConfigured && db) {
    try {
      for (const sub of pendingSubs) {
        if (sub.id && !sub.id.startsWith('sub_')) {
          await setDoc(doc(db, "student_submissions_midrashon", sub.id), { processed: true }, { merge: true });
        }
      }
    } catch (err) {
      console.error("Firestore mark processed submissions error:", err);
    }
  }

  // Update LocalStorage cache as well
  const allSubmissions = JSON.parse(localStorage.getItem(LOCAL_SUBMISSIONS_KEY) || '[]');
  const updatedLocal = allSubmissions.map(s => {
    if (pendingSubs.some(p => p.id === s.id || (p.yeshiva_name === s.yeshiva_name && p.created_at === s.created_at))) {
      return { ...s, processed: true };
    }
    return s;
  });
  localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(updatedLocal));

  return updatedMidrashot;
};

// 10. Delete Midrasha Request (Reject request)
export const deleteYeshivaRequestDB = async (requestId) => {
  await authenticateAdminDB();
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "midrasha_requests", requestId));
    } catch (err) {
      console.error("Firestore delete request error:", err);
    }
  }

  let reqs = JSON.parse(localStorage.getItem(LOCAL_REQUESTS_KEY) || '[]');
  reqs = reqs.filter(r => r.id !== requestId);
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(reqs));
  return true;
};

// 11. Delete Student Submission (Reject/Remove submission)
export const deleteStudentSubmissionDB = async (submissionId) => {
  await authenticateAdminDB();
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "student_submissions_midrashon", submissionId));
    } catch (err) {
      console.error("Firestore delete submission error:", err);
    }
  }

  let subs = JSON.parse(localStorage.getItem(LOCAL_SUBMISSIONS_KEY) || '[]');
  subs = subs.filter(s => s.id !== submissionId);
  localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(subs));
  return true;
};
