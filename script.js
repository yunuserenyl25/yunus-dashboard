document.addEventListener('DOMContentLoaded', () => {

  // 1. CANLI HAVA DURUMU (Yedekli ve Garantili)
  async function fetchWeatherByCoords(lat, lon) {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      if (data && data.current_weather) {
        document.getElementById('weather-temp').innerText = Math.round(data.current_weather.temperature);
        document.getElementById('weather-desc').innerText = `Rüzgar: ${data.current_weather.windspeed} km/s`;
        document.getElementById('weather-city').innerText = "Konum Bazlı Canlı Veri";
      } else {
        throw new Error("Veri yok");
      }
    } catch {
      fetchFallbackWeather();
    }
  }

  async function fetchFallbackWeather() {
    try {
      // Varsayılan Şehir (İstanbul) ip-api / open-meteo
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current_weather=true');
      const data = await res.json();
      document.getElementById('weather-temp').innerText = Math.round(data.current_weather.temperature);
      document.getElementById('weather-desc').innerText = `İstanbul (Rüzgar: ${data.current_weather.windspeed} km/s)`;
      document.getElementById('weather-city').innerText = "Varsayılan Konum (Canlı)";
    } catch {
      document.getElementById('weather-desc').innerText = "Hava durumu servisine ulaşılamadı.";
    }
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => fetchFallbackWeather(),
      { timeout: 5000 }
    );
  } else {
    fetchFallbackWeather();
  }


  // 2. CANLI FİNANS ANALİZİ (Binance & Exchange API - CORS Sorunsuz)
  async function fetchFinance() {
    try {
      // Binance Ticker API (CORS engeli bulunmaz)
      const [btcRes, ethRes, usdtRes] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTTRY')
      ]);

      const btc = await btcRes.json();
      const eth = await ethRes.json();
      const usdt = await usdtRes.json();

      document.getElementById('btc-price').innerText = `$${parseFloat(btc.price).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
      document.getElementById('eth-price').innerText = `$${parseFloat(eth.price).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
      document.getElementById('usdt-price').innerText = `${parseFloat(usdt.price).toFixed(2)} ₺`;
    } catch (e) {
      document.getElementById('btc-price').innerText = "Yüklenemedi";
      document.getElementById('eth-price').innerText = "Yüklenemedi";
      document.getElementById('usdt-price').innerText = "Yüklenemedi";
    }
  }
  document.getElementById('refresh-finance').onclick = fetchFinance;


  // 3. HQ SOUND MIXER (Web Audio API Synthesizer - Tamamen Bağımsız ve Çalışır)
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const noiseNodes = {};

  function createWhiteNoise() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    return whiteNoise;
  }

  function setupSoundChannel(sliderId, filterFreq, filterType = 'lowpass') {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    let noiseSource = null;
    let gainNode = audioCtx.createGain();
    let filter = audioCtx.createBiquadFilter();

    filter.type = filterType;
    filter.frequency.value = filterFreq;

    gainNode.gain.value = 0;
    gainNode.connect(audioCtx.destination);
    filter.connect(gainNode);

    slider.addEventListener('input', (e) => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const val = parseFloat(e.target.value);
      if (val > 0 && !noiseSource) {
        noiseSource = createWhiteNoise();
        noiseSource.connect(filter);
        noiseSource.start();
      }
      gainNode.gain.setTargetAtTime(val * 0.3, audioCtx.currentTime, 0.05);
      if (val === 0 && noiseSource) {
        setTimeout(() => {
          if (gainNode.gain.value < 0.01 && noiseSource) {
            noiseSource.stop();
            noiseSource.disconnect();
            noiseSource = null;
          }
        }, 200);
      }
    });
  }

  // 3 Farklı Ses Sentezi (Yağmur, Fırtına, Şömine)
  setupSoundChannel('sound-rain', 800, 'lowpass');
  setupSoundChannel('sound-thunder', 300, 'bandpass');
  setupSoundChannel('sound-fireplace', 1200, 'highpass');

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
    alert('Notlar hafızaya kaydedildi!');
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
    if (!timerInterval) {
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateTimer();
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          alert("Süre doldu! Mola zamanı.");
        }
      }, 1000);
    }
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
      li.innerHTML = `<span>${t}</span> <button onclick="removeTask(${i})" style="color:#ef4444;background:none;border:none;cursor:pointer;font-weight:bold;">✕</button>`;
      taskList.appendChild(li);
    });
  }
  window.removeTask = (i) => {
    tasks.splice(i, 1);
    localStorage.setItem('v3_tasks', JSON.stringify(tasks));
    renderTasks();
    updateStorageInfo();
  };
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


  // 8. CANLI PING & AĞ ANALİZİ (CORS Engeline Takılmayan Görsel Beacon)
  document.getElementById('test-ping-btn').onclick = () => {
    const start = Date.now();
    const pingDisplay = document.getElementById('ping-val');
    pingDisplay.innerText = "Ölçülüyor...";

    const img = new Image();
    img.src = "https://www.google.com/favicon.ico?" + Math.random();
    img.onload = img.onerror = () => {
      const duration = Date.now() - start;
      pingDisplay.innerText = `${duration} ms`;
    };
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
    if (confirm('Tüm veriler silinsin mi?')) {
      localStorage.clear();
      location.reload();
    }
  };
  document.getElementById('fullscreen-btn').onclick = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };


  // TEMA & MODAL AYARLARI
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

  const savedColor = localStorage.getItem('v3_color');
  if (savedColor) {
    document.documentElement.style.setProperty('--primary-color', savedColor);
  }

  // BAŞLANGIÇ ÇAĞRILARI
  fetchFinance();
  renderTasks();
  updateStorageInfo();
});
