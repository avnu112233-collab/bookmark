# 📚 BOOKMARK - VVCE Library Management System

> **State-of-the-art Biometric Attendance & Library Management Solution**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Success-success)](https://github.com/avnu112233-collab/bookmark)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://github.com/avnu112233-collab/bookmark/pulls)

---

## 🌟 Overview

**BOOKMARK** is a high-performance library management system designed specifically for VVCE Library. By integrating **ESP32-based biometric sensors** with a modern **Supabase-powered web dashboard**, it provides a seamless, secure, and automated way to track student attendance and manage library resources.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| 🔐 **Biometric Sync** | Direct integration with R307/AS608 fingerprint sensors via ESP32. |
| ⏱️ **Real-time Stats** | Live monitoring of "Visits Today" and "Currently Inside" metrics. |
| 📄 **Smart Logging** | Automated entry/exit logs with precise time-stamping. |
| 👤 **Easy Enrollment** | Streamlined student registration with instant biometric mapping. |
| 📊 **PDF Export** | One-click report generation for attendance and book data. |
| 🌓 **Adaptive UI** | Sleek dark/light theme support with CSS variables. |

---

## 🏗️ Technical Architecture

### 💻 Web Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: [Vite 5.x](https://vitejs.dev/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL & Real-time)
- **PDF Engine**: jsPDF & AutoTable

### 🔌 Hardware Stack
- **Microcontroller**: ESP32-WROOM-32
- **Sensor**: R307 Optical Fingerprint Module
- **Communication**: HTTP REST API / Webhooks

---

## 🚀 Getting Started

### 1. Repository Setup
```bash
git clone https://github.com/avnu112233-collab/bookmark.git
cd bookmark
```

### 2. Frontend Installation
```bash
npm install
npm run dev
```

### 3. Hardware Deployment
1. Navigate to `/hardware/esp32/`.
2. Open the sketch in **Arduino IDE**.
3. Update `SSID`, `PASSWORD`, and `API_ENDPOINT`.
4. Upload to your ESP32.

---

## 📂 Project Structure

```bash
BOOKMARK/
├── src/
│   ├── css/          # Modular Design System
│   │   ├── base.css      # Tokens & Variables
│   │   ├── layout.css    # Layout & Grid
│   │   └── components/   # Specific UI Elements
│   └── js/           # Core Logic
│       ├── api.js        # Supabase Integration
│       └── features/     # Feature-specific logic
├── index.html        # Main Entry Point
└── hardware/         # ESP32 Firmware
```

---

## 🛡️ Database Schema

| Table | Primary Key | Description |
|:---|:---|:---|
| `student_registry` | `usn` | Stores student identity and bio-ID mapping. |
| `attendance_logs` | `id` | Real-time entry/exit timestamps. |
| `book_inventory` | `isbn` | Library catalog and availability status. |

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

**Built with ❤️ for VVCE Library by [avnu112233-collab](https://github.com/avnu112233-collab)**
