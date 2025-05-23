
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";

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

document.getElementById('registerForm').onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "profil.html";
    })
    .catch(err => {
      document.getElementById('error').innerText = err.message;
    });
};
