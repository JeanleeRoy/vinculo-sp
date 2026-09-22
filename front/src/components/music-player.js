/**
 * REPRODUCTOR VINILO
 * ----------------------------------------------------
 * Reproducción nativa con HTML5 <audio>, desbloqueo confiable en iOS Safari
 * y soporte para orígenes locales o remotos (CDN / Cloud Storage).
 */

let audioElement = null;
let isInitialized = false;

/**
 * Resuelve la URL de cualquier pista de audio para páginas o eventos futuros.
 * - Si se define VITE_AUDIO_CDN_URL (o VITE_CDN_BASE_URL), se antepone la CDN al recurso.
 * - Si no, se resuelve de forma local: /audio/{track}.
 * - Si se pasa una URL absoluta (http/https), se respeta tal cual.
 *
 * @param {string} [track='flores-amarillas.mp3'] - Nombre de archivo o ruta (ej. 'navidad.mp3', 'eventos/boda.mp3')
 * @returns {string} URL final del audio
 */
export function getAudioSourceUrl(track = 'flores-amarillas.mp3') {
  if (!track) track = 'flores-amarillas.mp3';

  // Si ya es una URL absoluta externa, se utiliza de inmediato
  if (/^https?:\/\//i.test(track)) {
    return track;
  }

  // Normalizar ruta asegurando el prefijo audio/
  const cleanTrack = track.replace(/^\/+/, '');
  const relativePath = cleanTrack.startsWith('audio/') ? cleanTrack : `audio/${cleanTrack}`;

  const cdnBase = import.meta.env?.VITE_AUDIO_CDN_URL || import.meta.env?.VITE_CDN_BASE_URL;
  if (cdnBase) {
    return `${cdnBase.replace(/\/+$/, '')}/${relativePath}`;
  }

  return `/${relativePath}`;
}


function setPlayingState(playing) {
  const vinylPlayer = document.getElementById('vinyl-player');
  if (!vinylPlayer) return;

  if (playing) {
    vinylPlayer.classList.add('playing');
    vinylPlayer.classList.remove('paused');
  } else {
    vinylPlayer.classList.remove('playing');
    vinylPlayer.classList.add('paused');
  }
}

export function ensureMusicPlaying() {
  if (!isInitialized) {
    initMusicPlayer();
  }
  if (!audioElement) return;

  if (audioElement.paused) {
    const playPromise = audioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // En iOS Safari y navegadores con autoplay restringido,
        // la reproducción se desbloqueará en el primer gesto del usuario.
        console.debug('[Vínculo] Autoplay en espera de interacción del usuario:', err.name);
      });
    }
  }
}

export function initMusicPlayer(trackOptions = 'flores-amarillas.mp3') {
  const track = typeof trackOptions === 'string'
    ? trackOptions
    : (trackOptions?.track || 'flores-amarillas.mp3');

  if (isInitialized) {
    if (audioElement) {
      const audioSrc = getAudioSourceUrl(track);
      if (audioElement.src !== audioSrc && !audioElement.src.endsWith(audioSrc)) {
        audioElement.src = audioSrc;
        audioElement.load();
      }
    }
    return;
  }

  const vinylPlayer = document.getElementById('vinyl-player');
  if (!vinylPlayer) return;

  isInitialized = true;

  // 1. Mostrar el disco vinilo
  vinylPlayer.classList.add('visible');

  // 2. Obtener o crear elemento nativo <audio>
  let audio = document.getElementById('bg-audio');
  if (!audio) {
    audio = new Audio();
    audio.id = 'bg-audio';
    audio.preload = 'auto';
    audio.loop = true;
    audio.setAttribute('playsinline', '');
    document.body.appendChild(audio);
  }

  const audioSrc = getAudioSourceUrl(track);
  if (audio.src !== audioSrc && !audio.src.endsWith(audioSrc)) {
    audio.src = audioSrc;
  }
  audio.loop = true;

  audioElement = audio;

  // 3. Sincronizar el estado visual del vinilo con los eventos nativos de audio
  audio.addEventListener('play', () => setPlayingState(true));
  audio.addEventListener('pause', () => setPlayingState(false));
  audio.addEventListener('ended', () => setPlayingState(false));
  audio.addEventListener('error', (e) => {
    console.warn('[Vínculo] Error al reproducir audio desde:', audio.src, e);
  });

  // 4. Iniciar en estado pausado (sin autoplay); la reproducción iniciará solo con un gesto o clic
  setPlayingState(false);

  // 5. Reproducción al primer gesto o clic del usuario (pantalla, móvil o teclado)

  const handleFirstGesture = () => {
    if (audioElement && audioElement.paused) {
      ensureMusicPlaying();
    }
  };

  const gestureOptions = { passive: true };
  const removeGestureListeners = () => {
    window.removeEventListener('click', handleFirstGesture, gestureOptions);
    window.removeEventListener('touchstart', handleFirstGesture, gestureOptions);
    window.removeEventListener('pointerdown', handleFirstGesture, gestureOptions);
    window.removeEventListener('keydown', handleFirstGesture, gestureOptions);
  };

  window.addEventListener('click', handleFirstGesture, gestureOptions);
  window.addEventListener('touchstart', handleFirstGesture, gestureOptions);
  window.addEventListener('pointerdown', handleFirstGesture, gestureOptions);
  window.addEventListener('keydown', handleFirstGesture, gestureOptions);

  // Una vez que comience a reproducir exitosamente, remover los listeners globales
  audio.addEventListener('play', removeGestureListeners, { once: true });

  // 6. Control manual de reproducción / pausa al interactuar con el vinilo
  const togglePlayback = (e) => {
    e.stopPropagation();
    if (!audioElement) return;

    if (!audioElement.paused) {
      audioElement.pause();
    } else {
      ensureMusicPlaying();
    }
  };

  vinylPlayer.addEventListener('click', togglePlayback);
  vinylPlayer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePlayback(e);
    }
  });
}
