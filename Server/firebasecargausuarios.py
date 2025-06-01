import firebase_admin
from firebase_admin import credentials, auth, firestore
import json

# Inicializar Firebase
cred = credentials.Certificate("firebase-service.json")
firebase_admin.initialize_app(cred)

# Conexión a Firestore
db = firestore.client()

# Leer lista de usuarios desde el archivo JSON
with open("usuarios.json", "r", encoding="utf-8") as f:
    usuarios_lista = json.load(f)

# Crear un índice para buscar rápidamente por email
usuarios_por_email = {usuario["email"]: usuario for usuario in usuarios_lista}

# Obtener todos los usuarios desde Firebase Authentication
page = auth.list_users()
while page:
    for user in page.users:
        email = user.email
        uid = user.uid
        if email in usuarios_por_email:
            datos = usuarios_por_email[email]

            # Construimos el objeto a guardar, usando UID como ID
            usuario_firestore = {
                "nombre": datos["nombre"],
                "email": email,
                "activo": not user.disabled,  # Usamos el estado real del auth
                "area": datos["area"],
                "jerarquia": datos["jerarquia"],
                "role": datos["role"]
            }

            # Guardar en Firestore bajo la colección "users"
            db.collection("users").document(uid).set(usuario_firestore)
            print(f"✅ Usuario {email} sincronizado en Firestore con UID {uid}")
        else:
            print(f"⚠️ Usuario {email} no encontrado en usuarios.json")

    # Paginación de usuarios
    page = page.get_next_page()
