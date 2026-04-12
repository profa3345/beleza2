import { initializeApp }   from "firebase/app";
import { getAuth }          from "firebase/auth";
import { getFirestore }     from "firebase/firestore";
import { getFunctions }     from "firebase/functions";
import { getStorage }       from "firebase/storage";

const firebaseConfig = {
  apiKey:            "AIzaSyDyL0bxTfe7X2de_O-wbKn09feIIxi4TTs",
  authDomain:        "beleza-hub.firebaseapp.com",
  projectId:         "beleza-hub",
  storageBucket:     "beleza-hub.firebasestorage.app",
  messagingSenderId: "752625992317",
  appId:             "1:752625992317:web:1fac364495bbb3c110e714",
};

const app = initializeApp(firebaseConfig);

export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const functions = getFunctions(app, "southamerica-east1");
export const storage   = getStorage(app);
export default app;
