
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSTnWfyeClcaj7S44dRej9ShT_0BhNOc8",
  authDomain: "vonkymarket.firebaseapp.com",
  projectId: "vonkymarket",
  storageBucket: "vonkymarket.appspot.com",
  messagingSenderId: "932122908764",
  appId: "1:932122908764:web:79c4d922904a52196c2e99"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

onAuthStateChanged(auth, user => {
  const info = document.getElementById('userInfo');
  if (user) {
    info.innerText = `Přihlášený jako: ${user.email}`;
  } else {
    info.innerText = "Nejste přihlášeni.";
  }
});

document.getElementById('logoutBtn').onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
