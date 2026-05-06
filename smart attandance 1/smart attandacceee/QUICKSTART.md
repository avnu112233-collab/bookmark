# Quick Start Guide

## Installation Steps

Since Node.js is not currently installed on your system, you'll need to install it first.

### Step 1: Install Node.js

**Option A: Using Homebrew (Recommended for Mac)**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option B: Download from Official Website**
1. Visit https://nodejs.org/
2. Download the LTS version for macOS
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Project Dependencies

```bash
# Navigate to project directory
cd "/Users/bharathkumara/Desktop/smart attandance 1"

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 3: Start the Application

**Option 1: Run both server and client together**
```bash
npm run dev
```

**Option 2: Run separately in two terminals**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Default Login**: 
  - Username: `admin`
  - Password: `admin123`

## What's Included

### Backend Features
✅ Express.js REST API
✅ SQLite database (auto-created)
✅ Session-based authentication
✅ Student management endpoints
✅ Attendance tracking with login/logout
✅ Statistics and reporting
✅ ESP32 integration endpoint

### Frontend Features
✅ React 18 with Ant Design
✅ Clean, minimalistic UI
✅ Dashboard with real-time stats
✅ Student registration and management
✅ Attendance logs with filtering
✅ CSV export functionality
✅ System status and hardware guide
✅ Responsive design

### Hardware Integration
✅ ESP32 reference code included
✅ R307S fingerprint sensor support
✅ 20x4 LCD display integration
✅ Complete API documentation
✅ Hardware setup guide

## Project Structure

```
smart attandance 1/
├── server/                  # Backend (Node.js + Express)
│   ├── config/
│   │   └── database.js     # Database setup
│   ├── middleware/
│   │   └── auth.js         # Authentication
│   ├── routes/
│   │   ├── auth.js         # Auth endpoints
│   │   ├── students.js     # Student CRUD
│   │   └── attendance.js   # Attendance tracking
│   └── index.js            # Server entry point
│
├── client/                  # Frontend (React + Ant Design)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── pages/          # React pages
│       ├── services/       # API calls
│       ├── App.js
│       └── index.js
│
├── ESP32_Reference_Code.ino # ESP32 Arduino sketch
├── .env                     # Environment config
├── package.json            # Backend dependencies
└── README.md               # Full documentation
```

## Next Steps

1. **Install Node.js** (see Step 1 above)
2. **Install dependencies** (npm install)
3. **Start the application** (npm run dev)
4. **Login to admin panel** (admin/admin123)
5. **Register students** with their fingerprint IDs
6. **Configure ESP32** with your server IP
7. **Upload ESP32 code** to your hardware
8. **Test the system** with fingerprint scans

## ESP32 Setup

1. Install Arduino IDE or PlatformIO
2. Install required libraries:
   - Adafruit Fingerprint Sensor Library
   - LiquidCrystal I2C
   - ArduinoJson
3. Open `ESP32_Reference_Code.ino`
4. Update WiFi credentials and server IP
5. Upload to ESP32
6. Enroll fingerprints using R307S
7. Register students in web app with matching IDs

## Database

The application uses **SQLite** by default (no setup required).
Database file will be created automatically at `./database.sqlite`.

To use **PostgreSQL** instead:
1. Install PostgreSQL
2. Create database: `CREATE DATABASE library_attendance;`
3. Update `.env` file with PostgreSQL credentials
4. Change `DB_TYPE=postgresql`

## Support

- Full documentation: See `README.md`
- Hardware guide: Available in System Status page
- API documentation: See `README.md` API Endpoints section

## Security

⚠️ **Important**: Change default admin credentials in production!

Edit `.env` file:
```
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
```

## Troubleshooting

**Port already in use:**
```bash
# Change port in .env file
SERVER_PORT=5001
```

**Frontend can't connect:**
- Ensure backend is running
- Check proxy in client/package.json
- Verify CORS settings

**ESP32 connection issues:**
- Verify same WiFi network
- Check server IP address
- Test API with curl/Postman first

---

**Built with**: Node.js, Express, React, Ant Design, SQLite
**For**: College Library Biometric Attendance System
