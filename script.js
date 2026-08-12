document.addEventListener('DOMContentLoaded', () => {

  // 1. CANLI HAVA DURUMU (Open-Meteo API)
  async function fetchWeather() {
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const data = await res.json();
        document.getElementById('weather-temp').innerText = Math.round(data.current_weather.temperature);
        document.getElementById('weather-desc').innerText = `Rüzgar: ${data.current_weather.windspeed} km/s`;
        document.getElementById('weather-city').innerText = "Konum Bazlı Canlı Veri";
      }, () => {
        document.getElementById('weather-desc').innerText = "Konum izni verilmedi.";
      });
    } catch {
      document.getElementById('weather-desc').innerText = "Hava durumu alınamadı.";
    }
  }

  // 2. CANLI FİNANS ANALİZİ (CoinGecko & Exchange API)
  async function fetchFinance() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd,try');
      const data = await res.json();
      document.getElementById('btc-price').innerText = `$${data.bitcoin.usd.toLocaleString()}`;
      document.getElementById('eth-price').innerText = `$${data.ethereum.usd.toLocaleString()}`;
      document.getElementById('usdt-price').innerText = `${data.tether.try.toFixed(2)} ₺`;
    } catch {
      document.getElementById('btc-price').innerText = "Veri Hatası";
    }
  }
  document.getElementById('refresh-finance').onclick = fetchFinance;

  // 3. GERÇEK SOUND MIXER
  const audioElements = {};
  document.querySelectorAll('.audio-slider').forEach(slider => {
    const src = slider.getAttribute('data-src');
    const audio = new Audio(src);
    audio.loop = true;
    audioElements[src] = audio;

    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      audio.volume = val;
      if (val > 0 && audio.paused) audio.play();
      if (val === 0) audio.pause();
    });
  });
  document.getElementById('stop-all-audio').onclick = () => {
    document.querySelectorAll('.audio-slider').forEach(s => {
      s.value = 0;
      s.dispatchEvent(new Event('input'));
    });
  };

  // 4. LYRIC BOOK & NOTLAR
  const notes = document.getElementById('studio-notes');
  const charCount = document.getElementById('char-count');
  notes.value = localStorage.getItem('v3_notes') || '';
  charCount.innerText = `${notes.value.length} Karakter`;
  notes.oninput = () => charCount.innerText = `${notes.value.length} Karakter`;
  document.getElementById('save-notes-btn').onclick = () => {
    localStorage.setItem('v3_notes', notes.value);
    updateStorageInfo();
    alert('Notlar kaydedildi!');
  };

  // 5. FOCUS TIMER
  let timerInterval = null;
  let timeLeft = 25 * 60;
  const timerDisplay = document.getElementById('timer-display');
  function updateTimer() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${m}:${s}`;
  }
  document.getElementById('start-timer').onclick = () => {
    if (!timerInterval) timerInterval = setInterval(() => { if (timeLeft > 0) { timeLeft--; updateTimer(); } }, 1000);
  };
  document.getElementById('pause-timer').onclick = () => { clearInterval(timerInterval); timerInterval = null; };
  document.getElementById('reset-timer').onclick = () => { clearInterval(timerInterval); timerInterval = null; timeLeft = 25 * 60; updateTimer(); };

  // 6. TASK MANAGER
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  let tasks = JSON.parse(localStorage.getItem('v3_tasks') || '[]');

  function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((t, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${t}</span> <button onclick="removeTask(${i})" style="color:red;background:none;border:none;cursor:pointer;">✕</button>`;
      taskList.appendChild(li);
    });
  }
  window.removeTask = (i) => { tasks.splice(i, 1); localStorage.setItem('v3_tasks', JSON.stringify(tasks)); renderTasks(); updateStorageInfo(); };
  document.getElementById('add-task-btn').onclick = () => {
    if (taskInput.value.trim()) {
      tasks.push(taskInput.value.trim());
      taskInput.value = '';
      localStorage.setItem('v3_tasks', JSON.stringify(tasks));
      renderTasks();
      updateStorageInfo();
    }
  };

  // 7. İLHAM AFORİZMALARI
  const quotes = [
    '"Büyük işler, küçük adımların istikrarıyla kurulur."',
    '"Ritim gürültüden doğar, disiplinle müziğe dönüşür."',
    '"Odaklanmak, hayır diyebilme sanatıdır."',
    '"Geleceği tahmin etmenin en iyi yolu onu inşa etmektir."'
  ];
  document.getElementById('next-quote').onclick = () => {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quote-text').innerText = q;
  };

  // 8. PING ANALİZİ
  document.getElementById('test-ping-btn').onclick = async () => {
    const start = Date.now();
    try {
      await fetch('https://www.google.com', { mode: 'no-cors' });
      const ping = Date.now() - start;
      document.getElementById('ping-val').innerText = `${ping} ms`;
    } catch {
      document.getElementById('ping-val').innerText = 'Test Edilemedi';
    }
  };

  // 9. DEPOLAMA ANALİZİ
  function updateStorageInfo() {
    const bytes = new Blob([JSON.stringify(localStorage)]).size;
    const kb = (bytes / 1024).toFixed(2);
    document.getElementById('storage-text').innerText = `${kb} KB Kullanılıyor`;
    document.getElementById('storage-bar').style.width = `${Math.min((kb / 50) * 100, 100)}%`;
  }

  // 10. HIZLI İŞLEMLER
  document.getElementById('clear-data-btn').onclick = () => {
    if (confirm('Tüm veriler silinsin mi?')) { localStorage.clear(); location.reload(); }
  };
  document.getElementById('fullscreen-btn').onclick = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  // TEMA & AYARLAR
  const modal = document.getElementById('settings-modal');
  document.getElementById('open-settings-btn').onclick = () => modal.classList.remove('hidden');
  document.getElementById('close-settings').onclick = () => modal.classList.add('hidden');
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.onclick = () => {
      const color = btn.getAttribute('data-color');
      document.documentElement.style.setProperty('--primary-color', color);
      localStorage.setItem('v3_color', color);
    };
  });

  // BAŞLANGIÇ
  fetchWeather();
  fetchFinance();
  renderTasks();
  updateStorageInfo();
});
