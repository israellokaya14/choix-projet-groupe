/*
  1) Créez un projet Firebase (voir README.md).
  2) Remplacez les valeurs ci-dessous par la configuration de votre projet.
*/
const firebaseConfig = {
  apiKey: "AIzaSyB3_E6Q4pmAY9Gkar079LBAtT9M0lXELRQ",
  authDomain: "choixprojetgroupe.firebaseapp.com",
  projectId: "choixprojetgroupe",
  storageBucket: "choixprojetgroupe.firebasestorage.app",
  messagingSenderId: "884115095164",
  appId: "1:884115095164:web:06e20693cc7a439e5953f9"
};

const demoProjects = [
  // Exemple à remplacer par les vraies propositions :
  // { id: "p1", title: "CongoServices", author: "Nom de l'auteur",
  //   description: "Une plateforme pour faciliter certaines démarches administratives.",
  //   problem: "Les citoyens perdent du temps pour s'informer et suivre leurs démarches." }
];

const configured = firebaseConfig.apiKey !== "VOTRE_API_KEY";
let db, auth, currentUser, projects = [];

const projectGrid = document.getElementById("projets");
const projectSelect = document.getElementById("project-select");
const loginBtn = document.getElementById("login-btn");
const voteBtn = document.getElementById("vote-btn");
const authStatus = document.getElementById("auth-status");
const voteArea = document.getElementById("vote-area");
const voteMessage = document.getElementById("vote-message");

function renderProjects(items) {
  projects = items;
  document.getElementById("project-count").textContent = items.length;
  projectGrid.innerHTML = "";
  projectSelect.innerHTML = '<option value="">Choisir un projet…</option>';
  if (!items.length) {
    projectGrid.innerHTML = '<div class="empty">Les propositions seront affichées ici dès qu’elles auront été ajoutées.</div>';
    return;
  }
  items.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "project-card";
    const title = escapeHtml(p.title || "Projet sans titre");
    const author = escapeHtml(p.author || "Auteur non précisé");
    const description = escapeHtml(p.description || "");
    const problem = escapeHtml(p.problem || "Non précisé");
    card.innerHTML = `<div class="project-top"><span class="project-number">PROJET ${String(i+1).padStart(2,"0")}</span><span class="author">Proposé par ${author}</span></div><h3>${title}</h3><p>${description}</p><div class="problem"><b>PROBLÈME À RÉSOUDRE</b><p>${problem}</p></div>`;
    projectGrid.appendChild(card);
    const option = document.createElement("option");
    option.value = p.id; option.textContent = p.title;
    projectSelect.appendChild(option);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function renderResults(votes) {
  const counts = {};
  projects.forEach(p => counts[p.id] = 0);
  votes.forEach(v => { if (counts[v.projectId] !== undefined) counts[v.projectId]++; });
  const total = votes.length;
  const results = document.getElementById("results");
  if (!projects.length) { results.innerHTML = '<p class="muted">Les résultats apparaîtront ici.</p>'; return; }
  results.innerHTML = projects.map(p => {
    const n = counts[p.id] || 0, percent = total ? Math.round(n/total*100) : 0;
    return `<div class="result-row"><div class="result-head"><strong>${escapeHtml(p.title)}</strong><span>${n} vote(s) · ${percent}%</span></div><div class="bar"><span style="width:${percent}%"></span></div></div>`;
  }).join("");
}

function startFirebase() {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  auth.getRedirectResult().catch(err => {
  voteMessage.textContent = "Erreur de connexion : " + err.message;
});

  db.collection("projects").orderBy("createdAt", "asc").onSnapshot(snapshot => {
    renderProjects(snapshot.docs.map(d => ({id:d.id, ...d.data()})));
    refreshVotes();
  }, err => console.error(err));

  auth.onAuthStateChanged(async user => {
    currentUser = user;
    if (user) {
      authStatus.textContent = `Connecté : ${user.email || "compte Google"}`;
      loginBtn.textContent = "Déconnexion";
      voteArea.hidden = false;
      const existing = await db.collection("votes").doc(user.uid).get();
      if (existing.exists) {
        voteMessage.textContent = "Votre vote a déjà été enregistré. Merci !";
        voteBtn.disabled = true;
        projectSelect.disabled = true;
      } else {
        voteMessage.textContent = "Vous pouvez choisir une proposition.";
      }
    } else {
      authStatus.textContent = "Vous n'êtes pas encore connecté.";
      loginBtn.textContent = "Se connecter avec Google";
      voteArea.hidden = true;
    }
  });
  refreshVotes();
}

async function refreshVotes() {
  if (!db) return;
  const snapshot = await db.collection("votes").get();
  renderResults(snapshot.docs.map(d => d.data()));
}

loginBtn.addEventListener("click", async () => {
  if (!configured) {
    alert("La configuration Firebase n'est pas encore ajoutée. Consultez le fichier README.md.");
    return;
  }
  try {
    if (currentUser) await auth.signOut();
    else await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  } catch (e) { voteMessage.textContent = "Connexion impossible : " + e.message; }
});

voteBtn.addEventListener("click", async () => {
  if (!currentUser || !projectSelect.value) {
    voteMessage.textContent = "Connectez-vous et choisissez un projet.";
    return;
  }
  voteBtn.disabled = true;
  try {
    await db.collection("votes").doc(currentUser.uid).set({
      projectId: projectSelect.value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    voteMessage.textContent = "Votre vote a été enregistré. Merci pour votre participation !";
    projectSelect.disabled = true;
    await refreshVotes();
  } catch (e) {
    voteMessage.textContent = "Le vote n'a pas pu être enregistré : " + e.message;
    voteBtn.disabled = false;
  }
});

if (configured) startFirebase();
else renderProjects(demoProjects);
