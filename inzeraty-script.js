
import { db, auth } from './firebase-config.js';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const adForm = document.getElementById('adForm');
const adList = document.getElementById('adList');
const formTitle = document.getElementById('formTitle');

function renderAd(docRef, ad) {
  const div = document.createElement('div');
  div.className = 'ad-card';
  div.innerHTML = `
    <strong>${ad.title}</strong> – <em>${ad.category}</em><br>
    ${ad.description}<br>
    <strong>${ad.price} π</strong><br>
    ${ad.image ? `<img src="${ad.image}" alt="obrázek">` : ''}
    <p><small>Autor: ${ad.author || 'Anonym'}</small></p>
    ${auth.currentUser && auth.currentUser.uid === ad.uid ? `<button data-id="${docRef.id}" class="delete-btn">Smazat</button>` : ''}
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

  const user = auth.currentUser;
  if (!user) {
    alert("Musíte být přihlášeni pro přidání inzerátu.");
    return;
  }

  data.uid = user.uid;
  data.author = user.displayName || user.email;
  const imageFile = formData.get('image');

  if (imageFile && imageFile.size > 0) {
    const reader = new FileReader();
    reader.onload = async () => {
      data.image = reader.result;
      await addDoc(collection(db, "inzeraty"), data);
      adForm.reset();
      loadAds();
    };
    reader.readAsDataURL(imageFile);
  } else {
    data.image = '';
    await addDoc(collection(db, "inzeraty"), data);
    adForm.reset();
    loadAds();
  }
};

adList.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    await deleteDoc(doc(db, "inzeraty", id));
    loadAds();
  }
});

auth.onAuthStateChanged(() => {
  loadAds();
});
