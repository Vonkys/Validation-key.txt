// ----- Vonky Market - Inzeráty s Pi autentizací a tlačítkem pro platbu -----
// Tento skript umožňuje přidávání, editaci a mazání inzerátů,
// navíc integruje tlačítko pro zaplacení 0.5 Pi přes Pi Network (zatím jen testovací alert).

import { db, auth } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// --- Pi SDK autentizace při načtení stránky ---
const piScopes = ['payments'];

if (window.Pi) {
  Pi.authenticate(piScopes, function (onIncompletePaymentFound) {
    // Zde lze dořešit případné nedokončené platby (budoucí rozšíření)
  })
    .then(function (auth) {
      console.log('Pi Network uživatel autentizován:', auth.user.uid);
    })
    .catch(function (error) {
      console.error('Chyba při Pi autentizaci:', error);
    });
} else {
  console.warn('Pi SDK není načteno!');
}

// --- HTML prvky a proměnné ---
const adForm = document.getElementById('adForm');
const adList = document.getElementById('adList');
const formTitle = document.getElementById('formTitle');
let currentUser = null;
let editId = null;

// --- Vykreslení jednoho inzerátu ---
function renderAd(docRef, ad) {
  const div = document.createElement('div');
  div.className = 'ad-card';
  div.innerHTML = `
    <strong>${ad.title}</strong> – <em>${ad.category}</em><br>
    ${ad.description}<br>
    <strong>${ad.price} π</strong><br>
    ${ad.image ? `<img src="${ad.image}" alt="obrázek">` : ''}
    <p><small>Autor: ${ad.author || 'Anonym'}</small></p>
    ${
      currentUser && currentUser.uid === ad.uid
        ? `<button data-id="${docRef.id}" class="edit-btn">Upravit</button>
           <button data-id="${docRef.id}" class="delete-btn">Smazat</button>`
        : `<button data-id="${docRef.id}" data-title="${ad.title}" class="pay-pi-btn">Zaplatit 0.5 Pi</button>`
    }
  `;
  adList.appendChild(div);
}

// --- Načtení a vykreslení všech inzerátů ---
function loadAds() {
  adList.innerHTML = '';
  getDocs(collection(db, "inzeraty")).then(snapshot => {
    snapshot.forEach(docRef => {
      renderAd(docRef, docRef.data());
    });
  });
}

// --- Uložení nového nebo editovaného inzerátu ---
adForm.onsubmit = async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("Musíte být přihlášeni.");
    return;
  }

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const imageInput = document.getElementById("image");
  const imageFile = imageInput.files[0];

  const data = {
    title,
    description,
    price,
    category,
    uid: currentUser.uid,
    author: currentUser.displayName || currentUser.email,
  };

  if (imageFile && imageFile.size > 0) {
    const reader = new FileReader();
    reader.onload = async () => {
      data.image = reader.result;
      await ulozit(data);
    };
    reader.readAsDataURL(imageFile);
  } else {
    // Pokud se neupravuje obrázek, načteme původní
    if (editId) {
      const adSnap = await getDocs(collection(db, "inzeraty"));
      adSnap.forEach(docRef => {
        if (docRef.id === editId) {
          data.image = docRef.data().image || '';
        }
      });
    } else {
      data.image = '';
    }
    await ulozit(data);
  }
};

// --- Pomocná funkce na uložení do databáze ---
async function ulozit(data) {
  if (editId) {
    await updateDoc(doc(db, "inzeraty", editId), data);
    editId = null;
    formTitle.innerText = "Přidat inzerát";
  } else {
    await addDoc(collection(db, "inzeraty"), data);
  }
  adForm.reset();
  loadAds();
}

// --- Obsluha tlačítek (edit, smazat, zaplatit) u každého inzerátu ---
adList.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('delete-btn')) {
    await deleteDoc(doc(db, "inzeraty", id));
    loadAds();
  }
  if (e.target.classList.contains('edit-btn')) {
    const snapshot = await getDocs(collection(db, "inzeraty"));
    snapshot.forEach(docRef => {
      if (docRef.id === id) {
        const ad = docRef.data();
        document.getElementById('title').value = ad.title;
        document.getElementById('description').value = ad.description;
        document.getElementById('price').value = ad.price;
        document.getElementById('category').value = ad.category;
        formTitle.innerText = "Úprava inzerátu";
        editId = id;
      }
    });
  }
  if (e.target.classList.contains('pay-pi-btn')) {
    const title = e.target.dataset.title || '';
    payWithPi(title, id); // Volá se základ pro Pi platbu (zatím pouze alert)
  }
});

// --- Sledujeme přihlášení uživatele (Firebase Auth) ---
onAuthStateChanged(auth, user => {
  currentUser = user;
  loadAds();
});

// --- Funkce pro platbu přes Pi Network (zatím jen testovací alert) ---
function payWithPi(title, inzeratId) {
  alert(`Tady bude platba Pi za inzerát "${title}" (ID: ${inzeratId})!`);
  // V dalším kroku zde bude volání Pi.createPayment...
}
