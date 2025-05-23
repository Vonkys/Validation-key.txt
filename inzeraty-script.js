
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSTnWfyeClcaj7S44dRej9ShT_0BhNOc8",
  authDomain: "vonkymarket.firebaseapp.com",
  projectId: "vonkymarket",
  storageBucket: "vonkymarket.appspot.com",
  messagingSenderId: "932122908764",
  appId: "1:932122908764:web:79c4d922904a52196c2e99",
  measurementId: "G-LB0GW46800"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const adForm = document.getElementById('adForm');
const adList = document.getElementById('adList');
const formTitle = document.getElementById('formTitle');
let editId = null;

function renderAd(doc, ad) {
  const div = document.createElement('div');
  div.className = 'ad-card';
  div.innerHTML = `
    <strong>${ad.title}</strong> – <em>${ad.category}</em><br>
    ${ad.description}<br>
    <strong>${ad.price} π</strong><br>
    ${ad.image ? `<img src="${ad.image}" alt="obrázek">` : ''}
    <p><small>Autor: ${ad.author || 'Anonym'}</small></p>
    <button data-id="${doc.id}" class="edit-btn">Upravit</button>
    <button data-id="${doc.id}" class="delete-btn">Smazat</button>
  `;
  adList.appendChild(div);
}

function loadAds() {
  adList.innerHTML = '';
  db.collection("inzeraty").get().then(snapshot => {
    snapshot.forEach(doc => {
      renderAd(doc, doc.data());
    });
  });
}

adForm.onsubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(adForm);
  const data = Object.fromEntries(formData.entries());

  const imageFile = formData.get('image');
  if (imageFile && imageFile.size > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      data.image = reader.result;
      saveAd(data);
    };
    reader.readAsDataURL(imageFile);
  } else {
    data.image = '';
    saveAd(data);
  }
};

function saveAd(data) {
  if (editId) {
    db.collection("inzeraty").doc(editId).update(data).then(() => {
      editId = null;
      formTitle.innerText = "Přidat inzerát";
      adForm.reset();
      loadAds();
    });
  } else {
    db.collection("inzeraty").add(data).then(() => {
      adForm.reset();
      loadAds();
    });
  }
}

adList.addEventListener('click', (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('delete-btn')) {
    db.collection("inzeraty").doc(id).delete().then(loadAds);
  }
  if (e.target.classList.contains('edit-btn')) {
    db.collection("inzeraty").doc(id).get().then(doc => {
      const ad = doc.data();
      adForm.title.value = ad.title;
      adForm.description.value = ad.description;
      adForm.price.value = ad.price;
      adForm.category.value = ad.category;
      formTitle.innerText = "Úprava inzerátu";
      editId = id;
    });
  }
});

loadAds();
