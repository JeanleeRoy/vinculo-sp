import { extractMessageIdFromUrl } from './utils/route.utils.js';
import { fetchMessageById, NotFoundError } from './services/message.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const stage = document.getElementById('stage');
  const envelope = document.getElementById('envelope');
  const bouquet = document.getElementById('bouquet');
  const messageEl = document.getElementById('message');
  const greetingEl = document.getElementById('nombre');
  const subCaptionEl = document.getElementById('sub-caption');
  const dateEl = document.getElementById('message-date');

  // Extract ID from URL path (e.g. /01a0c612-e632-7616-b163-6fc3a43b2eae or ?id=...)
  const messageId = extractMessageIdFromUrl();

  // If a message ID is in the path or query, fetch from backend API
  if (messageId) {
    try {
      const data = await fetchMessageById(messageId);
      
      // Inject message content into the letter
      if (greetingEl && data.message) {
        greetingEl.textContent = data.message;
      }
      if (subCaptionEl) {
        subCaptionEl.textContent = data.sub_caption || '— con cariño, un regalo de Vínculo 🌻';
      }
      if (dateEl && data.date) {
        const parsedDate = new Date(data.date);
        dateEl.textContent = parsedDate.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }

      // Revelar la carta suavemente solo cuando los datos estén listos
      if (stage) {
        stage.style.opacity = '';
        stage.classList.add('ready');
      }
    } catch (err) {
      console.warn('[Vínculo] Error o mensaje no encontrado. Redirigiendo a 404...', err);
      window.location.replace('/404.html');
      return;
    }
  } else {
    // Si estamos en la vista de mensaje (/m) y no hay ID válido, redirigir a 404 sin mostrar nada
    if (window.location.pathname.includes('/m') || window.location.pathname.endsWith('m.html')) {
      console.warn('[Vínculo] No se especificó un ID de mensaje en /m/. Redirigiendo a 404...');
      window.location.replace('/404.html');
      return;
    }

    // Fallback de desarrollo para pruebas locales con query (?nombre=)
    const params = new URLSearchParams(window.location.search);
    const legacyNombre = params.get('nombre') || params.get('n');
    if (legacyNombre && greetingEl) {
      greetingEl.textContent = `¡Feliz día, ${legacyNombre.trim().slice(0, 40)}!`;
    }
    if (stage) {
      stage.style.opacity = '';
      stage.classList.add('ready');
    }
  }

  // Setup del motor anatómico de animación de flores
  if (typeof window.MotorAnatomico === 'function' && window.ANATOMIA_FLORES_AMARILLAS) {
    const motor = new window.MotorAnatomico(window.ANATOMIA_FLORES_AMARILLAS, bouquet);
    motor.init();

    function abrir() {
      if (stage.classList.contains('opened')) return;
      stage.classList.add('opened');
      lanzarParticulas(motor);
      // Desvanece el sobre y arranca el dibujado progresivo del ramo
      setTimeout(() => motor.play(), 1100);
    }

    envelope.addEventListener('click', abrir);
    envelope.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        abrir();
      },
      { passive: false },
    );
  }

  function lanzarParticulas(motor) {
    const cont = document.getElementById('particles');
    if (!cont) return;

    const totalMs = (motor ? motor.duracionTotalMs() : 3500) + 1100;
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 4 + Math.random() * 8;
      p.style.width = p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.setProperty('--drift', `${Math.random() * 80 - 40}px`);
      p.style.animationDuration = `${6 + Math.random() * 6}s`;
      p.style.animationDelay = `${totalMs / 1000 - 0.5 + Math.random() * 4}s`;
      cont.appendChild(p);
    }

    // Revelar mensaje al final de la coreografía
    setTimeout(() => {
      if (messageEl) {
        messageEl.classList.add('visible');
      }
    }, totalMs - 200);
  }
});
