const firebaseConfig = {
  apiKey: "AIzaSyD8hM7BCiuvqvHvBXbKXmjJnVjMGMbwN7M",
  authDomain: "ainabi-dev.firebaseapp.com",
  projectId: "ainabi-dev",
  storageBucket: "ainabi-dev.firebasestorage.app",
  messagingSenderId: "555009125594",
  appId: "1:555009125594:web:133bfe3a2bd6fc498749e3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Verificar que el usuario esté logueado y sea admin
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Debés estar logueado.");
    window.location.href = "index.html";
    return;
  }

  const doc = await db.collection("users").doc(user.uid).get();
  if (!doc.exists || doc.data().role !== "admin") {
    alert("Acceso no autorizado.");
    window.location.href = "index.html";
    return;
  }

  cargarUsuarios();
});

async function cargarUsuarios() {
  const tabla = document.querySelector("#tablaUsuarios tbody");
  const snap = await db.collection("users").get();

  snap.forEach((doc) => {
    const u = doc.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.nombre}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.activo ? "Sí" : "No"}</td>
      <td><button onclick="toggleActivo('${doc.id}', ${u.activo})">
        ${u.activo ? "Desactivar" : "Activar"}</button></td>
    `;

    tabla.appendChild(tr);
  });
}

async function toggleActivo(uid, actual) {
  await db.collection("users").doc(uid).update({ activo: !actual });
  window.location.reload();
}
