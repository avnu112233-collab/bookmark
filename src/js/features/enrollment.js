// SCANNING AND REGISTRATION FLOW
let scannedStudent = null;
let scanTimer = null;

async function startScanning() {
    // STEP 1: Switch ESP32 to appropriate SHELF mode based on current UI mode
    if (currentMode === 'borrow') {
        console.log('🔄 Switching ESP32 to BORROW mode for shelf operations...');
        await enableBorrowMode();
    } else if (currentMode === 'return') {
        console.log('🔄 Switching ESP32 to RETURN mode for shelf operations...');
        await enableReturnMode();
    }

    // STEP 2: Show scanning modal
    document.getElementById('scanningModal').classList.add('active');

    const statusEl = document.getElementById('scan-status');
    if (statusEl) {
        statusEl.textContent = 'Please scan your fingerprint on the physical sensor...';
        statusEl.style.color = 'var(--color-primary)';
    }

    const startTime = new Date();
    let pollingAttempts = 0;
    const maxAttempts = 10; // Poll for 10 seconds

    // Clear any existing timer
    if (scanTimer) clearTimeout(scanTimer);

    // Polling function
    const pollForScan = async () => {
        pollingAttempts++;
        console.log(`Searching for scan... Attempt ${pollingAttempts}/${maxAttempts}`);

        try {
            // Check for records created AFTER the scan button was clicked
            // We need to fetch the very latest record
            const { data, error } = await supabaseClient
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                const latestRecord = data[0];
                const recordTime = new Date(latestRecord.created_at);

                // Check if this record is new (created after we started scanning)
                // Allow a small buffer (e.g., -2 seconds) in case of clock skew, but mainly look forward
                if (recordTime > startTime) {
                    console.log('✅ New scan detected:', latestRecord);

                    // Scan Found!
                    document.getElementById('scanningModal').classList.remove('active');

                    if (currentMode === 'borrow' || currentMode === 'return') {
                        // Open the modal with student details
                        showRegistrationModal({
                            name: latestRecord.name,
                            usn: latestRecord.usn,
                            branch: latestRecord.branch || 'Unknown Branch' // Handle missing branch
                        });
                    }

                    // Refresh main table
                    fetchData();
                    return; // Stop polling
                }
            }
        } catch (e) {
            console.error("Polling error:", e);
        }

        if (pollingAttempts < maxAttempts) {
            scanTimer = setTimeout(pollForScan, 1000); // Retry in 1 second
        } else {
            // Timeout - No scan found
            document.getElementById('scanningModal').classList.remove('active');

            // Show "No fingerprint found" message on the main UI
            const mainPageStatus = document.getElementById('scan-status');
            if (mainPageStatus) {
                mainPageStatus.textContent = 'No fingerprint found';
                mainPageStatus.style.color = 'var(--color-text-secondary)';
                mainPageStatus.style.fontSize = '12px';
            } else {
                alert('No fingerprint found');
            }
        }
    };

    // Start polling
    scanTimer = setTimeout(pollForScan, 1000);
}

function showRegistrationModal(student) {
    document.getElementById('studentName').textContent = student.name;
    document.getElementById('studentUSN').textContent = student.usn;
    document.getElementById('studentBranch').textContent = student.branch;
    document.getElementById('bookIdInput').value = '';
    document.getElementById('registerBtn').disabled = true;
    document.getElementById('registerBtn').style.opacity = '0.5';
    document.getElementById('registrationModal').classList.add('active');
    // Set global scannedStudent
    scannedStudent = student;
}

function openUsnModal() {
    // Stop scanning simulation
    if (scanTimer) clearTimeout(scanTimer);
    document.getElementById('scanningModal').classList.remove('active');
    document.getElementById('manualUsnInput').value = '';
    document.getElementById('usnModal').classList.add('active');
    document.getElementById('manualUsnInput').focus();
}

function closeUsnModal() {
    document.getElementById('usnModal').classList.remove('active');
}

function closeScanningModal() {
    // Stop any ongoing scan polling
    if (scanTimer) clearTimeout(scanTimer);
    // Close the modal
    document.getElementById('scanningModal').classList.remove('active');
    // Reset the scan status
    const statusEl = document.getElementById('scan-status');
    if (statusEl) {
        statusEl.textContent = 'Ready to scan.';
        statusEl.style.color = 'var(--color-text-secondary)';
    }
}

function submitUsn() {
    const usn = document.getElementById('manualUsnInput').value.trim().toUpperCase();
    if (!usn) {
        alert('Please enter a valid USN');
        return;
    }

    // In a real app, we would fetch student details from DB here
    // For now, we mock it based on the input
    scannedStudent = {
        name: 'Manual Entry User', // Placeholder since we don't have a DB lookup yet
        usn: usn,
        branch: 'Unknown Branch',
        fpId: 'MANUAL'
    };

    // Simulating branch detection from USN (e.g., 4VV21CS021 -> CS)
    if (usn.includes('CS')) scannedStudent.branch = 'Computer Science';
    else if (usn.includes('EC')) scannedStudent.branch = 'Electronics & Comm.';
    else if (usn.includes('ME')) scannedStudent.branch = 'Mechanical';
    else if (usn.includes('CV')) scannedStudent.branch = 'Civil Engineering';

    closeUsnModal();

    // Show appropriate modal based on mode
    if (currentMode === 'borrow') {
        showRegistrationModal(scannedStudent);
    } else {
        showReturnModal(scannedStudent);
    }
}

function closeRegistrationModal() {
    document.getElementById('registrationModal').classList.remove('active');
    scannedStudent = null;
}

// ENROLLMENT VIEW LOGIC
let enrollmentCancelled = false;

function cancelEnrollment() {
    enrollmentCancelled = true;
    const btn = document.getElementById('btnCaptureFp');
    const status = document.getElementById('enrollFpStatus');

    status.textContent = 'Enrollment cancelled';
    status.style.color = '#ff5454';
    status.style.display = 'block';

    btn.disabled = false;
    btn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 7V2h5" />
        <path d="M17 2h5v5" />
        <path d="M2 17v5h5" />
        <path d="M22 17v5h-5" />
        <path d="M12 9c-1.7 0-3 1.3-3 3v5" />
        <path d="M15 12c0-1.7-1.3-3-3-3" />
        <path d="M18 12c0-3.3-2.7-6-6-6s-6 2.7-6 6v6" />
        <path d="M9 18v-4" />
        <path d="M12 18v-6" />
        <path d="M15 18v-3" />
    </svg>
    Scan Fingerprint`;
    btn.onclick = captureEnrollFingerprint;

    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}

// Fetch student data from Supabase
async function fetchStudentData() {
    const usnInput = document.getElementById('enrollUSN');
    const usn = usnInput.value.trim().toUpperCase();
    const fetchBtn = document.getElementById('btnFetchStudent');
    const fetchStatus = document.getElementById('fetchStatus');
    const detailsSection = document.getElementById('studentDetailsSection');
    const biometricSection = document.getElementById('biometricSection');

    if (!usn) {
        fetchStatus.textContent = '⚠ Please enter a USN';
        fetchStatus.style.color = 'var(--color-warning)';
        fetchStatus.style.display = 'block';
        return;
    }

    if (!supabaseClient) {
        fetchStatus.textContent = '⚠ Database not connected';
        fetchStatus.style.color = 'var(--color-danger)';
        fetchStatus.style.display = 'block';
        return;
    }

    try {
        // Show loading state
        fetchBtn.disabled = true;
        fetchBtn.innerHTML = 'Fetching...';
        fetchStatus.textContent = 'Fetching student data...';
        fetchStatus.style.color = 'var(--color-info)';
        fetchStatus.style.display = 'block';

        // Query Supabase for student data (fetch all columns)
        const { data, error } = await supabaseClient
            .from('Students')
            .select('*')
            .eq('USN', usn)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                fetchStatus.textContent = '✗ Student not found in database';
                fetchStatus.style.color = 'var(--color-danger)';
            } else {
                fetchStatus.textContent = '✗ Error: ' + error.message;
                fetchStatus.style.color = 'var(--color-danger)';
            }
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = 'Fetch';
            return;
        }

        if (data) {
            // Check if already enrolled (has fingerprint)
            const fpId = data.fp_id || data.Fp_id || data.FP_ID || data.fpId;
            if (fpId) {
                fetchStatus.textContent = '⚠ Student already enrolled with fingerprint ID: ' + fpId;
                fetchStatus.style.color = 'var(--color-warning)';
                fetchBtn.disabled = false;
                fetchBtn.innerHTML = 'Fetch';
                return;
            }

            // Display student data (using correct Supabase column names)
            document.getElementById('studentNameDisplay').textContent =
                data.NAME || '-';
            document.getElementById('studentBranchDisplay').textContent =
                data.SECTION || '-';  // Using SECTION for branch display
            document.getElementById('studentSecDisplay').textContent =
                data.SECTION || '-';
            document.getElementById('studentPhoneDisplay').textContent =
                data.MOBILE || '-';
            document.getElementById('studentEmailDisplay').textContent =
                data['E-MAIL'] || '-';  // Use bracket notation for hyphenated column

            // Show sections
            fetchStatus.textContent = '✓ Student data loaded successfully';
            fetchStatus.style.color = 'var(--color-success)';
            detailsSection.style.display = 'block';
            biometricSection.style.display = 'block';

            // Hide fetch status after 2 seconds
            setTimeout(() => {
                fetchStatus.style.display = 'none';
            }, 2000);

            // Reset fetch button
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = 'Fetch';
        }
    } catch (err) {
        console.error('Error fetching student data:', err);
        fetchStatus.textContent = '✗ Connection error';
        fetchStatus.style.color = 'var(--color-danger)';
        fetchBtn.disabled = false;
        fetchBtn.innerHTML = 'Fetch';
    }
}

async function submitEnrollment() {
    const usn = document.getElementById('enrollUSN').value.trim().toUpperCase();
    const fpId = document.getElementById('enrollFpId').value;

    if (!usn) {
        alert('Please enter the USN.');
        return;
    }

    if (!fpId) {
        alert('Please scan fingerprint first (ID not found).');
        return;
    }

    try {
        // Update the fp_id in Supabase Students table
        const { data, error } = await supabaseClient
            .from('Students')
            .update({ fp_id: fpId })
            .eq('USN', usn);

        if (error) {
            console.error('Error updating fingerprint ID:', error);
            alert('Error updating database: ' + error.message);
            return;
        }

        alert(`✓ Enrollment complete! Student ${usn} enrolled with fingerprint ID: ${fpId}`);

        // Reset the entire form to initial state
        document.getElementById('enrollUSN').value = '';
        document.getElementById('enrollFpId').value = '';
        document.getElementById('enrollFpStatus').style.display = 'none';

        // Hide sections
        document.getElementById('studentDetailsSection').style.display = 'none';
        document.getElementById('biometricSection').style.display = 'none';
        document.getElementById('btnCompleteEnrollment').style.display = 'none';
        document.getElementById('fetchStatus').style.display = 'none';

        // Reset button
        const btn = document.getElementById('btnCaptureFp');
        btn.disabled = false;
        btn.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 7V2h5" />
            <path d="M17 2h5v5" />
            <path d="M2 17v5h5" />
            <path d="M22 17v5h-5" />
            <path d="M12 9c-1.7 0-3 1.3-3 3v5" />
            <path d="M15 12c0-1.7-1.3-3-3-3" />
            <path d="M18 12c0-3.3-2.7-6-6-6s-6 2.7-6 6v6" />
            <path d="M9 18v-4" />
            <path d="M12 18v-6" />
            <path d="M15 18v-3" />
        </svg>
        Scan Fingerprint`;
        btn.onclick = captureEnrollFingerprint;

        // Optionally redirect to dashboard
        // switchView('dashboard');
        // if (typeof fetchData === 'function') fetchData();
    } catch (err) {
        console.error('Error in enrollment:', err);
        alert('An error occurred during enrollment.');
    }
}

async function captureEnrollFingerprint() {
    const usnInput = document.getElementById('enrollUSN');
    const usn = usnInput.value.trim().toUpperCase();

    if (!usn) {
        alert('Please enter USN first.');
        return;
    }

    // Reset cancellation flag
    enrollmentCancelled = false;

    // Set Library ESP to Enrollment Mode (Supabase Context)
    if (typeof enableEnrollmentMode === 'function') await enableEnrollmentMode();

    const btn = document.getElementById('btnCaptureFp');
    const status = document.getElementById('enrollFpStatus');

    try {
        btn.disabled = false;
        btn.innerHTML = 'Cancel Enrollment';
        btn.onclick = cancelEnrollment;
        status.textContent = 'Sending request to ESP32...';
        status.style.display = 'block';
        status.style.color = '#3b82f6';

        // Send Form Data to ESP32 (New Schema: 'usn')
        const formData = new FormData();
        formData.append('usn', usn);

        // Note: ESP32 must support CORS for this to work
        const response = await fetch(`http://${ESP32_IP}/enroll`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('ESP32 Response:', data);

        if (data.status === 'success') {
            status.textContent = 'Waiting for fingerprint scan...';
            status.style.color = '#10b981';

            // Poll for completion
            pollEnrollmentStatus();
        } else {
            status.textContent = 'Error: ' + (data.message || 'Device Error');
            status.style.color = '#ef4444';
            btn.disabled = false;
            btn.innerHTML = 'Scan Fingerprint';
            btn.onclick = captureEnrollFingerprint;
        }
    } catch (error) {
        console.error('Connect Error:', error);
        status.textContent = 'Connection error (Check ESP CORS/IP)';
        status.style.color = '#ef4444';
        btn.disabled = false;
        btn.innerHTML = 'Scan Fingerprint';
        btn.onclick = captureEnrollFingerprint;
    }
}

// Poll ESP32 for enrollment status
async function pollEnrollmentStatus() {
    let attempts = 0;
    const maxAttempts = 40; // 40 seconds
    const status = document.getElementById('enrollFpStatus');
    const btn = document.getElementById('btnCaptureFp');

    const checkStatus = async () => {
        // Check if enrollment was cancelled
        if (enrollmentCancelled) {
            console.log('Enrollment cancelled by user');
            return; // Stop polling
        }

        try {
            const response = await fetch(`http://${ESP32_IP}/status`);
            const data = await response.json();

            console.log('Status Polling:', data.status);

            if (data.status === 'scanning') {
                status.textContent = 'Place finger on sensor NOW!';
                status.style.color = '#f59e0b';
            } else if (data.status === 'uploading') {
                status.textContent = 'Uploading to database...';
                status.style.color = '#3b82f6';
            } else if (data.status === 'success') {
                status.textContent = '✓ Enrollment Successful!';
                status.style.color = '#10b981';
                btn.disabled = false;
                btn.innerHTML = 'Scan Again';
                btn.onclick = captureEnrollFingerprint;

                // Reset Library Mode
                if (typeof backToAttendanceMode === 'function') await backToAttendanceMode();

                // Fill hidden ID if available
                if (data.id) {
                    document.getElementById('enrollFpId').value = data.id;
                    // Show Complete Enrollment button
                    document.getElementById('btnCompleteEnrollment').style.display = 'block';
                }

                // alert('Fingerprint enrolled successfully for ' + (data.usn || 'User'));
                return; // Stop polling
            } else if (data.status === 'error') {
                status.textContent = '× Error: ' + data.error;
                status.style.color = '#ef4444';
                btn.disabled = false;
                btn.innerHTML = 'Try Again';
                btn.onclick = captureEnrollFingerprint;
                return; // Stop polling
            }

            // Continue polling
            if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkStatus, 1000);
            } else {
                status.textContent = 'Timeout - Please try again';
                status.style.color = '#ef4444';
                btn.disabled = false;
                btn.innerHTML = 'Try Again';
                btn.onclick = captureEnrollFingerprint;
            }
        } catch (e) {
            console.error('Status check error:', e);
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(checkStatus, 1000);
            }
        }
    };

    // Start polling after 1 second
    setTimeout(checkStatus, 1000);
}

// Manual USN Verification Helper
async function verifyByUSN(usn, action, uiType) {
    try {
        const formData = new FormData();
        formData.append('usn', usn);
        formData.append('action', action);

        const res = await fetch(`http://${ESP32_IP}/verify-usn`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        console.log('ESP32 /verify-usn:', data);

        if (data.status === 'success' && data.registered) {
            alert(`USN found\n\nNAME: ${data.name}\nUSN: ${data.usn}\nBRANCH: ${data.branch}`);
            applySearchResult(data.name, uiType);
        } else {
            alert('USN not registered in Students table.');
        }
    } catch (err) {
        console.error('Error calling /verify-usn:', err);
        alert('Cannot connect to ESP32 for USN verification.');
    }
}
