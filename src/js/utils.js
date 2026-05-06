// THEME MANAGEMENT
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeIcons(true);
    } else {
        document.body.classList.remove('light-theme');
        updateThemeIcons(false);
    }
}

function updateThemeIcons(isLight) {
    const icon = isLight ? '🌙' : '☀️';
    document.querySelectorAll('button[onclick="toggleTheme()"]').forEach(btn => {
        btn.textContent = icon;
    });
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');

    // Save preference
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    updateThemeIcons(isLight);
}

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
    const timeEl = document.getElementById('currentTime');
    if (timeEl) timeEl.textContent = timeStr;
}

// FORMAT DATE TO DD-MM-YY
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
}
