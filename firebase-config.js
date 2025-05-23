// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSTnWfyeClcaj7S44dRej9ShT_0BhNOc8",
  authDomain: "vonkymarket.firebaseapp.com",
  projectId: "vonkymarket",
  storageBucket: "vonkymarket.appspot.com",
  messagingSenderId: "932122908764",
  appId: "1:932122908764:web:79c4d922904a52196c2e99",
  measurementId: "G-LB0GW46800"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);