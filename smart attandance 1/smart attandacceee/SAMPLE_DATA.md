# Sample Test Data

Use this data to populate your system for testing purposes.

## Sample Students

```json
[
  {
    "usn": "1XX21EC001",
    "name": "Rajesh Kumar",
    "finger_id": 1,
    "branch": "Electronics and Communication",
    "semester": "5"
  },
  {
    "usn": "1XX21EC002",
    "name": "Priya Sharma",
    "finger_id": 2,
    "branch": "Electronics and Communication",
    "semester": "5"
  },
  {
    "usn": "1XX21CS003",
    "name": "Amit Patel",
    "finger_id": 3,
    "branch": "Computer Science",
    "semester": "6"
  },
  {
    "usn": "1XX21CS004",
    "name": "Sneha Reddy",
    "finger_id": 4,
    "branch": "Computer Science",
    "semester": "6"
  },
  {
    "usn": "1XX21ME005",
    "name": "Vikram Singh",
    "finger_id": 5,
    "branch": "Mechanical Engineering",
    "semester": "4"
  },
  {
    "usn": "1XX21ME006",
    "name": "Ananya Iyer",
    "finger_id": 6,
    "branch": "Mechanical Engineering",
    "semester": "4"
  },
  {
    "usn": "1XX21EE007",
    "name": "Karthik Nair",
    "finger_id": 7,
    "branch": "Electrical Engineering",
    "semester": "5"
  },
  {
    "usn": "1XX21EE008",
    "name": "Divya Menon",
    "finger_id": 8,
    "branch": "Electrical Engineering",
    "semester": "5"
  },
  {
    "usn": "1XX21CV009",
    "name": "Arjun Rao",
    "finger_id": 9,
    "branch": "Civil Engineering",
    "semester": "3"
  },
  {
    "usn": "1XX21CV010",
    "name": "Kavya Desai",
    "finger_id": 10,
    "branch": "Civil Engineering",
    "semester": "3"
  }
]
```

## How to Add Sample Data

### Method 1: Using Web Interface
1. Login to admin panel (http://localhost:3000)
2. Go to "Students" page
3. Click "Register Student" for each entry
4. Fill in the details from above
5. Click "Register"

### Method 2: Using API (Bulk Import)

Create a file `import_students.sh`:

```bash
#!/bin/bash

# Login first
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"admin","password":"admin123"}'

# Import students
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21EC001","name":"Rajesh Kumar","finger_id":1,"branch":"Electronics and Communication","semester":"5"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21EC002","name":"Priya Sharma","finger_id":2,"branch":"Electronics and Communication","semester":"5"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21CS003","name":"Amit Patel","finger_id":3,"branch":"Computer Science","semester":"6"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21CS004","name":"Sneha Reddy","finger_id":4,"branch":"Computer Science","semester":"6"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21ME005","name":"Vikram Singh","finger_id":5,"branch":"Mechanical Engineering","semester":"4"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21ME006","name":"Ananya Iyer","finger_id":6,"branch":"Mechanical Engineering","semester":"4"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21EE007","name":"Karthik Nair","finger_id":7,"branch":"Electrical Engineering","semester":"5"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21EE008","name":"Divya Menon","finger_id":8,"branch":"Electrical Engineering","semester":"5"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21CV009","name":"Arjun Rao","finger_id":9,"branch":"Civil Engineering","semester":"3"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"usn":"1XX21CV010","name":"Kavya Desai","finger_id":10,"branch":"Civil Engineering","semester":"3"}'

# Cleanup
rm cookies.txt

echo "Sample students imported successfully!"
```

Run with:
```bash
chmod +x import_students.sh
./import_students.sh
```

### Method 3: Direct Database Insert (SQLite)

```bash
sqlite3 database.sqlite << EOF
INSERT INTO students (usn, name, finger_id, branch, semester) VALUES
('1XX21EC001', 'Rajesh Kumar', 1, 'Electronics and Communication', '5'),
('1XX21EC002', 'Priya Sharma', 2, 'Electronics and Communication', '5'),
('1XX21CS003', 'Amit Patel', 3, 'Computer Science', '6'),
('1XX21CS004', 'Sneha Reddy', 4, 'Computer Science', '6'),
('1XX21ME005', 'Vikram Singh', 5, 'Mechanical Engineering', '4'),
('1XX21ME006', 'Ananya Iyer', 6, 'Mechanical Engineering', '4'),
('1XX21EE007', 'Karthik Nair', 7, 'Electrical Engineering', '5'),
('1XX21EE008', 'Divya Menon', 8, 'Electrical Engineering', '5'),
('1XX21CV009', 'Arjun Rao', 9, 'Civil Engineering', '3'),
('1XX21CV010', 'Kavya Desai', 10, 'Civil Engineering', '3');
EOF
```

## Sample Attendance Scenarios

### Scenario 1: Morning Entry
```bash
# Simulate students entering library in the morning

# Rajesh enters at 9:00 AM
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"finger_id":1,"scanner_ip":"192.168.1.50"}'

# Priya enters at 9:15 AM
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"finger_id":2,"scanner_ip":"192.168.1.50"}'

# Amit enters at 9:30 AM
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"finger_id":3,"scanner_ip":"192.168.1.50"}'
```

### Scenario 2: Afternoon Exit
```bash
# Simulate students leaving library

# Rajesh exits at 2:00 PM
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"finger_id":1,"scanner_ip":"192.168.1.50"}'

# Priya exits at 2:30 PM
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"finger_id":2,"scanner_ip":"192.168.1.50"}'
```

### Scenario 3: Full Day Simulation
Create `simulate_day.sh`:

```bash
#!/bin/bash

echo "Simulating a full day of library attendance..."

# Morning entries (9:00 - 10:00)
echo "Morning entries..."
for id in 1 2 3 4 5; do
  curl -s -X POST http://localhost:5000/api/attendance \
    -H "Content-Type: application/json" \
    -d "{\"finger_id\":$id,\"scanner_ip\":\"192.168.1.50\"}" > /dev/null
  echo "Student $id entered"
  sleep 1
done

# Wait (simulating study time)
echo "Students studying... (waiting 5 seconds)"
sleep 5

# Afternoon exits (2:00 - 3:00)
echo "Afternoon exits..."
for id in 1 2 3; do
  curl -s -X POST http://localhost:5000/api/attendance \
    -H "Content-Type: application/json" \
    -d "{\"finger_id\":$id,\"scanner_ip\":\"192.168.1.50\"}" > /dev/null
  echo "Student $id exited"
  sleep 1
done

# Evening exits (5:00 - 6:00)
echo "Evening exits..."
for id in 4 5; do
  curl -s -X POST http://localhost:5000/api/attendance \
    -H "Content-Type: application/json" \
    -d "{\"finger_id\":$id,\"scanner_ip\":\"192.168.1.50\"}" > /dev/null
  echo "Student $id exited"
  sleep 1
done

echo "Simulation complete!"
echo "Check dashboard at http://localhost:3000"
```

Run with:
```bash
chmod +x simulate_day.sh
./simulate_day.sh
```

## Expected Results After Import

### Dashboard Statistics
- Total Students: 10
- Visits Today: (depends on simulations run)
- Currently Inside: (students with open sessions)

### Students Table
Should show all 10 students with their details

### Attendance Logs
Should show all simulated entries and exits

## Verification Queries

### Check Students
```bash
sqlite3 database.sqlite "SELECT * FROM students;"
```

### Check Today's Attendance
```bash
sqlite3 database.sqlite "SELECT * FROM attendance_logs WHERE session_date = date('now');"
```

### Check Currently Inside
```bash
sqlite3 database.sqlite "SELECT s.name, s.usn, a.login_time FROM students s JOIN attendance_logs a ON s.id = a.student_id WHERE a.logout_time IS NULL;"
```

### Count by Branch
```bash
sqlite3 database.sqlite "SELECT branch, COUNT(*) as count FROM students GROUP BY branch;"
```

## Clean Up Test Data

### Remove All Students
```bash
sqlite3 database.sqlite "DELETE FROM students;"
```

### Remove All Attendance Logs
```bash
sqlite3 database.sqlite "DELETE FROM attendance_logs;"
```

### Reset Database (Start Fresh)
```bash
rm database.sqlite
# Restart server - database will be recreated
```

## Notes

- Finger IDs (1-10) correspond to template IDs in R307S sensor
- In production, enroll actual fingerprints with these IDs
- USN format follows typical Indian college pattern
- Branch and semester are optional fields
- All timestamps are in ISO 8601 format (UTC)

---

**Use this sample data to test all features of the system before deploying with real students!**
