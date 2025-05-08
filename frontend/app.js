
const firebaseConfig = {
  apiKey: "AIzaSyD8hM7BCiuvqvHvBXbKXmjJnVjMGMbwN7M",
  authDomain: "ainabi-dev.firebaseapp.com",
  projectId: "ainabi-dev",
  storageBucket: "ainabi-dev.firebasestorage.app",
  messagingSenderId: "555009125594",
  appId: "1:555009125594:web:133bfe3a2bd6fc498749e3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

async function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const resultado = document.getElementById("resultado");

  try {
    const cred = await auth.signInWithEmailAndPassword(email, pass);
    const uid = cred.user.uid;

    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
      resultado.innerText = "Usuario sin datos registrados.";
      return;
    }

    const datos = doc.data();

    if (datos.activo === false) {
      resultado.innerText = "Tu cuenta está desactivada. Contactá al administrador.";
      auth.signOut();
      return;
    }

    const rol = datos.role;
    resultado.innerText = `Bienvenido ${datos.nombre} (${rol})`;

    switch (rol) {
      case "admin":
        window.location.href = "dashboard_admin.html";
        break;
      case "supervisor":
        window.location.href = "supervisor.html";
        break;
      case "empleado":
        window.location.href = "empleado.html";
        break;
      case "analista":
        window.location.href = "analista.html";
        break;
      default:
        resultado.innerText = "Rol no reconocido.";
    }

  } catch (e) {
    resultado.innerText = `Error: ${e.message}`;
  }
}


