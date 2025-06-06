// Verificar si ya existe una instancia de Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

async function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  if (!email || !pass) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor ingresa tu email y contraseña",
      confirmButtonColor: "#b88b66"
    });
    return;
  }

  try {
    console.log("Intentando iniciar sesión...");
    const cred = await auth.signInWithEmailAndPassword(email, pass);
    const uid = cred.user.uid;

    console.log("Usuario autenticado:", cred.user.email);

    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
      console.log("No se encontraron datos del usuario");
      Swal.fire({
        icon: "error",
        title: "Usuario no encontrado",
        text: "No se encontraron datos registrados para este usuario.",
        confirmButtonColor: "#b88b66"
      });
      await auth.signOut();
      return;
    }

    const datos = doc.data();
    console.log("Datos del usuario:", datos);

    if (datos.activo === false) {
      console.log("Cuenta desactivada");
      Swal.fire({
        icon: "warning",
        title: "Cuenta desactivada",
        text: "Tu cuenta está inactiva. Comunicate con el administrador.",
        confirmButtonColor: "#b88b66"
      });

      await auth.signOut();
      return;
    }

    const rol = datos.role;
    console.log("Rol del usuario:", rol);
    
    Swal.fire({
      icon: "success",
      title: `Bienvenido ${datos.nombre}`,
      text: `Rol: ${rol}`,
      confirmButtonColor: "#b88b66",
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      // Redirigir según el rol
      let redirectUrl;
      switch(rol) {
        case 'Admin':
          redirectUrl = './dashboard_admin.html';
          break;
        case 'Analista':
          redirectUrl = './dashboard_analista.html';
          break;
        case 'Supervisor':
          redirectUrl = './supervisor.html';
          break;
        case 'Empleado':
          redirectUrl = './empleado.html';
          break;
        default:
          console.error('Rol no reconocido:', rol);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Rol no reconocido. Contacta al administrador.",
            confirmButtonColor: "#b88b66"
          });
          return;
      }
      console.log("Redirigiendo a:", redirectUrl);
      window.location.href = redirectUrl;
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    let mensajeError = "Error al iniciar sesión. Por favor, intenta nuevamente.";
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      mensajeError = "Email o contraseña incorrectos.";
    }
    
    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensajeError,
      confirmButtonColor: "#b88b66"
    });
  }
}

// Solo agregar el event listener si estamos en la página de login
const loginForm = document.querySelector('form');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    login();
  });
}

// Manejar el cierre de sesión
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', async function(e) {
    e.preventDefault();
    try {
      await auth.signOut();
      window.location.href = './login.html';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cerrar la sesión. Por favor, intenta nuevamente.",
        confirmButtonColor: "#b88b66"
      });
    }
  });
}

//Perfil
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const doc = await db.collection("users").doc(user.uid).get();
      if (doc.exists) {
        const datos = doc.data();
        
        // Actualizar el nombre en la bienvenida si existe el elemento
        const nombreUsuarioElement = document.getElementById("nombre-usuario");
        if (nombreUsuarioElement) {
          const nombreCompleto = datos.nombre || "Usuario";
          const primerNombre = nombreCompleto.split(' ')[0];
          nombreUsuarioElement.textContent = primerNombre;
        }
        
        // Actualizar campos del perfil si existen
        const userNombreElement = document.getElementById("user-nombre");
        if (userNombreElement) {
          userNombreElement.textContent = datos.nombre || "Sin nombre";
          document.getElementById("user-rol").textContent = datos.role || "Sin rol";
          document.getElementById("user-area").textContent = datos.area || "Sin área";
          document.getElementById("user-jerarquia").textContent = datos.jerarquia || "Sin jerarquía";
          document.getElementById("user-email").textContent = datos.email || user.email || "Sin email";
          
          // Actualizar estado activo
          const userActivoElement = document.getElementById("user-activo");
          if (userActivoElement) {
            if (typeof datos.activo !== "undefined") {
              userActivoElement.textContent = datos.activo ? "Activo" : "Inactivo";
              userActivoElement.style.background = datos.activo ? "#e6f5d0" : "#f5e6e6";
              userActivoElement.style.color = datos.activo ? "#4d6a3a" : "#a94442";
            } else {
              userActivoElement.textContent = "Sin dato";
              userActivoElement.style.background = "#f5e6e6";
              userActivoElement.style.color = "#a94442";
            }
          }
        }
      } else {
        console.log('No se encontró el documento del usuario');
        const nombreUsuarioElement = document.getElementById("nombre-usuario");
        if (nombreUsuarioElement) {
          nombreUsuarioElement.textContent = "Usuario";
        }
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los datos del perfil',
        icon: 'error',
        confirmButtonColor: '#b88b66'
      });
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