// ── Firebase config ───────────────────────────────────────────────────────────
// INSTRUCCIONES: Reemplaza estos valores con los de tu proyecto Firebase
// (ver README para cómo obtenerlos)
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROJECT.firebaseapp.com",
  projectId:         "TU_PROJECT_ID",
  storageBucket:     "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);

// ID fijo del documento — todos los dispositivos leen/escriben el mismo
const DOC_ID = "bastian";

export const loadDB = async (key) => {
  try {
    const ref  = doc(db, "alquimia", DOC_ID);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return data[key] ?? null;
    }
    return null;
  } catch (e) {
    console.error("loadDB error", e);
    return null;
  }
};

export const saveDB = async (key, value) => {
  try {
    const ref = doc(db, "alquimia", DOC_ID);
    await setDoc(ref, { [key]: value }, { merge: true });
  } catch (e) {
    console.error("saveDB error", e);
  }
};
