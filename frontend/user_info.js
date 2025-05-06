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
  
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      document.getElementById("usuario").innerText = "No estás autenticado.";
      return;
    }
  
    const doc = await db.collection("users").doc(user.uid).get();
    if (!doc.exists) {
      document.getElementById("usuario").innerText = "Usuario no encontrado.";
      return;
    }
  
    const datos = doc.data();
    document.getElementById("usuario").innerText = `Hola ${datos.nombre}, Rol: ${datos.role}`;
  });
  