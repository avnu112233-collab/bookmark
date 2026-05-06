// SHARED HELPER: RENDER ATTENDANCE ROWS
function renderAttendanceRows(rows) {
    const tbody = document.getElementById('attendanceTableContent');
    if (!tbody) return;

    if (!rows || rows.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-text-secondary);">
                No records found.
            </td>
        </tr>`;
        return;
    }

    let html = '';
    rows.forEach(record => {
        const name = record.NAME || record.name || '\u2014';
        const usn = record.USN || record.usn || '\u2014';
        const classInfo = record.class ||
            ((record.branch || record.BRANCH) ? `${record.branch}-${record.semester || ''}` : '') ||
            '\u2014';

        const isLogin = (record.log_type === 'LOGIN' || record.type === 'IN');
        const badge = isLogin ?
            '<span class="badge badge-login">LOGIN</span>' :
            '<span class="badge badge-logout">LOGOUT</span>';

        // Use existing format helper if available
        let dateStr = record.date ? (typeof formatDate === 'function' ? formatDate(record.date) : new Date(record.date).toLocaleDateString()) :
            (record.created_at ? new Date(record.created_at).toLocaleDateString() : '\u2014');

        let timeStr = record.time || (record.created_at ? new Date(record.created_at).toLocaleTimeString() : '\u2014');

        html += `
    <tr>
        <td>${name}</td>
        <td>${usn}</td>
        <td>${classInfo}</td>
        <td>${dateStr}</td>
        <td>${timeStr}</td>
        <td>${badge}</td>
    </tr>
    `;
    });
    tbody.innerHTML = html;
}

function renderAttendanceLogs() {
    const tbody = document.getElementById('attendanceTableContent');
    if (!tbody) return;

    const searchTerm = document.getElementById('attendanceSearch') ? document.getElementById('attendanceSearch').value.toLowerCase() : '';

    // Filter data based on search
    const semFilter = document.getElementById('attendanceSemFilter') ? document.getElementById('attendanceSemFilter').value : '';
    const branchFilter = document.getElementById('attendanceBranchFilter') ? document.getElementById('attendanceBranchFilter').value : '';

    // Priority: Quick Filter > Dropdown Filter
    let dateFilter = document.getElementById('attendanceDateQuickFilter') ? document.getElementById('attendanceDateQuickFilter').value : '';
    if (!dateFilter) {
        dateFilter = document.getElementById('attendanceDateFilter') ? document.getElementById('attendanceDateFilter').value : '';
    }

    let filteredData = allData;

    // Apply all filters
    filteredData = filteredData.filter(record => {
        // Search filter
        if (searchTerm) {
            const searchStr = `${record.name} ${record.usn} ${record.class || ''} `.toLowerCase();
            if (!searchStr.includes(searchTerm)) return false;
        }

        // Name Filter (Specific from dropdown)
        const nameFilter = document.getElementById('attendanceFilterName') ? document.getElementById('attendanceFilterName').value.toLowerCase() : '';
        if (nameFilter && (!record.name || !record.name.toLowerCase().includes(nameFilter))) return false;

        // USN Filter (Specific from dropdown)
        const usnFilter = document.getElementById('attendanceFilterUSN') ? document.getElementById('attendanceFilterUSN').value.toLowerCase() : '';
        if (usnFilter && (!record.usn || !record.usn.toLowerCase().includes(usnFilter))) return false;

        // Semester filter
        if (semFilter && record.class) {
            const sem = record.class.split('-')[0]; // Extract SEM from "5-CS-A"
            if (sem !== semFilter) return false;
        }

        // Branch filter
        if (branchFilter && record.class) {
            const branch = record.class.split('-')[1]; // Extract BRANCH from "5-CS-A"
            if (branch !== branchFilter) return false;
        }

        // Date filter
        if (dateFilter && record.date) {
            const recordDate = new Date(record.date).toISOString().split('T')[0];
            if (recordDate !== dateFilter) return false;
        }

        return true;
    });

    // Use Shared Renderer
    renderAttendanceRows(filteredData);
}

function applyAttendanceFilters() {
    // Simply call renderAttendanceLogs which now has all the filter logic
    renderAttendanceLogs();
}

function clearAttendanceFilters() {
    document.getElementById('attendanceSearch').value = '';
    if (document.getElementById('attendanceFilterName')) document.getElementById('attendanceFilterName').value = '';
    if (document.getElementById('attendanceFilterUSN')) document.getElementById('attendanceFilterUSN').value = '';
    document.getElementById('attendanceSemFilter').value = '';
    document.getElementById('attendanceBranchFilter').value = '';
    document.getElementById('attendanceDateFilter').value = '';
    renderAttendanceLogs(); // Re-render with cleared filters
}

// Load specific attendance logs for a user
async function loadAttendanceForUSN(usn) {
    try {
        // Update header or status
        const tbody = document.getElementById('attendanceTableContent');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading records...</td></tr>';

        // Fetch from Supabase
        const { data, error } = await supabaseClient
            .from('transactions')
            .select('*')
            .eq('usn', usn) // Match correct column
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No attendance records found for this user.</td></tr>';
            return;
        }

        // Update Search Box to show context
        const search = document.getElementById('attendanceSearch');
        if (search) search.value = usn;

        // Shared Render
        renderAttendanceRows(data);

    } catch (err) {
        console.error("Error loading specific logs:", err);
        alert("Failed to load attendance records: " + err.message);
    }
}

// Load attendance logs by Fingerprint ID
async function loadAttendanceForFp(fpId) {
    try {
        const tbody = document.getElementById('attendanceTableContent');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading by Fingerprint...</td></tr>';

        const { data, error } = await supabaseClient
            .from('transactions')
            .select('*')
            .eq('fp_id', fpId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderAttendanceRows(data);
    } catch (err) {
        console.error("loadAttendanceForFp error:", err);
        alert("Error loading by fingerprint: " + err.message);
    }
}

function handleDateQuickFilter(val) {
    console.log("Quick Date Filter Selected:", val);
    renderAttendanceLogs();
}

// PDF Export Functions
function downloadAttendancePDF() {
    if (!window.jspdf) {
        alert('PDF Library not loaded. Please try again.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Attendance Logs Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()} `, 14, 22);

    doc.autoTable({
        html: '#attendanceTable',
        startY: 25,
        theme: 'grid',
        headStyles: { fillColor: [34, 184, 163] },
        styles: { fontSize: 8 }
    });

    doc.save('attendance_report.pdf');
}

function downloadAllAttendancePDF() {
    if (!window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("All Attendance Logs (Full Database)", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Prepare Data Body from allData array
    const tableBody = allData.map(record => {
        let branchDisplay = record.branch || '';
        if (!branchDisplay && record.class) {
            const parts = record.class.split('-');
            if (parts.length > 1) branchDisplay = parts[1];
        }

        return [
            record.name,
            record.usn,
            branchDisplay,
            record.date,
            record.time || (record.created_at ? new Date(record.created_at).toLocaleTimeString() : ''),
            record.log_type === 'LOGIN' ? 'IN' : 'OUT'
        ];
    });

    doc.autoTable({
        head: [['Name', 'USN', 'Branch', 'Date', 'Time', 'Status']],
        body: tableBody,
        startY: 25,
        theme: 'grid',
        headStyles: { fillColor: [34, 184, 163] },
        styles: { fontSize: 8 }
    });

    doc.save('all_attendance_logs.pdf');
}
