document.addEventListener('DOMContentLoaded', () => {

  // --- 1. TEMA VE PROFİL AYARLARI ---
  const settingsModal = document.getElementById('settings-modal');
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const userNameInput = document.getElementById('user-name-input');
  const blurRange = document.getElementById('blur-range');
  const blurValText = document.getElementById('blur-val');
  const colorBtns = document.querySelectorAll('.color-btn');
  const welcomeText = document.getElementById('welcome-text');

  let selectedColor = localStorage.getItem('theme_color') || '#8b5cf6';

  function applyTheme(color, blur) {
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--bg-blur', `${blur}px`);
  }

  function loadSettings() {
    const savedName = localStorage.getItem('user_name') || 'Kral';
    const savedBlur = localStorage.getItem('theme_blur') || '12';
    
    if (userNameInput) userNameInput.value = savedName;
    if (welcomeText) welcomeText.innerText = `Hoş geldin, ${savedName}!`;
    if (blurRange) {
      blurRange.value = savedBlur;
      blurValText.innerText = `${savedBlur}px`;
    }
    applyTheme(selectedColor, savedBlur);
  }

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = btn.getAttribute('data-color');
      colorBtns.forEach(b => b.style.borderColor = 'transparent');
      btn.style.borderColor = '#ffffff';
    });
  });

  if (blurRange) {
    blurRange.addEventListener('input', (e) => {
      blurValText.innerText = `${e.target.value}px`;
    });
  }

  if (openSettingsBtn) openSettingsBtn.onclick = () => settingsModal.classList.remove('hidden');
  if (closeSettingsBtn) closeSettingsBtn.onclick = () => settingsModal.classList.add('hidden');

  if (saveSettingsBtn) {
    saveSettingsBtn.onclick = () => {
      const name = userNameInput.value.trim() || 'Kral';
      const blur = blurRange.value;

      localStorage.setItem('user_name', name);
      localStorage.setItem('theme_color', selectedColor);
      localStorage.setItem('theme_blur', blur);

      applyTheme(selectedColor, blur);
      welcomeText.innerText = `Hoş geldin, ${name}!`;
      settingsModal.classList.add('hidden');
    };
  }

  // --- 2. SOUND MIXER (SES STÜDYOSU) ---
  // Telifsiz Web Audio Sentezleyicisi (İnternetsiz/Dahili Çalışır)
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const soundNodes = {};

  function createNoiseNode() {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    return whiteNoise;
  }

  document.querySelectorAll('.sound-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
      if (audioContext.state === 'suspended') audioContext.resume();
      
      const soundType = e.target.getAttribute('data-sound');
      const val = parseFloat(e.target.value);

      if (!soundNodes[soundType]) {
        const noise = createNoiseNode();
        const gainNode = audioContext.createGain();
        noise.connect(gainNode);
        gainNode.connect(audioContext.destination);
        noise.start();
        soundNodes[soundType] = gainNode;
      }

      soundNodes[soundType].gain.setValueAtTime(val * 0.15, audioContext.currentTime);
    });
  });

  document.getElementById('toggle-all-audio').onclick = () => {
    document.querySelectorAll('.sound-slider').forEach(s => {
      s.value = 0;
      s.dispatchEvent(new Event('input'));
    });
  };

  // --- 3. LİRİK & NOT DEFTERİ ---
  const studioNotes = document.getElementById('studio-notes');
  const saveNotesBtn = document.getElementById('save-notes-btn');

  if (studioNotes) studioNotes.value = localStorage.getItem('studio_notes') || '';
  if (saveNotesBtn) {
    saveNotesBtn.onclick = () => {
      localStorage.setItem('studio_notes', studioNotes.value);
      alert('Lirik ve notlar kaydedildi! 📝');
    };
  }

  // --- 4. FOCUS TIMER ---
  let timerInterval = null;
  let timeLeft = 25 * 60;
  const timerDisplay = document.getElementById('timer-display');

  function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${mins}:${secs}`;
  }

  document.getElementById('start-timer').onclick = () => {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        alert('Odak süresi doldu!');
      }
    }, 1000);
  };

  document.getElementById('pause-timer').onclick = () => {
    clearInterval(timerInterval);
    timerInterval = null;
  };

  document.getElementById('reset-timer').onclick = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimerDisplay();
  };

  // --- 5. DRAG & DROP (SÜRÜKLE-BIRAK SIRALAMA) ---
  const grid = document.getElementById('dashboard-grid');
  const draggables = document.querySelectorAll('.draggable-card');

  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => draggable.classList.add('dragging'));
    draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));
  });

  grid.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(grid, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
      grid.appendChild(draggable);
    } else {
      grid.insertBefore(draggable, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  loadSettings();
});
