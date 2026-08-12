document.addEventListener('DOMContentLoaded', () => {

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
    updateClock();

    // --- 2. GOOGLE ARAMA ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                }
            }
        });
    }

    // --- 3. YAPILACAKLAR (TODO) ---
    let todos = JSON.parse(localStorage.getItem('yunus_todos')) || [];
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoList = document.getElementById('todoList');

    function renderTodos() {
        if (!todoList) return;
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:13px; background:rgba(0,0,0,0.2); padding:6px 10px; border-radius:6px;";
            
            const span = document.createElement('span');
            span.textContent = todo.text;
            span.style.cursor = 'pointer';
            if (todo.completed) {
                span.style.textDecoration = 'line-through';
                span.style.opacity = '0.5';
            }
            span.addEventListener('click', () => {
                todos[index].completed = !todos[index].completed;
                localStorage.setItem('yunus_todos', JSON.stringify(todos));
                renderTodos();
            });

            const delIcon = document.createElement('i');
            delIcon.className = 'fa-solid fa-trash';
            delIcon.style.cssText = 'color:#f43f5e; cursor:pointer;';
            delIcon.addEventListener('click', () => {
                todos.splice(index, 1);
                localStorage.setItem('yunus_todos', JSON.stringify(todos));
                renderTodos();
            });

            li.appendChild(span);
            li.appendChild(delIcon);
            todoList.appendChild(li);
        });
    }

    if (addTodoBtn && todoInput) {
        addTodoBtn.addEventListener('click', () => {
            if (todoInput.value.trim() !== '') {
                todos.push({ text: todoInput.value.trim(), completed: false });
                localStorage.setItem('yunus_todos', JSON.stringify(todos));
                todoInput.value = '';
                renderTodos();
            }
        });
    }
    renderTodos();

    // --- 4. POMODORO ZAMANLAYICI ---
    let timerInterval = null;
    let timeLeft = 25 * 60;
    const timerDisplay = document.getElementById('timerDisplay');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');

    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', () => {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
                    const secs = String(timeLeft % 60).padStart(2, '0');
                    if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    alert('Süre bitti!');
                }
            }, 1000);
        });
    }

    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            timerInterval = null;
            timeLeft = 25 * 60;
            if (timerDisplay) timerDisplay.textContent = "25:00";
        });
    }

    // --- 5. ODAK SESLERİ ---
    const audioMap = {};
    function toggleSound(type, url) {
        if (!audioMap[type]) {
            audioMap[type] = new Audio(url);
            audioMap[type].loop = true;
        }
        if (audioMap[type].paused) {
            audioMap[type].play();
        } else {
            audioMap[type].pause();
        }
    }

    const rainBtn = document.getElementById('rainBtn');
    const lofiBtn = document.getElementById('lofiBtn');

    if (rainBtn) {
        rainBtn.addEventListener('click', () => {
            toggleSound('rain', 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg');
        });
    }
    if (lofiBtn) {
        lofiBtn.addEventListener('click', () => {
            toggleSound('lofi', 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg');
        });
    }

    // --- 6. NOT DEFTERİ ---
    const noteInput = document.getElementById('noteInput');
    if (noteInput) {
        const savedNote = localStorage.getItem('yunus_note');
        if (savedNote) noteInput.value = savedNote;

        noteInput.addEventListener('input', () => {
            localStorage.setItem('yunus_note', noteInput.value);
        });
    }

    // --- 7. TEMA SEÇİCİ ---
    const themePurple = document.getElementById('themePurple');
    const themeGreen = document.getElementById('themeGreen');
    const themeRed = document.getElementById('themeRed');

    if (themePurple) themePurple.addEventListener('click', () => {
        document.body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)';
    });
    if (themeGreen) themeGreen.addEventListener('click', () => {
        document.body.style.background = 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #0f172a 100%)';
    });
    if (themeRed) themeRed.addEventListener('click', () => {
        document.body.style.background = 'linear-gradient(135deg, #881337 0%, #4c0519 50%, #0f172a 100%)';
    });

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
                    const awayTeam = event.competitions[0].competitors[1].team.shortDisplayName || event.competitions[0].competitors[1].name;
                    const homeScore = event.competitions[0].competitors[0].score || '0';
                    const awayScore = event.competitions[0].competitors[1].score || '0';
                    const status = event.status.type.shortDetail || 'Canlı';

                    const matchElement = document.createElement('div');
                    matchElement.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:6px 10px; border-radius:6px; margin-top:6px; font-size:12px;";
                    matchElement.innerHTML = `
                        <span>${homeTeam} - ${awayTeam}</span>
                        <strong style="color:#10b981;">${homeScore} - ${awayScore} <small style="color:#38bdf8;">(${status})</small></strong>
                    `;
                    container.appendChild(matchElement);
                });
            } else {
                container.innerHTML = '<div style="font-size:12px; opacity:0.7;">Şu an canlı maç bulunamadı.</div>';
            }
        } catch (e) {
            container.innerHTML = '<div style="font-size:12px; color:#f43f5e;">Canlı veri sunucusuna erişilemedi.</div>';
        }
    }

    fetchLiveScores();
    setInterval(fetchLiveScores, 60000);
});
