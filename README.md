# BOOKMARK - Library Management System

A biometric-based library management system for VVCE Library, featuring fingerprint authentication, real-time attendance tracking, and book management.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Hardware Requirements](#hardware-requirements)
- [Software Requirements](#software-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)

---

## Overview

BOOKMARK is a modern library management system that uses fingerprint biometrics for student identification. It tracks library attendance, manages book borrowing/returning, and provides real-time analytics.

---

## Features

- **Biometric Authentication** - Fingerprint-based student identification
- **Real-time Attendance** - Track library entry and exit times
- **Book Management** - Borrow and return books with tracking
- **Dashboard Analytics** - Live statistics and recent activity
- **PDF Reports** - Export attendance and book data
- **Dark/Light Theme** - User preference support

---

## Hardware Requirements

| Component | Specification | Purpose |
|-----------|---------------|---------|
| **ESP32 Microcontroller** | ESP32-WROOM-32 | Main processing unit |
| **Fingerprint Sensor** | R307/AS608 Optical Sensor | Biometric capture |
| **Power Supply** | 5V 2A USB/Adapter | Power the system |
| **Connection Cables** | Jumper wires | ESP32 to sensor |
| **Enclosure** | Custom/3D printed (optional) | Housing |

### Wiring Diagram (ESP32 to R307)

| ESP32 Pin | R307 Pin | Wire Color |
|-----------|----------|------------|
| GPIO 16 (RX2) | TX (Green) | Green |
| GPIO 17 (TX2) | RX (White) | White |
| 3.3V | VCC (Red) | Red |
| GND | GND (Black) | Black |

---

## Software Requirements

### Development Environment

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | v18+ | Runtime environment |
| **npm** | v9+ | Package manager |
| **Vite** | v5+ | Build tool |
| **Arduino IDE** | 2.x | ESP32 programming |

### Web Technologies

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling |
| JavaScript (ES6+) | Logic |
| Supabase | Database & Auth |

### Libraries & Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | v2 | Database client |
| `jspdf` | 2.5.1 | PDF generation |
| `jspdf-autotable` | 3.5.29 | PDF tables |

### ESP32 Libraries

| Library | Purpose |
|---------|---------|
| `Adafruit_Fingerprint` | Fingerprint sensor |
| `WiFi.h` | ESP32 WiFi |
| `HTTPClient.h` | HTTP requests |
| `ArduinoJson` | JSON parsing |

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/bookmark.git
cd bookmark
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Flash ESP32

1. Open Arduino IDE
2. Load the ESP32 sketch from `/hardware/esp32/`
3. Configure WiFi credentials
4. Upload to ESP32

---

## Configuration

### Environment Variables

Update `src/js/config.js`:

```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
const ESP32_IP = 'your-esp32-ip';
```

### Supabase Tables

- `students` - Student information
- `attendance` - Entry/exit logs
- `borrowed_books` - Book transactions

---

## Project Structure

```
BOOKMARK/
├── index.html              # Main HTML file
├── package.json            # Node dependencies
├── vite.config.js          # Vite configuration
├── src/
│   ├── css/
│   │   ├── style.css       # Main styles (imports all)
│   │   ├── base.css        # Variables & reset
│   │   ├── sidebar.css     # Navigation
│   │   ├── layout.css      # Page structure
│   │   ├── dashboard.css   # Stats & tabs
│   │   ├── tables.css      # Data tables
│   │   ├── forms.css       # Inputs & buttons
│   │   ├── modals.css      # Overlays
│   │   └── enrollment.css  # Student forms
│   └── js/
│       ├── config.js       # Configuration
│       ├── state.js        # Global state
│       ├── utils.js        # Utilities
│       ├── api.js          # API calls
│       ├── main.js         # Entry point
│       └── features/
│           ├── dashboard.js
│           ├── attendance.js
│           ├── books.js
│           └── enrollment.js
└── hardware/
    └── esp32/              # Arduino sketch
```

---

## License

MIT License - VVCE Library Project

---

**Built with ❤️ for VVCE Library**
