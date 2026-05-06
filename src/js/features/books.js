// BOOK REGISTRATION & RETURN LOGIC

function toggleRegisterButton() {
    const bookId = document.getElementById('bookIdInput').value.trim();
    const registerBtn = document.getElementById('registerBtn');

    if (bookId.length > 0) {
        registerBtn.disabled = false;
        registerBtn.style.opacity = '1';
    } else {
        registerBtn.disabled = true;
        registerBtn.style.opacity = '0.5';
    }
}

function registerBook() {
    const bookId = document.getElementById('bookIdInput').value.trim();

    if (!bookId || !scannedStudent) {
        alert('Please enter a valid Book ID');
        return;
    }

    const duration = document.getElementById('durationInput').value || 15;

    // Here you would save to database
    const borrowRecord = {
        code: bookId,
        title: 'New Book Title', // Placeholder logic since we don't have book DB
        user: scannedStudent.name,
        usn: scannedStudent.usn,
        phone: '-',
        class: typeof scannedStudent.branch === 'string' ? '5-' + scannedStudent.branch.substring(0, 2).toUpperCase() + '-A' : '5-CS-A', // Mock logic
        date: new Date().toISOString().split('T')[0],
        status: 'BORROWED',
        duration: parseInt(duration)
    };

    // Add to local state (mock DB)
    borrowedBooks.unshift(borrowRecord);

    console.log('Registering book:', borrowRecord);

    alert(`✅ Book ${bookId} successfully registered to ${scannedStudent.name}!`);
    closeRegistrationModal();

    // Refresh the borrowed books table
    if (document.getElementById('view-borrowed').classList.contains('active')) {
        applyBorrowedFilters();
    } else {
        // If not currently on borrowed view, switch to it so user sees the result
        switchView('borrowed');
    }
}

// RETURN MODAL LOGIC
function showReturnModal(student) {
    document.getElementById('returnStudentName').textContent = student.name;
    document.getElementById('returnStudentUSN').textContent = student.usn;
    document.getElementById('returnStudentBranch').textContent = student.branch || 'N/A';

    // Set student initial in avatar
    const initial = student.name ? student.name.charAt(0).toUpperCase() : 'S';
    document.getElementById('studentInitial').textContent = initial;

    const tbody = document.getElementById('returnBookList');
    // Filter global borrowedBooks for this student
    const userBooks = borrowedBooks.filter(b => b.usn === student.usn);

    if (userBooks.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="3" style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
                <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
                <div style="font-size: 16px; font-weight: 600;">No borrowed books found</div>
                <div style="font-size: 14px; margin-top: 8px; opacity: 0.7;">This student has no books to return</div>
            </td>
        </tr>
    `;
    } else {
        tbody.innerHTML = userBooks.map((book, index) => `
        <tr style="border-bottom: 1px solid var(--color-border); transition: background 0.2s;">
            <td style="padding: 16px 12px; vertical-align: bottom;">
                <div style="font-weight: 600; font-size: 15px; color: var(--color-text);">${book.code}</div>
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">Code</div>
            </td>
            <td style="padding: 16px 12px; vertical-align: bottom;">
                <div style="font-size: 14px; color: var(--color-text);">${book.title || 'Unknown Title'}</div>
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">Borrowed: ${book.date || 'N/A'}</div>
            </td>
            <td style="padding: 16px 12px; text-align: right; vertical-align: bottom;">
                <button class="btn-return-action" 
                    onclick="processReturn('${book.code}')"
                    style="
                        padding: 10px 24px; 
                        font-size: 14px; 
                        font-weight: 600;
                        border: 2px solid var(--color-success); 
                        background: var(--color-success);
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    "
                    onmouseover="this.style.background='#1b9e8d'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(34, 184, 163, 0.3)';"
                    onmouseout="this.style.background='var(--color-success)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    Return
                </button>
            </td>
        </tr>
    `).join('');
    }

    document.getElementById('returnModal').classList.add('active');
}

function closeReturnModal() {
    document.getElementById('returnModal').classList.remove('active');
    scannedStudent = null;
}

function processReturn(bookCode) {
    if (confirm('Confirm return of book ' + bookCode + '?')) {
        // Remove from borrowedBooks (global state)
        const index = borrowedBooks.findIndex(b => b.code === bookCode);
        if (index > -1) {
            borrowedBooks.splice(index, 1);
            // Refresh modal list
            showReturnModal(scannedStudent);
            // Refresh main view if active
            if (document.getElementById('view-borrowed').classList.contains('active')) {
                applyBorrowedFilters();
            }
            alert('Book returned successfully!');
        }
    }
}

// ADVANCED BORROWED BOOKS FILTERS
function applyBorrowedFilters() {
    const searchTerm = document.getElementById('borrowedSearch') ? document.getElementById('borrowedSearch').value.toLowerCase() : '';
    const nameFilter = document.getElementById('filterName') ? document.getElementById('filterName').value.toLowerCase() : '';
    const usnFilter = document.getElementById('filterUSN') ? document.getElementById('filterUSN').value.toLowerCase() : '';
    const bookCodeFilter = document.getElementById('filterBookCode') ? document.getElementById('filterBookCode').value.toLowerCase() : '';
    const semFilter = document.getElementById('borrowedSemFilter') ? document.getElementById('borrowedSemFilter').value : '';
    const branchFilter = document.getElementById('borrowedBranchFilter') ? document.getElementById('borrowedBranchFilter').value : '';
    let dateFilter = document.getElementById('borrowedDateQuickFilter') ? document.getElementById('borrowedDateQuickFilter').value : '';
    if (!dateFilter) {
        dateFilter = document.getElementById('borrowedDateFilter') ? document.getElementById('borrowedDateFilter').value : '';
    }

    // Filter the global borrowedBooks array
    let filteredData = borrowedBooks.filter(book => {
        // Search filter
        if (searchTerm) {
            const searchStr = `${book.user} ${book.usn} ${book.title} ${book.code} `.toLowerCase();
            if (!searchStr.includes(searchTerm)) return false;
        }

        // Name Filter (Specific)
        if (nameFilter && (!book.user || !book.user.toLowerCase().includes(nameFilter))) return false;

        // USN Filter (Specific)
        if (usnFilter && (!book.usn || !book.usn.toLowerCase().includes(usnFilter))) return false;

        // Book Code Filter (Specific)
        if (bookCodeFilter && (!book.code || !book.code.toLowerCase().includes(bookCodeFilter))) return false;

        // Semester filter
        if (semFilter && book.class) {
            const sem = book.class.split('-')[0];
            if (sem !== semFilter) return false;
        }

        // Branch filter
        if (branchFilter && book.class) {
            const branch = book.class.split('-')[1];
            if (branch !== branchFilter) return false;
        }

        // Date filter
        if (dateFilter) {
            if (book.date !== dateFilter) return false;
        }

        return true;
    });

    renderFilteredBorrowedBooks(filteredData);
}

function clearBorrowedFilters() {
    document.getElementById('borrowedSearch').value = '';
    if (document.getElementById('filterName')) document.getElementById('filterName').value = '';
    if (document.getElementById('filterUSN')) document.getElementById('filterUSN').value = '';
    if (document.getElementById('filterBookCode')) document.getElementById('filterBookCode').value = '';
    document.getElementById('borrowedSemFilter').value = '';
    document.getElementById('borrowedBranchFilter').value = '';
    document.getElementById('borrowedDateFilter').value = '';
    renderBorrowedBooks(); // Call renderBorrowedBooks to show default mock data
}

function renderFilteredBorrowedBooks(books) {
    const tbody = document.getElementById('borrowedTableContent');
    if (!tbody) return;

    if (books.length === 0) {
        tbody.innerHTML = `
        <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--color-text-secondary);">
            No books found matching your filters.
        </td>
                </tr >
        `;
        return;
    }

    let html = '';
    books.forEach(book => {
        const borrowDate = new Date(book.date);
        const duration = book.duration || 15; // Use custom duration or default 15
        const dueDateObj = new Date(borrowDate);
        dueDateObj.setDate(borrowDate.getDate() + parseInt(duration));
        const dueDate = dueDateObj.toISOString().split('T')[0];

        // Calculate days remaining
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDateOnly = new Date(dueDate);
        dueDateOnly.setHours(0, 0, 0, 0);
        const diffTime = dueDateOnly - today;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let daysRemainingText = '';
        let daysRemainingColor = '';
        let statusText = '';
        let statusColor = '';

        if (daysRemaining > 3) {
            daysRemainingText = `${daysRemaining} days`;
            daysRemainingColor = 'var(--color-success)';
            statusText = 'BORROWED';
            statusColor = 'var(--color-success)';
        } else if (daysRemaining > 0) {
            daysRemainingText = `${daysRemaining} days`;
            daysRemainingColor = '#FFA500';
            statusText = 'BORROWED';
            statusColor = '#FFA500';
        } else if (daysRemaining === 0) {
            daysRemainingText = 'Due Today';
            daysRemainingColor = '#FFA500';
            statusText = 'DUE TODAY';
            statusColor = '#FFA500';
        } else {
            daysRemainingText = `${Math.abs(daysRemaining)} days overdue`;
            daysRemainingColor = 'var(--color-danger)';
            statusText = 'OVERDUE ▼';
            statusColor = 'var(--color-danger)';
        }

        const isOverdue = daysRemaining < 0;

        html += `
        <tr ${isOverdue ? `onclick="toggleAction('${book.code}')"` : ''} style="${isOverdue ? 'cursor: pointer' : ''}">
                    <td><strong>${book.code}</strong></td>
                    <td>${book.title}</td>
                    <td>${book.user}</td>
                    <td>${book.usn || '—'}</td>
                    <td>${book.phone || '—'}</td>
                    <td>${formatDate(book.date)}</td>
                    <td>${formatDate(dueDate)}</td>
                    <td><strong style="color: ${daysRemainingColor};">${daysRemainingText}</strong></td>
                    <td>
                        <span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                            ${statusText}
                        </span>
                    </td>
                </tr>
        `;

        // Hidden Action Row for Overdue
        if (isOverdue) {
            // Calculate Fine: 1 Rupee per day overdue
            // We use Math.abs(daysRemaining) because daysRemaining is negative for overdue
            const overdueDays = Math.abs(daysRemaining);
            const fineAmount = overdueDays * 1;

            html += `
        <tr id="action-${book.code}" class="action-row">
            <td colspan="9" class="action-cell">
                <div class="action-buttons">
                    <span style="font-size: 13px; color: var(--color-text-secondary);">Actions for ${book.user}:</span>
                    <button class="btn-sms" onclick="event.stopPropagation(); alert('SMS Sent to ${book.user}')">
                        💬 Send SMS
                    </button>
                    <button class="btn-fine" onclick="event.stopPropagation(); alert('Fine of ₹${fineAmount} added to ${book.user} for ${overdueDays} days overdue.')">
                        💰 Add Fine (₹${fineAmount})
                    </button>
                </div>
            </td>
                    </tr >
        `;
        }
    });

    tbody.innerHTML = html;
}

function renderBorrowedBooks() {
    applyBorrowedFilters();
}

function toggleAction(id) {
    const row = document.getElementById(`action-${id}`);
    if (row) {
        row.classList.toggle('visible');
    }
}

// PDF Export Functions for Borrowed Books
function downloadBorrowedPDF() {
    if (!window.jspdf) {
        alert('PDF Library not loaded. Please try again.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Active Borrowings Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()} `, 14, 22);

    doc.autoTable({
        html: '#borrowedTable',
        startY: 25,
        theme: 'grid',
        headStyles: { fillColor: [34, 184, 163] },
        styles: { fontSize: 8 }
    });

    doc.save('borrowed_books_report.pdf');
}

function downloadAllBorrowedPDF() {
    if (!window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("All Active Borrowings (Full Database)", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()} `, 14, 22);

    // Prepare Data Body from borrowedBooks array
    const tableBody = borrowedBooks.map(book => {
        const today = new Date();
        const dueObj = new Date(book.date);
        dueObj.setDate(dueObj.getDate() + 15);
        const diffTime = dueObj - today;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return [
            book.code,
            book.title,
            book.user,
            book.usn,
            book.phone,
            book.date,
            dueObj.toISOString().split('T')[0],
            daysRemaining + ' Days',
            book.status
        ];
    });

    doc.autoTable({
        head: [['Book Code', 'Title', 'Borrowed By', 'USN', 'Phone', 'Borrowed Date', 'Due Date', 'Days Remaining', 'Status']],
        body: tableBody,
        startY: 25,
        theme: 'grid',
        headStyles: { fillColor: [34, 184, 163] },
        styles: { fontSize: 8 }
    });

    doc.save('all_borrowed_records.pdf');
}

function handleBorrowedDateQuickFilter(val) {
    console.log("Borrowed Quick Date Filter Selected:", val);
    renderBorrowedBooks();
}

function clearBorrowedSearch() {
    const searchInput = document.getElementById('borrowedSearch');
    const dateInput = document.getElementById('borrowedDateQuickFilter');

    if (searchInput) searchInput.value = '';
    if (dateInput) dateInput.value = '';

    renderBorrowedBooks();
}
