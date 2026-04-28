// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const loginBox = document.getElementById("loginBox");
const adminBox = document.getElementById("adminBox");

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;
  await signInWithEmailAndPassword(auth, email, pass);
});

document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginBox.style.display = "none";
    adminBox.style.display = "block";
    await loadAdmin();
  } else {
    loginBox.style.display = "block";
    adminBox.style.display = "none";
  }
});

async function uploadFile(file, folder) {
  if (!file) return "";
  const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

async function loadAdmin() {
  const siteSnap = await getDoc(doc(db, "settings", "site"));
  const site = siteSnap.exists() ? siteSnap.data() : {};

  ["brand","subtitle","headline","heroSubtitle","tagline","email","phone","whatsapp","address","hours"].forEach(id => {
    document.getElementById(id).value = site[id] || "";
  });

  await renderCollections();
}

document.getElementById("siteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const logoFile = document.getElementById("logo").files[0];
  const logoUrl = await uploadFile(logoFile, "logos");

  const data = {
    brand: brand.value,
    subtitle: subtitle.value,
    headline: headline.value,
    heroSubtitle: heroSubtitle.value,
    tagline: tagline.value,
    email: email.value,
    phone: phone.value,
    whatsapp: whatsapp.value,
    address: address.value,
    hours: hours.value
  };

  if (logoUrl) data.logo = logoUrl;

  await setDoc(doc(db, "settings", "site"), data, { merge: true });
  alert("Datos guardados");
});

document.getElementById("collectionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = collectionId.value.trim().toLowerCase().replaceAll(" ", "-");
  const coverUrl = await uploadFile(collectionCover.files[0], "collections");

  const data = {
    title: collectionTitle.value,
    description: collectionDescription.value,
    emoji: collectionEmoji.value,
    order: Number(collectionOrder.value || 0)
  };

  if (coverUrl) data.cover = coverUrl;

  await setDoc(doc(db, "collections", id), data, { merge: true });
  e.target.reset();
  await renderCollections();
});

async function renderCollections() {
  const snap = await getDocs(collection(db, "collections"));
  const list = document.getElementById("collectionsList");
  list.innerHTML = snap.docs.map(d => {
    const c = d.data();
    return `<div class="admin-row">
      <div><strong>${c.title || d.id}</strong><br><small>${d.id}</small></div>
      <button class="btn btn-secondary" data-delete="${d.id}">Eliminar</button>
    </div>`;
  }).join("");

  list.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (confirm("¿Eliminar esta colección?")) {
        await deleteDoc(doc(db, "collections", btn.dataset.delete));
        await renderCollections();
      }
    });
  });

  const select = document.getElementById("galleryCollection");
  select.innerHTML = snap.docs.map(d => `<option value="${d.id}">${d.data().title || d.id}</option>`).join("");
}

document.getElementById("galleryForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const imageUrl = await uploadFile(galleryImage.files[0], "gallery");

  await addDoc(collection(db, "gallery"), {
    collectionId: galleryCollection.value,
    title: galleryTitle.value,
    description: galleryDescription.value,
    image: imageUrl,
    order: Number(galleryOrder.value || 0)
  });

  e.target.reset();
  alert("Foto añadida");
});
