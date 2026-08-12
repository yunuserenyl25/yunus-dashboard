document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SAAT VE TARİH DİNAMİĞİ ---
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
            if (h < 6) greetingEl.textContent = "İyi Geceler!";
            else if (h < 12) greetingEl.textContent = "Günaydın, Harika Bir Gün Olsun!";
            else if (h < 18) greetingEl.textContent = "İyi Günler, Çalışmaya Devam!";
            else greetingEl.textContent = "İyi Akşamlar, Dinlenme Zamanı!";
        }

        if (dateEl) {
            const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
            dateEl.textContent = now.toLocaleDateString('tr-TR', options);
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- 2. DİNAMİK ARAMA ÇUBUĞU ---
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

    // --- 3. ALIŞKANLIK & VERİMLİLİK TAKİBİ ---
    const habits = document.querySelectorAll('.habit-item input');
    const habitProgress = document.getElementById('habitProgress');

    function updateHabitProgress() {
        if (!habits.length || !habitProgress) return;
        let checkedCount = 0;
        habits.forEach((checkbox, index) => {
            const savedState = localStorage.getItem(`habit_${index}`);
            if (savedState === 'true') {
                checkbox.checked = true;
            }
            if (checkbox.checked) checkedCount++;
        });

        const percentage = (checkedCount / habits.length) * 100;
        habitProgress.style.width = `${percentage}%`;
    }

    habits.forEach((checkbox, index) => {
        checkbox.addEventListener('change', () => {
            localStorage.setItem(`habit_${index}`, checkbox.checked);
            updateHabitProgress();
        });
    });
    updateHabitProgress();

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
                    alert('Odaklanma süreniz doldu, tebrikler!');
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

    // --- 6. YAPILACAKLAR (TODO) ---
    let todos = JSON.parse(localStorage.getItem('yunus_todos_v2')) || [];
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoList = document.getElementById('todoList');

    function renderTodos() {
        if (!todoList) return;
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:13px; background:rgba(255,255,255,0.04); padding:8px 10px; border-radius:8px;";
            
            const span = document.createElement('span');
            span.textContent = todo.text;
            span.style.cursor = 'pointer';
            if (todo.completed) {
                span.style.textDecoration = 'line-through';
                span.style.opacity = '0.5';
            }
            span.addEventListener('click', () => {
                todos[index].completed = !todos[index].completed;
                localStorage.setItem('yunus_todos_v2', JSON.stringify(todos));
                renderTodos();
            });

            const delIcon = document.createElement('i');
            delIcon.className = 'fa-solid fa-trash';
            delIcon.style.cssText = 'color:#f43f5e; cursor:pointer; font-size:12px;';
            delIcon.addEventListener('click', () => {
                todos.splice(index, 1);
                localStorage.setItem('yunus_todos_v2', JSON.stringify(todos));
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
                localStorage.setItem('yunus_todos_v2', JSON.stringify(todos));
                todoInput.value = '';
                renderTodos();
            }
        });
    }
    renderTodos();

    // --- 7. AKILLI NOT DEFTERİ ---
    const noteInput = document.getElementById('noteInput');
    if (noteInput) {
        const savedNote = localStorage.getItem('yunus_note_v2');
        if (savedNote) noteInput.value = savedNote;

        noteInput.addEventListener('input', () => {
            localStorage.setItem('yunus_note_v2', noteInput.value);
        });
    }

    // --- 8. CANLI TEMA DEĞİŞTİRİCİ ---
    const themeViolet = document.getElementById('themeViolet');
    const themeEmerald = document.getElementById('themeEmerald');
    const themeOcean = document.getElementById('themeOcean');

    if (themeViolet) themeViolet.addEventListener('click', () => {
        document.body.style.background = '#090d16';
    });
    if (themeEmerald) themeEmerald.addEventListener('click', () => {
        document.body.style.background = '#041d1a';
    });
    if (themeOcean) themeOcean.addEventListener('click', () => {
        document.body.style.background = '#061727';
    });
});
