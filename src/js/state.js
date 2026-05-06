// Helper to get local date string YYYY-MM-DD
const getLocalDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const todayStr = getLocalDateStr();

// MOCK DATA FOR DEMO PURPOSES
const demoData = [
    { fp_id: 1, name: "Arjun Sharma", usn: "4VV21CS001", class: "CSE", log_type: "LOGIN", date: todayStr, time: "09:15 AM" },
    { fp_id: 2, name: "Priya Rao", usn: "4VV21IS045", class: "ISE", log_type: "LOGIN", date: todayStr, time: "09:42 AM" },
    { fp_id: 3, name: "Rahul Verma", usn: "4VV22EC088", class: "ECE", log_type: "LOGIN", date: todayStr, time: "10:05 AM" },
    { fp_id: 4, name: "Sneha Patil", usn: "4VV21CS112", class: "CSE", log_type: "LOGIN", date: todayStr, time: "10:30 AM" },
    { fp_id: 5, name: "Kiran Kumar", usn: "4VV21ME034", class: "ME", log_type: "LOGIN", date: todayStr, time: "10:45 AM" },
    { fp_id: 6, name: "Vijay Singh", usn: "4VV22CV012", class: "CIVIL", log_type: "LOGIN", date: todayStr, time: "11:10 AM" },
    { fp_id: 1, name: "Arjun Sharma", usn: "4VV21CS001", class: "CSE", log_type: "LOGOUT", date: todayStr, time: "11:20 AM" }
];

// GLOBAL STATE
let allData = [...demoData]; // Initialize with demo data immediately

let currentMode = 'borrow';
let borrowedBooks = [
    { code: 'CS501', title: 'Data Structures', user: 'Bharath Kumara', usn: '4VV21CS021', phone: '98765 43210', class: '5-CS-A', date: '2024-12-05', status: 'BORROWED', duration: 15 },
    { code: 'EC301', title: 'Digital Electronics', user: 'Rahul Kumar', usn: '4VV21EC045', phone: '98765 43211', class: '3-EC-B', date: '2024-12-08', status: 'BORROWED', duration: 15 },
    { code: 'ME201', title: 'Thermodynamics', user: 'Priya Singh', usn: '4VV21ME012', phone: '98765 43212', class: '2-ME-A', date: '2024-11-28', status: 'OVERDUE', duration: 7 }
];

// Determine current date for midnight reset
let currentDate = todayStr;

let showingInsideList = false;
