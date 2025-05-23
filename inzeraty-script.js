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

const adForm = document.getElementById('adForm');
const adList = document.getElementById('adList');
const formTitle = document.getElementById('formTitle');
let currentUser = null;
let editId = null;

function renderAd(docRef, ad) {
  const div = document.createElement('div');
  div.className = 'ad-card';
  div.innerHTML = `
    <strong>${ad.title}</strong> – <em>${ad.category}</em><br>
    ${ad.description}<br>
    <strong>${ad.price} π</strong><br>
    ${ad.image ? `<img src="${ad.image}" alt="obrázek">` : ''}
    <p><small>Autor: ${ad.author || 'Anonym'}</small></p>
    ${currentUser && currentUser.uid === ad.uid
      ? `<button data-id="${docRef.id}" class="edit-btn">Upravit</button>
         <button data-id="${docRef.id}" class="delete-btn">Smazat</button>`
      : ''}
  `;
  adList.appendChild(div);
}

function loadAds() {
  adList.innerHTML = '';
  getDocs(collection(db, "inzeraty")).then(snapshot => {
    snapshot.forEach(docRef => {
      renderAd(docRef, docRef.data());
    });
  });
}

adForm.onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(adForm);
  const data = Object.fromEntries(formData.entries());

  if (!currentUser) {
    alert("Musíte být přihlášeni pro přidání inzerátu.");
    return;
  }

  data.uid = currentUser.uid;
  data.author = currentUser.displayName || currentUser.email;

  const imageFile = formData.get('image');
  if (imageFile && imageFile.size > 0) {
    const reader = new FileReader();
    reader.onload = async () => {
      data.image = reader.result;
      await saveAd(data);
    };
    reader.readAsDataURL(imageFile);
  } else {
    data.image = '';
    await saveAd(data);
  }
};

async function saveAd(data) {
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
});

onAuthStateChanged(auth, user => {
  currentUser = user;
  loadAds();
});
