# Testing Guide

This guide will help you test the Library Smart Biometric Attendance System without ESP32 hardware.

## Prerequisites

- Node.js installed
- Application running (backend on port 5000, frontend on port 3000)

## 1. Testing the Backend API

### Test Server Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test System Info
```bash
curl http://localhost:5000/api/system/info
```

Expected response:
```json
{
  "success": true,
  "data": {
    "serverIP": "192.168.1.100",
    "serverPort": 5000,
    "apiEndpoint": "http://192.168.1.100:5000/api/attendance",
    "uptime": 123.45,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 2. Testing Student Registration

### Register a Test Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "usn": "1XX21EC001",
    "name": "Test Student",
    "finger_id": 1,
    "branch": "Computer Science",
    "semester": "5"
  }'
```

**Note**: You need to login first to get the session cookie. Use the web interface or:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Then use the cookie file:
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "usn": "1XX21EC001",
    "name": "Test Student",
    "finger_id": 1,
    "branch": "Computer Science",
    "semester": "5"
  }'
```

## 3. Testing Attendance (Simulating ESP32)

### Simulate First Scan (Login)
```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "finger_id": 1,
    "scanner_ip": "192.168.1.50"
  }'
```

Expected response:
```json
{
  "status": "login",
  "student": {
    "name": "Test Student",
    "usn": "1XX21EC001"
  },
  "login_time": "2024-01-15T10:30:00.000Z",
  "logout_time": null
}
```

### Simulate Second Scan (Logout)
Wait a few seconds, then run the same command again:
```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "finger_id": 1,
    "scanner_ip": "192.168.1.50"
  }'
```

Expected response:
```json
{
  "status": "logout",
  "student": {
    "name": "Test Student",
    "usn": "1XX21EC001"
  },
  "login_time": "2024-01-15T10:30:00.000Z",
  "logout_time": "2024-01-15T14:30:00.000Z"
}
```

## 4. Testing Frontend

### Login Page
1. Navigate to http://localhost:3000
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Log in"
4. Should redirect to Dashboard

### Dashboard
1. Check statistics cards:
   - Total Students
   - Visits Today
   - Currently Inside
2. Verify recent attendance table shows data
3. Check auto-refresh (every 30 seconds)

### Students Page
1. Click "Students" in sidebar
2. Click "Register Student" button
3. Fill form:
   - USN: 1XX21EC002
   - Name: Another Student
   - Finger ID: 2
   - Branch: Electronics
   - Semester: 6
4. Click "Register"
5. Verify student appears in table
6. Test Edit functionality
7. Test Delete functionality (with confirmation)

### Attendance Logs Page
1. Click "Attendance Logs" in sidebar
2. Test date range filter
3. Test USN search
4. Click "Export CSV" to download data
5. Verify duration calculation

### System Status Page
1. Click "System Status" in sidebar
2. Verify server information displays
3. Check hardware integration guide
4. Verify API endpoint information

## 5. Database Verification

### Check SQLite Database
```bash
# Install sqlite3 if not available
brew install sqlite3

# Open database
sqlite3 database.sqlite

# View students
SELECT * FROM students;

# View attendance logs
SELECT * FROM attendance_logs;

# Check open sessions
SELECT * FROM attendance_logs WHERE logout_time IS NULL;

# Exit
.quit
```

## 6. Testing Scenarios

### Scenario 1: New Student Entry
1. Register student with finger_id = 10
2. Simulate fingerprint scan (POST to /api/attendance with finger_id = 10)
3. Verify login record created
4. Check dashboard shows "Currently Inside" increased
5. Verify attendance log shows entry with logout_time = NULL

### Scenario 2: Student Exit
1. Simulate second scan with same finger_id
2. Verify logout_time is updated
3. Check "Currently Inside" decreased
4. Verify duration is calculated

### Scenario 3: Multiple Students
1. Register 3-5 students with different finger_ids
2. Simulate scans for each (login)
3. Verify all show as "Currently Inside"
4. Simulate logout for some students
5. Verify statistics update correctly

### Scenario 4: Unknown Fingerprint
```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "finger_id": 999,
    "scanner_ip": "192.168.1.50"
  }'
```

Expected response:
```json
{
  "status": "error",
  "message": "Unknown fingerprint"
}
```

### Scenario 5: CSV Export
1. Create multiple attendance records
2. Go to Attendance Logs page
3. Set date range filter
4. Click "Export CSV"
5. Verify CSV file downloads with correct data

## 7. Performance Testing

### Concurrent Attendance Scans
```bash
# Create a test script
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/attendance \
    -H "Content-Type: application/json" \
    -d "{\"finger_id\": $i, \"scanner_ip\": \"192.168.1.50\"}" &
done
wait
```

## 8. Error Handling Tests

### Missing finger_id
```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "scanner_ip": "192.168.1.50"
  }'
```

Expected: 400 Bad Request

### Invalid credentials
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "wrong",
    "password": "wrong"
  }'
```

Expected: 401 Unauthorized

### Duplicate USN
Try registering a student with existing USN - should fail with error message.

### Duplicate Finger ID
Try registering a student with existing finger_id - should fail with error message.

## 9. Integration Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Database tables created automatically
- [ ] Admin login works
- [ ] Student registration works
- [ ] Student editing works
- [ ] Student deletion works
- [ ] Attendance login works
- [ ] Attendance logout works
- [ ] Dashboard statistics accurate
- [ ] Attendance logs filterable
- [ ] CSV export works
- [ ] System info displays correctly
- [ ] Session persistence works
- [ ] Logout works
- [ ] Unknown fingerprint handled
- [ ] Error messages display properly

## 10. Browser Testing

Test on multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

Test responsive design:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Automated Test Script

Save this as `test.sh`:

```bash
#!/bin/bash

echo "=== Testing Library Attendance System ==="

# Test health
echo "\n1. Testing health endpoint..."
curl -s http://localhost:5000/api/health | jq

# Login
echo "\n2. Logging in..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"admin","password":"admin123"}' | jq

# Register student
echo "\n3. Registering test student..."
curl -s -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"TEST001","name":"Test Student","finger_id":99}' | jq

# Simulate login scan
echo "\n4. Simulating fingerprint login..."
curl -s -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"finger_id":99,"scanner_ip":"192.168.1.50"}' | jq

# Wait 2 seconds
sleep 2

# Simulate logout scan
echo "\n5. Simulating fingerprint logout..."
curl -s -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"finger_id":99,"scanner_ip":"192.168.1.50"}' | jq

# Get stats
echo "\n6. Getting statistics..."
curl -s http://localhost:5000/api/attendance/stats | jq

# Cleanup
rm cookies.txt

echo "\n=== Tests Complete ==="
```

Run with:
```bash
chmod +x test.sh
./test.sh
```

## Expected Results

All tests should pass with appropriate responses. The system should:
- Handle valid requests correctly
- Reject invalid requests with proper error messages
- Maintain data consistency
- Update statistics in real-time
- Display data correctly in the UI

## Troubleshooting

If tests fail:
1. Check server is running on port 5000
2. Check frontend is running on port 3000
3. Verify database file exists
4. Check console for error messages
5. Verify .env configuration
6. Clear browser cache and cookies
7. Restart both server and client

---

**Note**: These tests simulate ESP32 behavior. For actual hardware testing, upload the ESP32 code and use real fingerprint scans.
