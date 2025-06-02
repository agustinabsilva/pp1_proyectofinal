// Verificar si ya existe una instancia de Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

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
      // Actualizar el nombre en la bienvenida si existe el elemento
      const nombreUsuarioElement = document.getElementById("nombre-usuario");
      if (nombreUsuarioElement) {
        const nombreCompleto = datos.nombre || "Usuario";
        const primerNombre = nombreCompleto.split(' ')[0];
        nombreUsuarioElement.textContent = primerNombre;
      }
      
      // Actualizar el resto de los campos del perfil si existen
      const userNombreElement = document.getElementById("user-nombre");
      if (userNombreElement) {
        document.getElementById("user-nombre").textContent = datos.nombre || "Sin nombre";
        document.getElementById("user-email").textContent = datos.email || user.email || "Sin email";
        document.getElementById("user-rol").textContent = datos.role || "Sin rol";
        document.getElementById("user-area").textContent = datos.area || "Sin área";
        document.getElementById("user-jerarquia").textContent = datos.jerarquia || "Sin jerarquía";
      }
    } else {
      console.log('No se encontró el documento del usuario');
      const nombreUsuarioElement = document.getElementById("nombre-usuario");
      if (nombreUsuarioElement) {
        nombreUsuarioElement.textContent = "Usuario";
      }
    }
  } else {
    console.log('No hay usuario autenticado');
    // No redirigir si ya estamos en la página de login
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = './login.html';
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

// Guardar autoevaluación con fecha y nombre
const formAuto = document.getElementById('form-autoevaluacion');
if (formAuto) {
  formAuto.addEventListener('submit', async function(e) {
    e.preventDefault();
    const fecha = document.getElementById('fecha-autoevaluacion').value;
    const desempeno = document.getElementById('desempeno').value;
    const satisfaccion = document.getElementById('satisfaccion').value;
    const comentario = document.getElementById('comentario').value;
    
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        // Obtener el nombre del usuario desde la colección users
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        let nombre = "";
        if (userDoc.exists) {
          nombre = userDoc.data().nombre || "";
        }
        
        // Verificar si ya existe autoevaluación este mes
        const [anioSeleccionado, mesSeleccionado] = fecha.split('-');
        const querySnapshot = await firebase.firestore()
          .collection('autoevaluaciones')
          .where('uid', '==', user.uid)
          .get();
        
        let yaExiste = false;
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.fecha) {
            const [anio, mes] = data.fecha.split('-');
            if (anio === anioSeleccionado && mes === mesSeleccionado) {
              yaExiste = true;
            }
          }
        });
        
        if (yaExiste) {
          Swal.fire({
            title: "Ya realizaste tu autoevaluación este mes",
            text: "Por favor, vuelve el próximo mes para realizar una nueva autoevaluación.",
            icon: "info",
            confirmButtonColor: "#b88b66"
          });
          return;
        }
        
        await firebase.firestore().collection('autoevaluaciones').add({
          uid: user.uid,
          nombre: nombre,
          fecha: fecha,
          desempeno: desempeno,
          satisfaccion: satisfaccion,
          comentario: comentario,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        Swal.fire({
          title: "¡Tu feedback fue recibido correctamente!",
          imageUrl: "./assets/capiok.png",
          imageHeight: 100,
          confirmButtonColor: "#b88b66"
        });
        formAuto.reset();
      } else {
        Swal.fire({
          title: "Error",
          text: "Debes estar logueado para guardar la autoevaluación.",
          icon: "error",
          confirmButtonColor: "#b88b66"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Error al guardar la autoevaluación: " + err.message,
        icon: "error",
        confirmButtonColor: "#b88b66"
      });
    }
  });
}