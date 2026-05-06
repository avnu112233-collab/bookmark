function updateDashboardStats(targetDate) {
    if (!allData || allData.length === 0) return;

    const filteredByDate = allData.filter(r => r.date === targetDate);
    console.log(`📊 Stats for ${targetDate}:`, filteredByDate.length, 'records');

    // Calculate stats
    const logins = filteredByDate.filter(r => r.log_type === 'LOGIN').length;

    // Calculate Currently Inside (Latest status for each person on that day)
    const processedIds = new Set();
    let currentInsideCount = 0;
    const insideUsersList = [];

    // Since allData is sorted descending (Newest first), the first record we meet for an ID is the latest status
    for (const record of filteredByDate) {
        if (!processedIds.has(record.fp_id)) {
            processedIds.add(record.fp_id);
            if (record.log_type === 'LOGIN') {
                currentInsideCount++;
                insideUsersList.push(record);
            }
        }
    }

    // Update DOM
    const visitsEl = document.getElementById('visitsToday');
    if (visitsEl) visitsEl.textContent = logins;

    const activeEl = document.getElementById('activePeople');
    if (activeEl) activeEl.textContent = currentInsideCount;

    // Update Live Badge in Side Panel
    const liveBadge = document.getElementById('liveInsideCount');
    if (liveBadge) liveBadge.textContent = currentInsideCount;

    // Update Currently Inside Table
    const insideTbody = document.getElementById('dashboardInsideTableContent');
    if (insideTbody) {
        if (insideUsersList.length === 0) {
            insideTbody.innerHTML = `
            <tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--color-text-secondary);">No one inside</td></tr>
        `;
        } else {
            let insideHtml = '';
            insideUsersList.forEach(user => {
                let timeStr = user.time;
                try {
                    const d = new Date(`${user.date} ${user.time}`);
                    timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                } catch (e) { }

                insideHtml += `
            <tr>
                <td style="font-weight: 500;">${user.name}</td>
                <td><span class="usn-badge">${user.usn || ''}</span></td>
                <td><span style="color: var(--color-primary); font-weight: 600;">${user.class || '—'}</span></td>
                <td style="text-align: left; color: var(--color-success); font-weight: 600;">${timeStr}</td>
            </tr>
        `;
            });
            insideTbody.innerHTML = insideHtml;
        }
    }

    // Update Label
    const labelEl = document.querySelector('.stat-card.login .stat-label');
    if (labelEl) {
        const today = new Date().toISOString().split('T')[0];
        labelEl.textContent = targetDate === today ? 'Visits Today' : `Visits (${targetDate})`;
    }
}

function switchDashboardTab(tabName) {
    const recentView = document.getElementById('dashboard-recent-view');
    const insideView = document.getElementById('dashboard-inside-view');
    const tabs = document.querySelectorAll('.tab-btn');

    if (tabName === 'recent') {
        recentView.style.display = 'block';
        insideView.style.display = 'none';

        tabs[0].classList.add('active');
        tabs[0].style.backgroundColor = 'var(--color-primary)';
        tabs[0].style.color = '#fff';
        tabs[0].style.border = '1px solid var(--color-primary)';

        tabs[1].classList.remove('active');
        tabs[1].style.backgroundColor = 'rgba(255,255,255,0.05)';
        tabs[1].style.color = 'var(--color-text)';
        tabs[1].style.border = '1px solid var(--color-border)';
    } else {
        recentView.style.display = 'none';
        insideView.style.display = 'block';

        tabs[1].classList.add('active');
        tabs[1].style.backgroundColor = 'var(--color-primary)';
        tabs[1].style.color = '#fff';
        tabs[1].style.border = '1px solid var(--color-primary)';

        tabs[0].classList.remove('active');
        tabs[0].style.backgroundColor = 'rgba(255,255,255,0.05)';
        tabs[0].style.color = 'var(--color-text)';
        tabs[0].style.border = '1px solid var(--color-border)';
    }
}

// RENDER DASHBOARD RECENT TABLE
function renderTable() {
    const tbody = document.getElementById('dashboardAttendanceTableContent');
    if (!tbody) return;

    // Show latest 10 records
    const recentLogs = allData.slice(0, 10);

    if (recentLogs.length === 0) {
        tbody.innerHTML = `
    <tr>
    <td colspan="6" style="text-align: center; padding: 20px; color: var(--color-text-secondary);">
        No recent records found
    </td>
            </tr>
    `;
        return;
    }

    let html = '';
    recentLogs.forEach(record => {
        const badgeClass = record.log_type === 'LOGIN' ? 'badge-login' : 'badge-logout';
        const badgeText = record.log_type;

        // Parse class for branch if available
        let branch = record.class || '—';
        if (branch.includes('-')) {
            const parts = branch.split('-');
            if (parts.length >= 2) branch = parts[1];
        }

        // Format Time
        let timeStr = record.time;
        try {
            const d = new Date(record.created_at || `${record.date} ${record.time} `);
            timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) { }

        html += `
    <tr>
                <td style="font-weight: 500;">${record.name}</td>
                <td><span class="usn-badge">${record.usn}</span></td>
                <td>${branch}</td>
                <td>${timeStr}</td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            </tr>
    `;
    });

    tbody.innerHTML = html;
}

// CURRENTLY INSIDE MODAL LOGIC
function showCurrentlyInsideModal() {
    const tbody = document.getElementById('insideList');
    const countEl = document.getElementById('insideCount');

    // Calculate who's currently inside from allData
    const processedIds = new Map(); // fp_id -> {record, isInside}

    // Sort by time (newest first) and process
    const todayData = allData.filter(r => r.date === new Date().toISOString().split('T')[0]);
    todayData.forEach(record => {
        if (record.fp_id && !processedIds.has(record.fp_id)) {
            processedIds.set(record.fp_id, {
                record: record,
                isInside: record.log_type === 'LOGIN'
            });
        }
    });

    // Filter only those who are inside
    const insidePeople = Array.from(processedIds.values())
        .filter(item => item.isInside)
        .map(item => item.record);

    countEl.textContent = insidePeople.length;

    if (insidePeople.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 30px; color: var(--color-text-secondary);">
                No one is currently inside the library.
            </td>
        </tr>
    `;
    } else {
        tbody.innerHTML = insidePeople.map(person => {
            // Derive class from USN if missing
            let classInfo = person.class;
            if (!classInfo && person.usn) {
                const match = person.usn.match(/4VV(\d{2})([A-Z]{2})/);
                if (match) {
                    const branch = match[2];
                    classInfo = `5-${branch}-A`;
                }
            }
            classInfo = classInfo || '—';

            return `
            <tr>
                <td style="padding: 10px;"><strong>${person.name || '—'}</strong></td>
                <td style="padding: 10px;">${person.usn || '—'}</td>
                <td style="padding: 10px;">${classInfo}</td>
                <td style="padding: 10px; text-align: right;">${person.time}</td>
            </tr>
        `;
        }).join('');
    }

    document.getElementById('currentlyInsideModal').classList.add('active');
}

function closeCurrentlyInsideModal() {
    document.getElementById('currentlyInsideModal').classList.remove('active');
}

// TOGGLE INSIDE LIST IN SAME TABLE
function toggleInsideList() {
    const btn = document.getElementById('viewListBtn');
    const title = document.getElementById('tableTitle');

    window.showingInsideList = !window.showingInsideList;

    if (window.showingInsideList) {
        btn.textContent = 'View all';
        title.textContent = '📍 Currently Inside';
        showInsideListInTable();
    } else {
        btn.textContent = 'View list';
        title.textContent = 'Recent Attendance Records';
        renderTable(allData);
    }
}

function showInsideListInTable() {
    // Calculate who's currently inside from allData
    const processedIds = new Map();

    const todayData = allData.filter(r => r.date === new Date().toISOString().split('T')[0]);
    todayData.forEach(record => {
        if (record.fp_id && !processedIds.has(record.fp_id)) {
            processedIds.set(record.fp_id, {
                record: record,
                isInside: record.log_type === 'LOGIN'
            });
        }
    });

    const insidePeople = Array.from(processedIds.values())
        .filter(item => item.isInside)
        .map(item => item.record);

    // Render in the same table format as attendance records
    const tableContent = document.getElementById('tableContent');

    if (insidePeople.length === 0) {
        tableContent.innerHTML = `
        <div style="text-align: center; padding: 50px; color: var(--color-text-secondary);">
            <p style="font-size: 18px;">No one is currently inside the library.</p>
        </div>
    `;
        return;
    }

    let html = '<table class="table"><thead><tr>';
    html += '<th>Name</th>';
    html += '<th>USN</th>';
    html += '<th>BRANCH</th>';
    html += '<th>Date</th>';
    html += '<th>Time</th>';
    html += '<th>Status</th>';
    html += '</tr></thead><tbody>';

    insidePeople.forEach(person => {
        let classInfo = person.class;
        if (!classInfo && person.usn) {
            const match = person.usn.match(/4VV(\d{2})([A-Z]{2})/);
            if (match) {
                const branch = match[2];
                classInfo = `5-${branch}-A`;
            }
        }
        classInfo = classInfo || '—';

        html += `
        <tr>
            <td>${person.name || '—'}</td>
            <td>${person.usn || '—'}</td>
            <td>${classInfo}</td>
            <td>${formatDate(person.date)}</td>
            <td>${person.time}</td>
            <td><span class="badge badge-success">INSIDE</span></td>
        </tr>
    `;
    });

    html += '</tbody></table>';
    tableContent.innerHTML = html;
}

function updateInsideListPanel() {
    // This function is no longer needed but kept for compatibility
    console.log('updateInsideListPanel is deprecated');
}
