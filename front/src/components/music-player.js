/**
 * REPRODUCTOR VINILO — Floricienta (Flores Amarillas)
 * ----------------------------------------------------
 * Carga el audio de YouTube de forma transparente, inicia automáticamente al cargar
 * la data del mensaje y gestiona el estado interactivo del disco vinilo.
 */

const YT_VIDEO_ID = 'gv63CGCx6vg';
let playerInstance = null;
let isPlaying = false;
let isInitialized = false;

function sendYtCommand(func, args = []) {
  const iframe = document.getElementById('yt-player-frame');
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: func,
          args: args,
        }),
        '*',
      );
    } catch (_) {}
  }
}

function loadYouTubeIframeApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      return resolve(window.YT);
    }
    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousOnReady === 'function') previousOnReady();
      resolve(window.YT);
    };
    if (!document.getElementById('yt-iframe-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  });
}

function setPlayingState(playing) {
  isPlaying = playing;
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
  if (!isInitialized) return;

  if (playerInstance && typeof playerInstance.playVideo === 'function') {
    try {
      playerInstance.unMute();
      playerInstance.playVideo();
    } catch (_) {}
  }

  // Respaldo inmediato vía postMessage directo al iframe
  sendYtCommand('unMute');
  sendYtCommand('playVideo');
}

export async function initMusicPlayer() {
  if (isInitialized) {
    ensureMusicPlaying();
    return;
  }

  const vinylPlayer = document.getElementById('vinyl-player');
  const ytContainer = document.getElementById('yt-audio-container');

  if (!vinylPlayer || !ytContainer) return;

  isInitialized = true;

  // 1. Mostrar el disco vinilo
  vinylPlayer.classList.add('visible');

  // 2. Inyectar iframe con allow="autoplay" para autorizar la reproducción
  ytContainer.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.id = 'yt-player-frame';
  iframe.width = '1';
  iframe.height = '1';
  iframe.title = 'Audio Flores Amarillas';
  iframe.setAttribute('allow', 'autoplay; encrypted-media');
  iframe.style.border = 'none';

  const originParam = window.location.origin
    ? `&origin=${encodeURIComponent(window.location.origin)}`
    : '';
  iframe.src = `https://www.youtube-nocookie.com/embed/${YT_VIDEO_ID}?enablejsapi=1&autoplay=1&playsinline=1&controls=0&disablekb=1&fs=0&loop=1&playlist=${YT_VIDEO_ID}${originParam}`;

  ytContainer.appendChild(iframe);

  // 3. Escuchar mensajes del iframe para sincronizar el giro del disco en tiempo real
  window.addEventListener('message', (event) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (data && data.event === 'onStateChange') {
        if (data.info === 1) {
          // YT.PlayerState.PLAYING
          setPlayingState(true);
        } else if (data.info === 2 || data.info === 0) {
          // YT.PlayerState.PAUSED o ENDED
          setPlayingState(false);
        }
      }
    } catch (_) {}
  });

  // 4. Intentar reproducir de inmediato
  iframe.addEventListener('load', () => {
    setTimeout(() => {
      ensureMusicPlaying();
    }, 100);
  });

  // 5. Cargar API oficial para control completo (pausa / play)
  try {
    const YT = await loadYouTubeIframeApi();
    playerInstance = new YT.Player('yt-player-frame', {
      events: {
        onReady: (event) => {
          try {
            event.target.unMute();
            event.target.playVideo();
          } catch (_) {}
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            setPlayingState(true);
          } else if (
            event.data === YT.PlayerState.PAUSED ||
            event.data === YT.PlayerState.ENDED
          ) {
            setPlayingState(false);
          }
        },
      },
    });
  } catch (err) {
    console.warn('[Vínculo] Fallback activo para YouTube IFrame', err);
  }

  // 6. Si el navegador retiene el autoplay por política de interacción,
  // cualquier primer toque o clic en la pantalla iniciará el audio sin tener que tocar el disco.
  const handleFirstGesture = () => {
    if (!isPlaying) {
      ensureMusicPlaying();
    }
  };

  window.addEventListener('click', handleFirstGesture, { passive: true });
  window.addEventListener('touchstart', handleFirstGesture, { passive: true });
  window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
  window.addEventListener('keydown', handleFirstGesture, { passive: true });

  // 7. Toggle manual de reproducción al tocar el disco vinilo
  const togglePlayback = (e) => {
    e.stopPropagation();

    if (isPlaying) {
      if (playerInstance && typeof playerInstance.pauseVideo === 'function') {
        playerInstance.pauseVideo();
      }
      sendYtCommand('pauseVideo');
      setPlayingState(false);
    } else {
      ensureMusicPlaying();
      setPlayingState(true);
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
