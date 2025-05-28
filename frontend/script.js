//Menu Responsive

document.addEventListener('DOMContentLoaded', function () {
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');

    menuIcon.addEventListener('click', function () {
        navLinks.classList.toggle('active');
    });
});


//Verifica el mail


document.addEventListener("DOMContentLoaded", function () {
  const btnEnviado = document.getElementById("btnEnviar");

  if (btnEnviado) {
    btnEnviado.addEventListener("click", function (e) {
      e.preventDefault(); // Evita el envío inmediato

      const form = document.getElementById("form-contacto");
      const emailInput = form.elements["email"];
      const email = emailInput.value.trim();

      // Expresión regular simple para validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Verificar email antes de continuar
      if (!emailRegex.test(email)) {
        Swal.fire({
          icon: "error",
          title: "Correo inválido",
          text: "Por favor ingresa un correo electrónico válido.",
          confirmButtonColor: "#b88b66",
        });
        return; // Detener ejecución si el email es inválido
      }

      // Si es válido, mostrar mensaje de éxito
      Swal.fire({
        title: "Enviado!",
        text: "Muchas gracias por contactarte",
        imageUrl: "./assets/capiok.png",
        imageWidth: 400,
        imageHeight: 400,
        imageAlt: "Custom image",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#b88b66",
      });

      // Limpiar el formulario
      if (form) {
        form.reset();
      }
    });
  }
});
 
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, {
      threshold: 0.1
    });

    elements.forEach(el => {
      el.style.animationPlayState = 'paused'; // para evitar que se animen antes de aparecer
      observer.observe(el);
    });
  };

  document.addEventListener('DOMContentLoaded', animateOnScroll);


  
