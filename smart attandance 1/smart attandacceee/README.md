# Library Smart Biometric Attendance System

A full-stack web application for managing library attendance using ESP32 and R307S fingerprint sensor.

## Features

- **Biometric Attendance**: ESP32 + R307S fingerprint sensor integration
- **Real-time Dashboard**: Monitor attendance statistics and current occupancy
- **Student Management**: Register and manage student records
- **Attendance Logs**: View, filter, and export attendance records
- **Hardware Integration**: Complete guide for ESP32 and LCD setup

## Technology Stack

### Backend
- Node.js + Express
- SQLite (default) / PostgreSQL
- Session-based authentication
- RESTful API

### Frontend
- React 18
- Ant Design 5 (minimal theme)
- React Router
- Axios

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone or navigate to the project directory**
   ```bash
   cd "smart attandance 1"
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your settings:
   - `DB_TYPE`: `sqlite` (default) or `postgresql`
   - `SERVER_PORT`: Server port (default: 5000)
   - `ADMIN_USERNAME`: Admin username (default: admin)
   - `ADMIN_PASSWORD`: Admin password (default: admin123)

5. **Start the application**

   **Option 1: Run both server and client together**
   ```bash
   npm run dev
   ```

   **Option 2: Run separately**
   
   Terminal 1 (Backend):
   ```bash
   npm run server
   ```
   
   Terminal 2 (Frontend):
   ```bash
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Default login: `admin` / `admin123`

## Database Configuration

### SQLite (Default)
No additional setup required. Database file will be created automatically at `./database.sqlite`.

### PostgreSQL (Optional)
1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE library_attendance;
   ```
3. Update `.env`:
   ```
   DB_TYPE=postgresql
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=library_attendance
   ```

## API Endpoints

### ESP32 Integration
- `POST /api/attendance` - Record fingerprint scan
  ```json
  {
    "finger_id": 12,
    "scanner_ip": "192.168.1.50"
  }
  ```

### Admin Endpoints (Requires Authentication)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/students` - Get all students
- `POST /api/students` - Register new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/attendance/logs` - Get attendance logs
- `GET /api/attendance/stats` - Get statistics
- `GET /api/system/info` - Get server information

## ESP32 Hardware Integration

### Components Required
- ESP32 development board
- R307S fingerprint sensor
- 20x4 LCD display (I2C)
- Connecting wires

### ESP32 Configuration

1. **Connect to the same Wi-Fi network** as the server
2. **Configure the API endpoint** in your ESP32 code:
   ```cpp
   const char* serverIP = "YOUR_SERVER_IP";
   const int serverPort = 5000;
   const char* apiEndpoint = "/api/attendance";
   ```

3. **Fingerprint Enrollment**
   - Use R307S enrollment sketch to register fingerprints
   - Note the template ID for each student
   - Register the student in the web app with the same Finger ID

### HTTP Request Flow

1. R307S detects and matches fingerprint
2. ESP32 receives template ID from sensor
3. ESP32 sends POST request to server:
   ```json
   {
     "finger_id": 12,
     "scanner_ip": "192.168.1.50"
   }
   ```
4. Server responds with student info and status
5. ESP32 displays on LCD

### LCD Display Format

**Login (First Scan):**
```
LIBRARY ENTRY
Name: Student Name
USN: 1XX21EC001
IN: 10:30
```

**Logout (Second Scan):**
```
LIBRARY EXIT
Name: Student Name
USN: 1XX21EC001
OUT: 14:30
```

## Usage Guide

### Admin Panel

1. **Login**
   - Navigate to http://localhost:3000
   - Enter credentials (default: admin/admin123)

2. **Register Students**
   - Go to "Students" page
   - Click "Register Student"
   - Fill in: USN, Name, Finger ID (must match R307S template ID)
   - Optional: Branch, Semester

3. **Monitor Attendance**
   - Dashboard shows real-time statistics
   - View current occupancy
   - See recent attendance entries

4. **View Logs**
   - "Attendance Logs" page
   - Filter by date range or USN
   - Export to CSV

5. **System Status**
   - View server IP and API endpoint
   - Hardware integration guide
   - Server uptime

## Project Structure

```
smart-attendance-1/
├── server/
│   ├── config/
│   │   └── database.js       # Database configuration
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── students.js       # Student CRUD routes
│   │   └── attendance.js     # Attendance routes
│   └── index.js              # Express server
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Dashboard.js
│       │   ├── Students.js
│       │   ├── AttendanceLogs.js
│       │   └── SystemStatus.js
│       ├── services/
│       │   └── api.js        # API service layer
│       ├── App.js
│       ├── index.js
│       └── index.css
├── .env                      # Environment variables
├── .env.example              # Environment template
├── package.json
└── README.md
```

## Security Notes

- Change default admin credentials in production
- Use HTTPS in production environment
- Keep `.env` file secure and never commit it
- Use strong session secrets
- Consider implementing rate limiting for API endpoints

## Troubleshooting

### Server won't start
- Check if port 5000 is available
- Verify database connection settings
- Check `.env` file configuration

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check proxy setting in `client/package.json`
- Verify CORS configuration

### ESP32 connection issues
- Verify ESP32 and server are on same network
- Check server IP address in ESP32 code
- Test API endpoint with Postman/curl first

## License

MIT

## Support

For issues and questions, please check the System Status page in the admin panel for server information and integration guides.
