// GLOBAL STATE
let allData = [];

let currentMode = 'borrow';
let borrowedBooks = [
    { code: 'CS501', title: 'Data Structures', user: 'Bharath Kumara', usn: '4VV21CS021', phone: '98765 43210', class: '5-CS-A', date: '2024-12-05', status: 'BORROWED', duration: 15 },
    { code: 'EC301', title: 'Digital Electronics', user: 'Rahul Kumar', usn: '4VV21EC045', phone: '98765 43211', class: '3-EC-B', date: '2024-12-08', status: 'BORROWED', duration: 15 },
    { code: 'ME201', title: 'Thermodynamics', user: 'Priya Singh', usn: '4VV21ME012', phone: '98765 43212', class: '2-ME-A', date: '2024-11-28', status: 'OVERDUE', duration: 7 }
];

// Determine current date for midnight reset
let currentDate = new Date().toISOString().split('T')[0];

let showingInsideList = false;
