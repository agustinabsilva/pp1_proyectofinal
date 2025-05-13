
  function mostrarSeccion(id) {
    // Oculta todas las secciones
    document.querySelectorAll('main section').forEach(seccion => {
      seccion.style.display = 'none';
    });

    // Muestra la sección solicitada
    const seccionMostrar = document.getElementById(id);
    if (seccionMostrar) {
      seccionMostrar.style.display = 'block';
    }

    // Cambiar clases activas en el sidebar
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.target.closest('.nav-link').classList.add('active');
  }

  // Mostrar sección de inicio al cargar
  window.addEventListener('DOMContentLoaded', () => {
    mostrarSeccion('inicio');
  });
