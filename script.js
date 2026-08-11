// 1. DİNAMİK SAAT VE KARŞILAMA
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateEl = document.getElementById('date');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('tr-TR', options);

    const currentHour = now.getHours();
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
        if (currentHour >= 5 && currentHour < 12) {
            greetingEl.textContent = "Günaydın! Harika bir gün olsun.";
        } else if (currentHour >= 12 && currentHour < 18) {
            greetingEl.textContent = "Tünaydın! İyi çalışmalar.";
        } else {
            greetingEl.textContent = "İyi Akşamlar! Dinlenme vakti mi?";
        }
    }
}
setInterval(updateClock, 1000);
updateClock();

// 2. TO-DO LIST (LocalStorage Destekli)
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');

let todos = JSON.parse(localStorage.getItem('omni_todos')) || [];

function renderTodos() {
    if (!todoList) return;
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = todo.completed ? 'completed' : '';
        li.innerHTML = `
            <span onclick="toggleTodo(${index})" style="cursor:pointer;">${todo.text}</span>
            <i class="fa-solid fa-trash" onclick="deleteTodo(${index})" style="cursor:pointer; color:#f43f5e;"></i>
        `;
        todoList.appendChild(li);
    });
    localStorage.setItem('omni_todos', JSON.stringify(todos));
}

if (addTodoBtn && todoInput) {
    addTodoBtn.addEventListener('click', () => {
        if (todoInput.value.trim() !== '') {
            todos.push({ text: todoInput.value.trim(), completed: false });
            todoInput.value = '';
            renderTodos();
        }
    });

    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodoBtn.click();
    });
}

window.toggleTodo = (index) => {
    todos[index].completed = !todos[index].completed;
    renderTodos();
};

window.deleteTodo = (index) => {
    todos.splice(index, 1);
    renderTodos();
};

renderTodos();

// 3. POMODORO ZAMANLAYICI
let timerInterval;
let timeLeft = 25 * 60;
let isRunning = false;

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-timer');
const resetBtn = document.getElementById('reset-timer');

function updateTimerDisplay() {
    if (!timerDisplay) return;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

if (startBtn && resetBtn) {
    startBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timerInterval);
            startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Başlat';
        } else {
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    alert("Süre doldu! Mola zamanı.");
                }
            }, 1000);
            startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Durdur';
        }
        isRunning = !isRunning;
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = 25 * 60;
        updateTimerDisplay();
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Başlat';
    });
}

updateTimerDisplay();

// 4. ODAK SESLERİ (AUDIO)
window.toggleAudio = function(type) {
    const rainAudio = document.getElementById('rain-audio');
    const lofiAudio = document.getElementById('lofi-audio');
    const rainBtn = document.getElementById('rain-btn');
    const lofiBtn = document.getElementById('lofi-btn');

    if (type === 'rain' && rainAudio) {
        if (rainAudio.paused) {
            rainAudio.play();
            if (rainBtn) rainBtn.classList.add('playing');
        } else {
            rainAudio.pause();
            if (rainBtn) rainBtn.classList.remove('playing');
        }
    } else if (type === 'lofi' && lofiAudio) {
        if (lofiAudio.paused) {
            lofiAudio.play();
            if (lofiBtn) lofiBtn.classList.add('playing');
        } else {
            lofiAudio.pause();
            if (lofiBtn) lofiBtn.classList.remove('playing');
        }
    }
};

// 5. MOTİVASYON SÖZLERİ
const quotes = [
    { text: "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.", author: "Robert Collier" },
    { text: "Gelecek, bugün ne yaptığına bağlıdır.", author: "Mahatma Gandhi" },
    { text: "Kod yazmak bir sanattır; mantık ise onun fırçası.", author: "Anonim" },
    { text: "Harika işler yapmanın tek yolu, yaptığınız işi sevmektir.", author: "Steve Jobs" },
    { text: "Disiplin, hedefler ile başarı arasındaki köprüdür.", author: "Jim Rohn" }
];

function getRandomQuote() {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    if (quoteText && quoteAuthor) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteText.textContent = `"${quotes[randomIndex].text}"`;
        quoteAuthor.textContent = `- ${quotes[randomIndex].author}`;
    }
}
getRandomQuote();

// 6. CANLI HAVA DURUMU (Erzurum API)
async function fetchWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.90&longitude=41.27&current_weather=true');
        const data = await response.json();
        const weather = data.current_weather;

        const tempEl = document.getElementById('weather-temp');
        const iconEl = document.getElementById('weather-icon');

        if (tempEl) {
            tempEl.textContent = `${Math.round(weather.temperature)}°C`;
        }

        if (iconEl) {
            if (weather.weathercode === 0) {
                iconEl.className = "fa-solid fa-sun weather-icon";
            } else if (weather.weathercode >= 1 && weather.weathercode <= 3) {
                iconEl.className = "fa-solid fa-cloud-sun weather-icon";
            } else if (weather.weathercode >= 51) {
                iconEl.className = "fa-solid fa-cloud-rain weather-icon";
            }
        }
    } catch (error) {
        console.log("Hava durumu çekilemedi:", error);
    }
}
fetchWeather();

// 7. CANLI DÖVİZ KURLARI
async function fetchMarketRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data && data.rates && data.rates.TRY) {
            const usdTry = data.rates.TRY.toFixed(2);
            const eurRateInUsd = data.rates.EUR;
            const eurTry = (data.rates.TRY / eurRateInUsd).toFixed(2);

            const usdEl = document.getElementById('usd-rate');
            const eurEl = document.getElementById('eur-rate');

            if (usdEl) usdEl.textContent = `₺${usdTry}`;
            if (eurEl) eurEl.textContent = `₺${eurTry}`;
        }
    } catch (error) {
        console.log("Kurlar çekilemedi:", error);
    }
}
fetchMarketRates();

// 8. HIZLI NOT DEFTERİ
const notepad = document.getElementById('quick-notepad');

if (notepad) {
    notepad.value = localStorage.getItem('omni_quick_note') || '';
    notepad.addEventListener('input', () => {
        localStorage.setItem('omni_quick_note', notepad.value);
    });
}

// 9. TEMA DEĞİŞTİRİCİ
window.changeTheme = function(theme) {
    document.body.classList.remove('theme-emerald', 'theme-sunset');
    if (theme === 'emerald') {
        document.body.classList.add('theme-emerald');
    } else if (theme === 'sunset') {
        document.body.classList.add('theme-sunset');
    }
    localStorage.setItem('omni_theme', theme);
};

const savedTheme = localStorage.getItem('omni_theme');
if (savedTheme) {
    changeTheme(savedTheme);
}
// YILAN OYUNU MANTIĞI
const canvas = document.getElementById("snakeGame");
if (canvas) {
    const ctx = canvas.getContext("2d");
    const grid = 10;
    let count = 0;
    let score = 0;
    let gameInterval = null;

    let snake = {
        x: 130,
        y: 100,
        dx: grid,
        dy: 0,
        cells: [],
        maxCells: 4
    };

    let apple = { x: 50, y: 50 };

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function resetGame() {
        snake.x = 130;
        snake.y = 100;
        snake.cells = [];
        snake.maxCells = 4;
        snake.dx = grid;
        snake.dy = 0;
        score = 0;
        const scoreEl = document.getElementById("game-score");
        if (scoreEl) scoreEl.textContent = "Skor: " + score;
        apple.x = getRandomInt(0, canvas.width / grid) * grid;
        apple.y = getRandomInt(0, canvas.height / grid) * grid;
    }

    function gameLoop() {
        gameInterval = requestAnimationFrame(gameLoop);

        if (++count < 6) return;
        count = 0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        snake.x += snake.dx;
        snake.y += snake.dy;

        if (snake.x < 0) snake.x = canvas.width - grid;
        else if (snake.x >= canvas.width) snake.x = 0;

        if (snake.y < 0) snake.y = canvas.height - grid;
        else if (snake.y >= canvas.height) snake.y = 0;

        snake.cells.unshift({ x: snake.x, y: snake.y });

        if (snake.cells.length > snake.maxCells) {
            snake.cells.pop();
        }

        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

        ctx.fillStyle = "#10b981";
        snake.cells.forEach((cell, index) => {
            ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

            if (cell.x === apple.x && cell.y === apple.y) {
                snake.maxCells++;
                score += 10;
                const scoreEl = document.getElementById("game-score");
                if (scoreEl) scoreEl.textContent = "Skor: " + score;
                apple.x = getRandomInt(0, canvas.width / grid) * grid;
                apple.y = getRandomInt(0, canvas.height / grid) * grid;
            }

            for (let i = index + 1; i < snake.cells.length; i++) {
                if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                    resetGame();
                }
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" && snake.dx === 0) {
            snake.dx = -grid; snake.dy = 0;
        } else if (e.key === "ArrowUp" && snake.dy === 0) {
            snake.dy = -grid; snake.dx = 0;
        } else if (e.key === "ArrowRight" && snake.dx === 0) {
            snake.dx = grid; snake.dy = 0;
        } else if (e.key === "ArrowDown" && snake.dy === 0) {
            snake.dy = grid; snake.dx = 0;
        }
    });

    const startBtn = document.getElementById("start-game-btn");
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            if (gameInterval) cancelAnimationFrame(gameInterval);
            resetGame();
            gameLoop();
        });
    }
}
// CANLI MAÇ SKORLARINI DIŞ APİ'DEN ÇEKME MANTIĞI
async function fetchLiveScores() {
    const container = document.getElementById('live-scores-container');
    if (!container) return;

    try {
        // Ücretsiz Canlı Spor API'sinden güncel maç verilerini isteme
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
        const data = await response.json();

        if (data && data.events && data.events.length > 0) {
            container.innerHTML = ''; // Yükleniyor yazısını temizle
            
            // İlk 4 canlı/güncel maçı listele
            const matches = data.events.slice(0, 4);
            matches.forEach(event => {
                const homeTeam = event.competitions[0].competitors[0].team.shortDisplayName || event.competitions[0].competitors[0].team.name;
                const awayTeam = event.competitions[0].competitors[1].team.shortDisplayName || event.competitions[0].competitors[1].team.name;
                
                const homeScore = event.competitions[0].competitors[0].score || '0';
                const awayScore = event.competitions[0].competitors[1].score || '0';
                const status = event.status.type.shortDetail || 'Canlı';

                const matchElement = document.createElement('div');
                matchElement.className = 'score-item';
                matchElement.innerHTML = `
                    <span>${homeTeam} - ${awayTeam}</span>
                    <span class="badge green">${homeScore} - ${awayScore} <small>(${status})</small></span>
                `;
                container.appendChild(matchElement);
            });
        } else {
            container.innerHTML = '<div style="font-size:12px; opacity:0.7;">Şu anda aktif canlı maç bulunamadı.</div>';
        }
    } catch (error) {
        console.error('Canlı skor çekilemedi:', error);
        container.innerHTML = '<div style="font-size:12px; color:#f43f5e;">Canlı veri sunucusuna bağlanılamadı.</div>';
    }
}

// Sayfa açıldığında çalıştır ve her 60 saniyede bir canlı skorları otomatik yenile
document.addEventListener('DOMContentLoaded', () => {
    fetchLiveScores();
    setInterval(fetchLiveScores, 60000); // 60 saniye
});
// --- TÜM BUTONLAR VE İŞLEVSELLİK İÇİN KESİNTİSİZ ÇALIŞTIRMA KODLARI ---

// 1. DÜZENLİ SAAT VE TARİH GÜNCELLEME
function updateClock() {
    const clockEl = document.getElementById('clock');
    const greetingEl = document.getElementById('greeting');
    const dateEl = document.getElementById('date');

    if (!clockEl) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    if (greetingEl) {
        const h = now.getHours();
        if (h < 12) greetingEl.textContent = "İyi Sabahlar!";
        else if (h < 18) greetingEl.textContent = "İyi Günler!";
        else greetingEl.textContent = "İyi Akşamlar!";
    }

    if (dateEl) {
        const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
        dateEl.textContent = now.toLocaleDateString('tr-TR', options);
    }
}
setInterval(updateClock, 1000);
updateClock();

// 2. GOOGLE ARAMA ARAMA ÇUBUĞU
function handleSearch(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            if (query.startsWith('http://') || query.startsWith('https://')) {
                window.open(query, '_blank');
            } else {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
            }
        }
    }
}

// 3. YAPILACAKLAR (TODO) LİSTESİ MANTIĞI
let todos = JSON.parse(localStorage.getItem('yunus_todos')) || [];

function renderTodos() {
    const listEl = document.getElementById('todoList');
    if (!listEl) return;
    listEl.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:13px;";
        li.innerHTML = `
            <span style="${todo.completed ? 'text-decoration:line-through; opacity:0.5;' : ''}" onclick="toggleTodo(${index})">${todo.text}</span>
            <i class="fa-solid fa-trash" style="color:#f43f5e; cursor:pointer;" onclick="deleteTodo(${index})"></i>
        `;
        listEl.appendChild(li);
    });
}

function addTodo() {
    const input = document.getElementById('todoInput');
    if (input && input.value.trim() !== '') {
        todos.push({ text: input.value.trim(), completed: false });
        localStorage.setItem('yunus_todos', JSON.stringify(todos));
        input.value = '';
        renderTodos();
    }
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    localStorage.setItem('yunus_todos', JSON.stringify(todos));
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    localStorage.setItem('yunus_todos', JSON.stringify(todos));
    renderTodos();
}

// 4. POMODORO ZAMANLAYICI
let timerInterval = null;
let timeLeft = 25 * 60;

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
            const secs = String(timeLeft % 60).padStart(2, '0');
            const display = document.getElementById('timerDisplay');
            if (display) display.textContent = `${mins}:${secs}`;
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            alert('Odak süreniz bitti! Harika iş başardınız.');
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    const display = document.getElementById('timerDisplay');
    if (display) display.textContent = "25:00";
}

// 5. ODAK SESLERİ ÇALICI
const audioMap = {};
function toggleSound(type) {
    if (!audioMap[type]) {
        let src = type === 'rain' 
            ? 'https://www.soundjay.com/nature/rain-01.mp3' 
            : 'https://www.soundjay.com/free-music/midnight-ride-01.mp3';
        audioMap[type] = new Audio(src);
        audioMap[type].loop = true;
    }
    
    if (audioMap[type].paused) {
        audioMap[type].play();
    } else {
        audioMap[type].pause();
    }
}

// 6. HIZLI NOT DEFTERİ KAYDETME
function saveNote() {
    const note = document.getElementById('noteInput');
    if (note) {
        localStorage.setItem('yunus_note', note.value);
    }
}

// 7. TEMA SEÇİCİ
function setTheme(themeName) {
    if (themeName === 'purple') {
        document.body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)';
    } else if (themeName === 'green') {
        document.body.style.background = 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #0f172a 100%)';
    } else if (themeName === 'red') {
        document.body.style.background = 'linear-gradient(135deg, #881337 0%, #4c0519 50%, #0f172a 100%)';
    }
}

// 8. CANLI MAÇ SKORU ÇEKME
async function fetchLiveScores() {
    const container = document.getElementById('live-scores-container');
    if (!container) return;

    try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
        const data = await response.json();

        if (data && data.events && data.events.length > 0) {
            container.innerHTML = '';
            const matches = data.events.slice(0, 4);
            matches.forEach(event => {
                const homeTeam = event.competitions[0].competitors[0].team.shortDisplayName || event.competitions[0].competitors[0].team.name;
                const awayTeam = event.competitions[0].competitors[1].team.shortDisplayName || event.competitions[0].competitors[1].team.name;
                const homeScore = event.competitions[0].competitors[0].score || '0';
                const awayScore = event.competitions[0].competitors[1].score || '0';
                const status = event.status.type.shortDetail || 'Canlı';

                const matchElement = document.createElement('div');
                matchElement.className = 'score-item';
                matchElement.innerHTML = `
                    <span>${homeTeam} - ${awayTeam}</span>
                    <span class="badge green">${homeScore} - ${awayScore} <small>(${status})</small></span>
                `;
                container.appendChild(matchElement);
            });
        }
    } catch (e) {
        console.log('Skorlar yüklenirken geçici aksama oluştu.');
    }
}

// SAYFA YÜKLENDİĞİNDE VERİLERİ VE TIKLAMALARI BAŞLAT
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    
    // Kayıtlı notu getir
    const savedNote = localStorage.getItem('yunus_note');
    const noteEl = document.getElementById('noteInput');
    if (savedNote && noteEl) noteEl.value = savedNote;

    // Canlı skorları çek
    fetchLiveScores();
    setInterval(fetchLiveScores, 60000);
});
