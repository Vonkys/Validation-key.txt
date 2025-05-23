import { db, auth } from './firebase-config.js';
import {
  collection,
  getDocs,
  getDoc,
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
    ${ad.piWallet && currentUser && currentUser.uid !== ad.uid
      ? `<button class="buy-btn" data-id="${docRef.id}" data-price="${ad.price}" data-recipient="${ad.piWallet}">Koupit za ${ad.price} π</button>`
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

  // Načti piWallet uživatele z profilu pomocí getDoc
  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (userDoc.exists()) {
    const profile = userDoc.data();
    data.piWallet = profile.piWallet || '';
  }

  if (imageFile && imageFile.size > 0) {
    const reader = new FileReader();
    reader.onload = async () => {
      data.image = reader.result;
      await ulozit(data);
    };
    reader.readAsDataURL(imageFile);
  } else {
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

  if (e.target.classList.contains('buy-btn')) {
    const price = parseFloat(e.target.dataset.price);
    const recipient = e.target.dataset.recipient;

    if (!window.Pi) {
      alert("Tuto funkci lze používat pouze v Pi Browseru.");
      return;
    }

    window.Pi.createPayment({
      amount: price,
      memo: "Platba za inzerát",
      metadata: { adId: id },
      to: recipient
    }, {
      onReadyForServerApproval: (paymentId) => {
        console.log("Čekání na schválení:", paymentId);
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        alert("Platba úspěšná!");
        console.log("Platba hotová:", paymentId, txid);
      },
      onCancel: (paymentId) => {
        console.log("Platba zrušena:", paymentId);
      },
      onError: (error, paymentId) => {
        console.error("Chyba při platbě:", error);
        alert("Chyba při platbě.");
      }
    });
  }
});

onAuthStateChanged(auth, user => {
  currentUser = user;
  loadAds();
});
