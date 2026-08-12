// --- 1. SAAT VE TARİH ---
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

// --- 2. GOOGLE ARAMA ---
function handleSearch(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        }
    }
}

// --- 3. YAPILACAKLAR (TODO) ---
let todos = JSON.parse(localStorage.getItem('yunus_todos')) || [];

function renderTodos() {
    const listEl = document.getElementById('todoList');
    if (!listEl) return;
    listEl.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:13px; background:rgba(0,0,0,0.2); padding:6px 10px; border-radius:6px;";
        li.innerHTML = `
            <span style="cursor:pointer; ${todo.completed ? 'text-decoration:line-through; opacity:0.5;' : ''}" onclick="toggleTodo(${index})">${todo.text}</span>
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

// --- 4. POMODORO ZAMANLAYICI ---
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
            alert('Süre bitti!');
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

// --- 5. ODAK SESLERİ ---
const audioMap = {};
function toggleSound(type) {
    if (!audioMap[type]) {
        let src = type === 'rain' 
            ? 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg' 
            : 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg';
        audioMap[type] = new Audio(src);
        audioMap[type].loop = true;
    }
    
    if (audioMap[type].paused) {
        audioMap[type].play();
    } else {
        audioMap[type].pause();
    }
}

// --- 6. NOT DEFTERİ ---
function saveNote() {
    const note = document.getElementById('noteInput');
    if (note) {
        localStorage.setItem('yunus_note', note.value);
    }
}

// --- 7. TEMA SEÇİCİ ---
function setTheme(themeName) {
    if (themeName === 'purple') {
        document.body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)';
    } else if (themeName === 'green') {
        document.body.style.background = 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #0f172a 100%)';
    } else if (themeName === 'red') {
        document.body.style.background = 'linear-gradient(135deg, #881337 0%, #4c0519 50%, #0f172a 100%)';
    }
}

// --- 8. GERÇEK CANLI SKOR APİ ---
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
                matchElement.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:6px 10px; border-radius:6px; margin-top:6px; font-size:12px;";
                matchElement.innerHTML = `
                    <span>${homeTeam} - ${awayTeam}</span>
                    <strong style="color:#10b981;">${homeScore} - ${awayScore} <small style="color:#38bdf8;">(${status})</small></strong>
                `;
                container.appendChild(matchElement);
            });
        } else {
            container.innerHTML = '<div style="font-size:12px; opacity:0.7;">Şu an aktif maç yok.</div>';
        }
    } catch (e) {
        container.innerHTML = '<div style="font-size:12px; color:#f43f5e;">Skor servisine bağlanılamadı.</div>';
    }
}

// --- SAYFA YÜKLENDİĞİNDE OTOMATİK ÇALIŞTIR ---
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    renderTodos();
    
    const savedNote = localStorage.getItem('yunus_note');
    const noteEl = document.getElementById('noteInput');
    if (savedNote && noteEl) noteEl.value = savedNote;

    fetchLiveScores();
    setInterval(fetchLiveScores, 60000);
});
