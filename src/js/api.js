// FETCH DATA
async function fetchData() {
    try {
        const url = `${SUPABASE_URL}/rest/v1/transactions?order=created_at.desc&limit=1000`;
        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        let fetchedData = await response.json();
        
        // IF DATABASE IS EMPTY, USE DEMO DATA
        if (!fetchedData || fetchedData.length === 0) {
            console.log('💡 Database empty. Loading demo data...');
            allData = [...demoData];
        } else {
            allData = fetchedData;
        }

        allData.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB - dateA;
        });

        console.log('✅ Data ready:', allData.length, 'records');

        const getLocalDate = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const today = getLocalDate();
        
        if (typeof updateDashboardStats === 'function') updateDashboardStats(today);

        if (window.showingInsideList && typeof showInsideListInTable === 'function') {
            showInsideListInTable();
        } else if (typeof renderTable === 'function') {
            renderTable();
        }
    } catch (error) {
        console.error('❌ Fetch error. Using demo data fallback.', error);
        allData = [...demoData];
        
        // ENSURE DASHBOARD UPDATES EVEN IN FALLBACK
        const today = todayStr; // Use the local date helper from above
        if (typeof updateDashboardStats === 'function') updateDashboardStats(today);
        
        if (typeof renderTable === 'function') renderTable();
    }
}

// State management functions for ESP32
async function enableBorrowMode() {
    if (!supabaseClient) return;
    // Update LIBRARY device to BORROW mode
    await supabaseClient
        .from('state')
        .update({ mode: 'BORROW' })
        .eq('device_role', 'LIBRARY');
}

async function enableReturnMode() {
    if (!supabaseClient) return;
    // Update LIBRARY device to RETURN mode
    await supabaseClient
        .from('state')
        .update({ mode: 'RETURN' })
        .eq('device_role', 'LIBRARY');
}

async function backToAttendanceMode() {
    if (!supabaseClient) return;
    // Reset LIBRARY device to IDLE
    await supabaseClient
        .from('state')
        .update({ mode: 'IDLE' })
        .eq('device_role', 'LIBRARY');
}

async function enableEnrollmentMode() {
    if (!supabaseClient) return;
    // Update LIBRARY device to ENROLL mode
    await supabaseClient
        .from('state')
        .update({ mode: 'ENROLL' })
        .eq('device_role', 'LIBRARY');
}

// Check if day has changed and reset stats at midnight
async function checkMidnightReset() {
    const newDate = new Date().toISOString().split('T')[0];
    if (newDate !== currentDate) {
        console.log(`🌙 Midnight reached! Transitioning from ${currentDate} to ${newDate}`);

        // AUTO-LOGOUT LOGIC
        // Identify users who were 'Inside' at the end of the previous day
        const yesterdaysLogs = allData.filter(r => r.date === currentDate);
        const processedIds = new Set();
        const insideUsers = [];

        // allData is sorted Newest First
        for (const record of yesterdaysLogs) {
            if (!processedIds.has(record.fp_id)) {
                processedIds.add(record.fp_id);
                // If the last action of the day was LOGIN, they are still inside
                if (record.log_type === 'LOGIN') {
                    insideUsers.push(record);
                }
            }
        }

        if (insideUsers.length > 0) {
            console.log(`Found ${insideUsers.length} users to auto-logout.`);
            for (const user of insideUsers) {
                const logoutData = {
                    fp_id: user.fp_id,
                    name: user.name,
                    usn: user.usn,
                    log_type: 'LOGOUT',
                    date: currentDate, // Log them out on the previous day
                    time: '23:59:59',  // End of day
                    class: user.class || ''
                };

                try {
                    await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(logoutData)
                    });
                    console.log(`✅ Auto-logged out: ${user.name}`);
                } catch (e) {
                    console.error(`❌ Failed to auto-logout ${user.name}`, e);
                }
            }
        }

        currentDate = newDate;
        // Force refresh data to get new day's stats
        setTimeout(fetchData, 2000);
    }
}
