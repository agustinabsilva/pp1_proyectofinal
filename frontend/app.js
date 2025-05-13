
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
      Swal.fire({
        icon: "error",
        title: "Usuario no encontrado",
        text: "No se encontraron datos registrados para este usuario.",
        confirmButtonColor: "#b88b66"
      });      
      /*resultado.innerText = "Usuario sin datos registrados.";*/
      return;
    }

    const datos = doc.data();

    if (datos.activo === false) {
      Swal.fire({
        icon: "warning",
        title: "Cuenta desactivada",
        text: "Tu cuenta está inactiva. Comunicate con el administrador.",
        confirmButtonColor: "#b88b66"
      });

      /*resultado.innerText = "Tu cuenta está desactivada. Contactá al administrador.";*/

      auth.signOut();
      return;
    }

    const rol = datos.role;
     Swal.fire({
      icon: "success",
      title: `Bienvenido ${datos.nombre}`,
      text: `Rol: ${rol}`,
      confirmButtonColor: "#b88b66",
      timer: 4000,
      showConfirmButton: false
    });

    /*resultado.innerText = `Bienvenido ${datos.nombre} (${rol})`;*/
  setTimeout(() => {
      switch (rol) {
        case "Admin":
          window.location.href = "dashboard_admin.html";
          break;
        case "Supervisor":
          window.location.href = "supervisor.html";
          break;
        case "Empleado":
          window.location.href = "empleado.html";
          break;
        
        default:
          Swal.fire({
            icon: "error",
            title: "Rol no reconocido",
            text: "Comunicate con el administrador.",
            confirmButtonColor: "#b88b66"
          });
      }
    }, 2000);

  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error al iniciar sesión",
      text: "Usuario o contraseña no valida",
      confirmButtonColor: "#b88b66"
    });
  }
}

//Perfil
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const uid = user.uid;
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists) {
      const datos = doc.data();
      document.getElementById("user-nombre").textContent = datos.nombre || "Sin nombre";
      document.getElementById("user-dni").textContent = datos.dni || "Sin DNI";
      document.getElementById("user-email").textContent = datos.email || user.email || "Sin email";
      document.getElementById("user-rol").textContent = datos.role || "Sin rol";
      document.getElementById("user-area").textContent = datos.area || "Sin área";
      document.getElementById("user-jerarquia").textContent = datos.jerarquia || "Sin jerarquía";
    }
  }
});

document.addEventListener("DOMContentLoaded", function() {
  // KMeans GET
  const btnGetKMeans = document.getElementById("btn-get-kmeans");
  if (btnGetKMeans) {
    btnGetKMeans.addEventListener("click", async () => {
      const res = await fetch("http://localhost:5000/api/kmeans"); // Ajusta la URL
      const data = await res.json();
      document.getElementById("ml-resultados").textContent = JSON.stringify(data, null, 2);
    });
  }

  // KMeans POST
  const btnPostKMeans = document.getElementById("btn-post-kmeans");
  if (btnPostKMeans) {
    btnPostKMeans.addEventListener("click", async () => {
      const res = await fetch("http://localhost:5000/api/kmeans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ /* tus datos aquí */ })
      });
      const data = await res.json();
      document.getElementById("ml-resultados").textContent = JSON.stringify(data, null, 2);
    });
  }

  // Regresión Lineal GET
  const btnGetRegresion = document.getElementById("btn-get-regresion");
  if (btnGetRegresion) {
    btnGetRegresion.addEventListener("click", async () => {
      const res = await fetch("http://localhost:5000/api/regresion"); // Ajusta la URL
      const data = await res.json();
      document.getElementById("ml-resultados").textContent = JSON.stringify(data, null, 2);
    });
  }

  // Regresión Lineal POST
  const btnPostRegresion = document.getElementById("btn-post-regresion");
  if (btnPostRegresion) {
    btnPostRegresion.addEventListener("click", async () => {
      const res = await fetch("http://localhost:5000/api/regresion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ /* tus datos aquí */ })
      });
      const data = await res.json();
      document.getElementById("ml-resultados").textContent = JSON.stringify(data, null, 2);
    });
  }
});

async function ejecutarKMeans() {
  try {
    const response = await fetch('https://testkmeans.onrender.com/api/kmeans');
    const data = await response.json();
    
    const resultadosDiv = document.getElementById('resultados-kmeans');
    resultadosDiv.innerHTML = `
      <h5>Clusters Generados:</h5>
      <table class="table">
        <thead>
          <tr>
            <th>Cluster</th>
            <th>Miembros</th>
            <th>Centroide</th>
          </tr>
        </thead>
        <tbody>
          ${data.clusters.map((cluster, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${cluster.members.join(', ')}</td>
              <td>${JSON.stringify(cluster.centroid)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error:', error);
  }
}

function limpiarResultados() {
  document.getElementById('resultados-kmeans').innerHTML = '';
}