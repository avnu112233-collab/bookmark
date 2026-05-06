// INITIALIZATION
function init() {
    // Load saved theme
    loadTheme();

    // setDefaultDate();
    updateTime();
    fetchData();
    setInterval(updateTime, 1000);
    setInterval(fetchData, 3000); // Auto-refresh every 3 seconds

    // Check for midnight reset every minute
    setInterval(checkMidnightReset, 60000);
}

// VIEW NAVIGATION
function switchView(viewName) {
    console.log('Switching to view:', viewName);

    // 1. Hide all views
    document.querySelectorAll('.view').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none'; // Force hide
    });

    // 2. Show target view
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
        targetView.style.display = 'block'; // Force show
    } else {
        console.error('View not found:', viewName);
    }

    // 3. Update nav links
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const targetLink = document.getElementById(`nav-${viewName}`);
    if (targetLink) {
        targetLink.classList.add('active');
    }

    // 4. Refresh data if needed
    if (viewName === 'borrowed') {
        renderBorrowedBooks();
    } else if (viewName === 'attendance') {
        renderAttendanceLogs();
    }
}

// FILTER DROPDOWN AND MODAL FUNCTIONS
function toggleFilterDropdown(type) {
    const dropdownId = type === 'borrowed' ? 'borrowedFilterDropdown' : 'attendanceFilterDropdown';
    const dropdown = document.getElementById(dropdownId);

    if (!dropdown) {
        console.error('Dropdown not found:', dropdownId);
        return;
    }

    // Close other dropdown if open
    const otherDropdownId = type === 'borrowed' ? 'attendanceFilterDropdown' : 'borrowedFilterDropdown';
    const otherDropdown = document.getElementById(otherDropdownId);
    if (otherDropdown) otherDropdown.style.display = 'none';

    // Toggle current dropdown - explicitly set display property
    const isCurrentlyHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
    dropdown.style.display = isCurrentlyHidden ? 'block' : 'none';

    console.log('Toggled dropdown:', dropdownId, 'to', dropdown.style.display);
}

// Wrapper functions for easier calling
function toggleAttendanceFilterDropdown() {
    toggleFilterDropdown('attendance');
}

function toggleBorrowedFilterDropdown() {
    toggleFilterDropdown('borrowed');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function (event) {
    const borrowedDropdown = document.getElementById('borrowedFilterDropdown');
    const attendanceDropdown = document.getElementById('attendanceFilterDropdown');
    const borrowedBtn = document.getElementById('borrowedFilterBtn');
    const attendanceBtn = document.getElementById('attendanceFilterBtn');

    // Check if click is outside Borrowed dropdown AND its button
    // important: check if elements exist to avoid errors
    if (borrowedDropdown && borrowedBtn) {
        if (!borrowedDropdown.contains(event.target) && !borrowedBtn.contains(event.target)) {
            borrowedDropdown.style.display = 'none';
        }
    }

    // Check if click is outside Attendance dropdown AND its button
    if (attendanceDropdown && attendanceBtn) {
        if (!attendanceDropdown.contains(event.target) && !attendanceBtn.contains(event.target)) {
            attendanceDropdown.style.display = 'none';
        }
    }
});

function openFilterModal(filterType) {
    // Close all dropdowns
    document.getElementById('borrowedFilterDropdown').style.display = 'none';
    document.getElementById('attendanceFilterDropdown').style.display = 'none';

    const modal = document.getElementById('filterModal');
    const title = document.getElementById('filterModalTitle');
    const content = document.getElementById('filterModalContent');

    let html = '';
    let currentType = '';

    if (filterType === 'borrowedSem' || filterType === 'attendanceSem') {
        currentType = filterType === 'borrowedSem' ? 'borrowed' : 'attendance';
        title.textContent = 'Filter by Semester';
        html = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0;">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(sem => `
                <button class="btn btn-outline" onclick="applyFilter('${currentType}Sem', '${sem}')" style="padding: 16px;">
                    Semester ${sem}
                </button>
            `).join('')}
        </div>
        <div class="modal-actions">
            <button class="btn btn-outline" onclick="closeFilterModal()">Cancel</button>
        </div>
    `;
    } else if (filterType === 'borrowedBranch' || filterType === 'attendanceBranch') {
        currentType = filterType === 'borrowedBranch' ? 'borrowed' : 'attendance';
        title.textContent = 'Filter by Branch';
        const branches = ['CS', 'EC', 'ME', 'CV', 'EE'];
        html = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0;">
            ${branches.map(branch => `
                <button class="btn btn-outline" onclick="applyFilter('${currentType}Branch', '${branch}')" style="padding: 16px;">
                    ${branch}
                </button>
            `).join('')}
        </div>
        <div class="modal-actions">
            <button class="btn btn-outline" onclick="closeFilterModal()">Cancel</button>
        </div>
    `;
    } else if (filterType === 'borrowedDate' || filterType === 'attendanceDate') {
        currentType = filterType === 'borrowedDate' ? 'borrowed' : 'attendance';
        title.textContent = 'Filter by Date';
        html = `
        <div style="margin: 20px 0;">
            <label style="display: block; margin-bottom: 8px; color: var(--color-text); font-weight: 600;">Select Date</label>
            <input type="date" id="tempDatePicker" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text); font-size: 16px;">
        </div>
        <div class="modal-actions">
            <button class="btn btn-outline" onclick="closeFilterModal()">Cancel</button>
            <button class="btn btn-primary" onclick="applyDateFilter('${currentType}')">Apply</button>
        </div>
    `;
    }

    content.innerHTML = html;
    modal.classList.add('active');
}

function closeFilterModal() {
    document.getElementById('filterModal').classList.remove('active');
}

function applyFilter(filterField, value) {
    document.getElementById(filterField + 'Filter').value = value;
    closeFilterModal();

    // Apply the filter
    if (filterField.startsWith('borrowed')) {
        applyBorrowedFilters();
    } else {
        renderAttendanceLogs();
    }
}

function applyDateFilter(type) {
    const date = document.getElementById('tempDatePicker').value;
    if (date) {
        document.getElementById(type + 'DateFilter').value = date;
        closeFilterModal();

        if (type === 'borrowed') {
            applyBorrowedFilters();
        } else {
            renderAttendanceLogs();
        }
    }
}

// SCAN FINGERPRINT FILTER (Biometric Verify + Manual Fallback)
async function scanFingerprintFilter(type) {
    const selector = type === 'borrowed'
        ? 'button[onclick="scanFingerprintFilter(\'borrowed\')"]'
        : 'button[onclick="scanFingerprintFilter(\'attendance\')"]';

    const btn = document.querySelector(selector);
    const originalHTML = btn ? btn.innerHTML : 'Scan Fingerprint';

    if (btn) {
        btn.innerHTML = 'Connecting...';
        btn.disabled = true;
    }

    try {
        // Determine Action based on Global Mode
        let action = 'borrow'; // default
        if (typeof currentMode !== 'undefined' && currentMode === 'return') {
            action = 'return';
        }
        // If in attendance view
        if (type === 'attendance') {
            action = 'attendance';
        }

        console.log(`Starting fingerprint scan for: ${action}`);

        // 1. Trigger Verification (sending JSON as requested)
        const response = await fetch(`http://${ESP32_IP}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: action })
        });

        const startData = await response.json();
        if (startData.status !== 'success') {
            throw new Error(startData.message || 'Device busy or Invalid Action');
        }

        if (btn) btn.innerHTML = 'Waiting for fingerprint...';

        // 2. Poll for Result
        let attempts = 0;
        const maxAttempts = 30; // 30s

        const pollVerify = async () => {
            if (attempts >= maxAttempts) {
                if (btn) {
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                }
                alert("Scan timed out.");
                return;
            }

            try {
                const res = await fetch(`http://${ESP32_IP}/status`);
                const stat = await res.json();

                console.log("Verify Stat:", stat);

                if (stat.status === 'success') {
                    // MATCH FOUND!
                    const name = stat.matched_name || '';
                    const usn = stat.matched_usn || '';
                    const branch = stat.matched_branch || '';

                    if (btn) {
                        btn.innerHTML = '✓ Found';
                        setTimeout(() => {
                            btn.innerHTML = originalHTML;
                            btn.disabled = false;
                        }, 2000);
                    }

                    // Alert Details as requested
                    alert(`Match found\n\nNAME: ${name}\nUSN: ${usn}\nBRANCH: ${branch}`);

                    const fpId = stat.matched_fp_id; // Get fp_id if available

                    if (type === 'attendance') {
                        if (fpId) {
                            loadAttendanceForFp(fpId);
                        } else {
                            loadAttendanceForUSN(usn);
                        }
                    } else {
                        applySearchResult(name, type);
                    }
                    return;
                }
                else if (stat.status === 'not_found') {
                    if (btn) {
                        btn.innerHTML = originalHTML;
                        btn.disabled = false;
                    }
                    // Manual Fallback
                    if (confirm('Fingerprint not registered.\nDo you want to enter USN manually?')) {
                        const manualUSN = prompt(`Enter USN manually for ${action}:`);
                        if (manualUSN) verifyByUSN(manualUSN.trim().toUpperCase(), action, type);
                    }
                    return;
                }
                else if (stat.status === 'error') {
                    alert("Device Error: " + stat.error);
                    if (btn) {
                        btn.innerHTML = originalHTML;
                        btn.disabled = false;
                    }
                    return;
                }

                // Continue polling
                attempts++;
                setTimeout(pollVerify, 1000);

            } catch (err) {
                console.error("Poll error:", err);
                attempts++;
                setTimeout(pollVerify, 1000);
            }
        };

        pollVerify();

    } catch (e) {
        console.error("Verification failed:", e);
        alert("Could not connect to scanner. Check Wifi/IP.");
        if (btn) {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }
}

// Helper to update UI
function applySearchResult(name, type) {
    if (type === 'borrowed') {
        const searchInput = document.getElementById('borrowedSearch');
        if (searchInput) {
            searchInput.value = name;
            renderBorrowedBooks();
        }
    } else {
        const searchInput = document.getElementById('attendanceSearch');
        if (searchInput) {
            searchInput.value = name;
            renderAttendanceLogs();
        }
    }
}

// SHELF MODES
function setShelfMode(mode) {
    currentMode = mode;
    const btnBorrow = document.getElementById('btn-borrow');
    const btnReturn = document.getElementById('btn-return');

    if (mode === 'borrow') {
        // Borrow Active: Borrow Button gets 'borrow' style (filled), Return Button gets 'return' style (outline)
        btnBorrow.className = 'shelf-action-btn borrow';
        btnReturn.className = 'shelf-action-btn return';

        document.getElementById('step-text-2').textContent = 'Enter Book Code';

        // Update state in Supabase for ESP32
        enableBorrowMode();
    } else {
        // Return Active: Borrow Button gets 'return' style (outline), Return Button gets 'borrow' style (filled)
        btnBorrow.className = 'shelf-action-btn return';
        btnReturn.className = 'shelf-action-btn borrow';

        document.getElementById('step-text-2').textContent = 'Select Book';

        // Update state in Supabase for ESP32
        enableReturnMode();
    }
}

// AUTO-EXPANDING SIDEBAR - Only on direct hover
const sidebar = document.getElementById('sidebar');

if (sidebar) {
    sidebar.addEventListener('mouseenter', function () {
        this.classList.add('expanded');
    });

    sidebar.addEventListener('mouseleave', function () {
        this.classList.remove('expanded');
    });
}

// Init when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
