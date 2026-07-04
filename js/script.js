/* =========================================================
   Life Dashboard — app.js
   Vanilla JS only. All data persisted via localStorage.
   Scope: strictly MVP (Greeting, Focus Timer, To-Do, Quick Links)
          + 5 official challenges. No extra features.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. GREETING (clock, date, greeting, click-to-edit name)
  --------------------------------------------------------- */
  const clockEl = document.getElementById('clock');
  const dateLabelEl = document.getElementById('dateLabel');
  const greetingPrefixEl = document.getElementById('greetingPrefix');
  const greetingNameEl = document.getElementById('greetingName');
  const nameInput = document.getElementById('nameInput');
  const editNameBtn = document.getElementById('editNameBtn');

  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  function getSavedName() {
    return localStorage.getItem('dfs_userName') || 'Sahabat';
  }

  function updateGreeting() {
    const now = new Date();
    const hours = now.getHours();

    let greeting = 'Selamat Malam';
    if (hours < 11) greeting = 'Selamat Pagi';
    else if (hours < 15) greeting = 'Selamat Siang';
    else if (hours < 18) greeting = 'Selamat Sore';

    greetingPrefixEl.textContent = greeting;
    greetingNameEl.textContent = getSavedName();
  }

  function tickClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
    dateLabelEl.textContent = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }

  function tick() {
    tickClock();
    updateGreeting();
  }

  // Click-to-edit name: click the name text or pencil icon to reveal an input
  function openNameEditor() {
    nameInput.value = localStorage.getItem('dfs_userName') || '';
    greetingNameEl.style.display = 'none';
    nameInput.classList.add('visible');
    nameInput.focus();
  }
  function closeNameEditor(save) {
    if (save) {
      const val = nameInput.value.trim();
      localStorage.setItem('dfs_userName', val || 'Sahabat');
      updateGreeting();
    }
    nameInput.classList.remove('visible');
    greetingNameEl.style.display = '';
  }

  greetingNameEl.addEventListener('click', openNameEditor);
  greetingNameEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNameEditor(); }
  });
  editNameBtn.addEventListener('click', openNameEditor);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); closeNameEditor(true); }
    if (e.key === 'Escape') { closeNameEditor(false); }
  });
  nameInput.addEventListener('blur', () => closeNameEditor(true));

  tick();
  setInterval(tick, 1000);

  /* ---------------------------------------------------------
     2. THEME TOGGLE (light / dark) — challenge
  --------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('dfs_theme', theme);
  }

  applyTheme(localStorage.getItem('dfs_theme') || 'light');

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  });

  /* ---------------------------------------------------------
     3. FOCUS TIMER (25-min default, start/stop/reset,
        pomodoro duration change — challenge)
  --------------------------------------------------------- */
  const timerDisplay = document.getElementById('timerDisplay');
  const ringProgress = document.getElementById('ringProgress');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const resetBtn = document.getElementById('resetBtn');
  const pomodoroSelect = document.getElementById('pomodoroSelect');

  const RING_CIRCUMFERENCE = 2 * Math.PI * 90; // r=90

  let totalSeconds = (parseInt(localStorage.getItem('dfs_pomodoroMins'), 10) || 25) * 60;
  let secondsLeft = totalSeconds;
  let timerInterval = null;
  let isRunning = false;

  ringProgress.style.strokeDasharray = RING_CIRCUMFERENCE;

  function renderTimer() {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const progressRatio = 1 - secondsLeft / totalSeconds;
    ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - progressRatio);
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    stopBtn.classList.remove('btn-paused');
    timerInterval = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft--;
        renderTimer();
      } else {
        stopTimer();
        timerDisplay.textContent = 'Selesai!';
        onTimerFinished();
      }
    }, 1000);
  }

  function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    stopBtn.classList.add('btn-paused');
  }

  function resetTimer() {
    stopTimer();
    stopBtn.classList.remove('btn-paused');
    secondsLeft = totalSeconds;
    renderTimer();
  }

  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', stopTimer);
  resetBtn.addEventListener('click', resetTimer);

  pomodoroSelect.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-mins]');
    if (!btn) return;
    [...pomodoroSelect.children].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mins = parseInt(btn.dataset.mins, 10);
    totalSeconds = mins * 60;
    localStorage.setItem('dfs_pomodoroMins', mins);
    resetTimer();
  });

  // initialize active button to match saved duration
  const savedMins = totalSeconds / 60;
  [...pomodoroSelect.children].forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.mins, 10) === savedMins);
  });

  renderTimer();

  /* ---------------------------------------------------------
     4. TO-DO LIST (add, edit, done, delete, persist —
        + prevent duplicate & sort tasks challenges)
  --------------------------------------------------------- */
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const taskCount = document.getElementById('taskCount');
  const emptyState = document.getElementById('emptyState');
  const filterGroup = document.getElementById('filterGroup');
  const sortBtn = document.getElementById('sortBtn');

  let tasks = JSON.parse(localStorage.getItem('dfs_tasks') || '[]');
  let currentFilter = 'all';
  let sortAsc = true;

  function saveTasks() {
    localStorage.setItem('dfs_tasks', JSON.stringify(tasks));
  }

  function makeId() {
    return 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  function renderTasks() {
    taskList.innerHTML = '';

    const visible = tasks.filter(t => {
      if (currentFilter === 'active') return !t.done;
      if (currentFilter === 'done') return t.done;
      return true;
    });

    visible.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => {
        task.done = checkbox.checked;
        saveTasks();
        renderTasks();
      });

      const textSpan = document.createElement('span');
      textSpan.className = 'task-text';
      textSpan.contentEditable = 'true';
      textSpan.textContent = task.text;
      textSpan.addEventListener('blur', () => {
        const newText = textSpan.textContent.trim();
        if (!newText) { textSpan.textContent = task.text; return; }
        task.text = newText;
        saveTasks();
      });
      textSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); textSpan.blur(); }
      });

      const statusPill = document.createElement('span');
      statusPill.className = 'status-pill ' + (task.done ? 'done' : 'active');
      statusPill.textContent = task.done ? 'Selesai' : 'Berjalan';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-delete';
      deleteBtn.setAttribute('aria-label', 'Hapus tugas');
      deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" class="icon"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      deleteBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        saveTasks();
        renderTasks();
      });

      li.appendChild(checkbox);
      li.appendChild(textSpan);
      li.appendChild(statusPill);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });

    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    taskCount.textContent = `${done}/${total}`;
    emptyState.classList.toggle('visible', visible.length === 0);
  }

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    // Challenge: prevent duplicate tasks (case-insensitive)
    const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
      const existingLi = [...taskList.children].find(li => {
        const t = tasks.find(tk => tk.id === li.dataset.id);
        return t && t.text.toLowerCase() === text.toLowerCase();
      });
      if (existingLi) {
        existingLi.classList.add('shake');
        setTimeout(() => existingLi.classList.remove('shake'), 350);
        existingLi.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      taskInput.value = '';
      return;
    }

    tasks.push({ id: makeId(), text, done: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
  });

  filterGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    [...filterGroup.children].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });

  // Challenge: sort tasks A-Z / Z-A
  sortBtn.addEventListener('click', () => {
    tasks.sort((a, b) => sortAsc
      ? a.text.localeCompare(b.text)
      : b.text.localeCompare(a.text));
    sortAsc = !sortAsc;
    sortBtn.firstChild.textContent = sortAsc ? 'Urutkan A–Z ' : 'Urutkan Z–A ';
    saveTasks();
    renderTasks();
  });

  renderTasks();

  /* ---------------------------------------------------------
     5. QUICK LINKS (add, open, delete, persist)
  --------------------------------------------------------- */
  const linkForm = document.getElementById('linkForm');
  const linkNameInput = document.getElementById('linkName');
  const linkUrlInput = document.getElementById('linkUrl');
  const linkList = document.getElementById('linkList');

  let links = JSON.parse(localStorage.getItem('dfs_links') || '[]');

  const TILE_COLORS = ['#2f6fed', '#16a34a', '#e0435c', '#a855f7', '#f59e0b', '#0ea5e9'];

  function saveLinks() {
    localStorage.setItem('dfs_links', JSON.stringify(links));
  }

  function normalizeUrl(url) {
    if (!/^https?:\/\//i.test(url)) return 'https://' + url;
    return url;
  }

  function getDomain(url) {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch { return url; }
  }

  function colorForName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return TILE_COLORS[Math.abs(hash) % TILE_COLORS.length];
  }

  function renderLinks() {
    linkList.innerHTML = '';
    links.forEach(link => {
      const a = document.createElement('a');
      a.className = 'link-tile';
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      const icon = document.createElement('div');
      icon.className = 'link-icon';
      icon.style.background = colorForName(link.name);
      icon.textContent = link.name.trim().slice(0, 2).toUpperCase();

      const meta = document.createElement('div');
      meta.className = 'link-meta';
      const nameEl = document.createElement('span');
      nameEl.className = 'name';
      nameEl.textContent = link.name;
      const domainEl = document.createElement('span');
      domainEl.className = 'domain';
      domainEl.textContent = getDomain(link.url);
      meta.appendChild(nameEl);
      meta.appendChild(domainEl);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'link-remove';
      removeBtn.innerHTML = '✕';
      removeBtn.setAttribute('aria-label', `Hapus tautan ${link.name}`);
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        links = links.filter(l => l.id !== link.id);
        saveLinks();
        renderLinks();
      });

      a.appendChild(icon);
      a.appendChild(meta);
      a.appendChild(removeBtn);
      linkList.appendChild(a);
    });
  }

  linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    if (!name || !url) return;

    links.push({ id: makeId(), name, url: normalizeUrl(url) });
    saveLinks();
    renderLinks();
    linkNameInput.value = '';
    linkUrlInput.value = '';
  });

  renderLinks();

  /* =========================================================
     6. LONCENG — Dua fungsi:
        a) Audio alarm + notif saat Focus Timer selesai
        b) Badge & toast tugas belum selesai saat halaman dibuka
  ========================================================= */

  const bellBtn   = document.getElementById('bellBtn');
  const bellBadge = document.getElementById('bellBadge');

  // ── Audio alarm via Web Audio API ──
  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[880, 0], [1100, 0.65], [880, 1.3]].forEach(([freq, delay]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.55);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.6);
      });
    } catch (e) { /* Web Audio tidak tersedia */ }
  }

  // ── Toast in-app ──
  function showToast(title, message, type) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.innerHTML = `
      <span class="toast-bell" aria-hidden="true">${type === 'alarm' ? '⏰' : '🔔'}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" aria-label="Tutup">✕</button>`;
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 260);
    });
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('out');
        setTimeout(() => toast.remove(), 260);
      }
    }, type === 'alarm' ? 8000 : 5000);
  }

  // ── Dipanggil saat timer selesai ──
  function onTimerFinished() {
    const mins = totalSeconds / 60;
    playAlarm();
    showToast('⏰ Sesi Fokus Selesai!',
      `Kamu telah fokus selama ${mins} menit. Waktunya istirahat 🎉`, 'alarm');
    if (Notification.permission === 'granted') {
      new Notification('Sesi Fokus Selesai! ⏰', {
        body: `Fokus ${mins} menit selesai. Istirahat dulu ya!`
      });
    }
    bellBtn.classList.add('bell-ring');
    setTimeout(() => bellBtn.classList.remove('bell-ring'), 1000);
  }

  // ── Badge tugas belum selesai ──
  function updateBellBadge() {
    const pending = tasks.filter(t => !t.done).length;
    if (pending > 0) {
      bellBadge.textContent = pending > 9 ? '9+' : String(pending);
      bellBadge.classList.remove('hidden');
    } else {
      bellBadge.classList.add('hidden');
    }
  }
  updateBellBadge();

  // Patch saveTasks agar badge ikut update setiap perubahan tugas
  const _origSaveTasks = saveTasks;
  saveTasks = function() { _origSaveTasks(); updateBellBadge(); };

  // ── Klik lonceng: ringkasan tugas + minta izin notifikasi ──
  bellBtn.addEventListener('click', () => {
    const pending = tasks.filter(t => !t.done).length;
    const done    = tasks.filter(t =>  t.done).length;
    if (pending > 0)
      showToast(`🔔 ${pending} tugas belum selesai`,
        `${done} selesai · ${pending} masih aktif`, 'info');
    else if (tasks.length > 0)
      showToast('✅ Semua tugas selesai!', 'Kerja bagus hari ini 🎉', 'info');
    else
      showToast('📋 Belum ada tugas', 'Tambahkan tugas di daftar tugas', 'info');

    if (Notification.permission === 'default') Notification.requestPermission();
  });

});
