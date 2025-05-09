// Archivo script.js

document.addEventListener('DOMContentLoaded', function () {
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');

    menuIcon.addEventListener('click', function () {
        navLinks.classList.toggle('active');
    });

    // Scroll Reveal Animations
    const scrollElements = document.querySelectorAll('.scroll-reveal');

    const elementInView = (el, offset = 100) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= (window.innerHeight || document.documentElement.clientHeight) - offset
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add('visible');
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el)) {
                displayScrollElement(el);
            }
        });
    };

    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    });
});

  document.getElementById('btn-ver-mas').addEventListener('click', function () {
    const extra = document.getElementById('extra-info');
    if (extra.style.display === 'none') {
      extra.style.display = 'block';
      this.textContent = 'Ver menos';
    } else {
      extra.style.display = 'none';
      this.textContent = 'Ver más';
    }
  });


  document.getElementById('form-contacto').addEventListener('submit', function (e) {
    e.preventDefault(); // evita envío real
    const toast = new bootstrap.Toast(document.getElementById('toastSuccess'));
    toast.show();

    // Opcional: limpiar el formulario
    this.reset();
  });
