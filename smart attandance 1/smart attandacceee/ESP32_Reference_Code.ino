/*
 * ESP32 Library Attendance System - Example Code
 * 
 * This is a reference implementation for ESP32 with R307S fingerprint sensor
 * and 20x4 LCD display for the Library Smart Biometric Attendance System.
 * 
 * Hardware Requirements:
 * - ESP32 Development Board
 * - R307S Fingerprint Sensor
 * - 20x4 LCD Display (I2C)
 * - Connecting wires
 * 
 * Libraries Required:
 * - WiFi.h (built-in)
 * - HTTPClient.h (built-in)
 * - Adafruit_Fingerprint.h
 * - LiquidCrystal_I2C.h
 * - ArduinoJson.h
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_Fingerprint.h>
#include <LiquidCrystal_I2C.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* serverIP = "192.168.1.100";  // Replace with your server IP
const int serverPort = 5000;
const char* apiEndpoint = "/api/attendance";

// Hardware Serial for R307S (adjust pins as needed)
HardwareSerial mySerial(2); // Use Serial2 (GPIO16=RX, GPIO17=TX)
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// LCD Configuration (I2C address 0x27, 20 columns, 4 rows)
LiquidCrystal_I2C lcd(0x27, 20, 4);

void setup() {
  Serial.begin(115200);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Library Attendance");
  lcd.setCursor(0, 1);
  lcd.print("System Starting...");
  
  // Initialize fingerprint sensor
  mySerial.begin(57600);
  if (finger.verifyPassword()) {
    Serial.println("Fingerprint sensor found!");
    lcd.setCursor(0, 2);
    lcd.print("Sensor: OK");
  } else {
    Serial.println("Fingerprint sensor not found!");
    lcd.setCursor(0, 2);
    lcd.print("Sensor: ERROR");
    while (1) { delay(1); }
  }
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  lcd.setCursor(0, 3);
  lcd.print("Connecting WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System Ready");
  lcd.setCursor(0, 1);
  lcd.print("Place finger...");
  
  delay(2000);
  lcd.clear();
}

void loop() {
  // Wait for fingerprint
  int fingerId = getFingerprintID();
  
  if (fingerId > 0) {
    // Valid fingerprint detected
    Serial.print("Fingerprint ID: ");
    Serial.println(fingerId);
    
    // Send to server
    sendAttendanceToServer(fingerId);
    
    // Wait before next scan
    delay(3000);
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Place finger...");
  }
  
  delay(50);
}

int getFingerprintID() {
  uint8_t p = finger.getImage();
  
  if (p != FINGERPRINT_OK) return -1;
  
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return -1;
  
  p = finger.fingerFastSearch();
  if (p != FINGERPRINT_OK) return -1;
  
  // Found a match!
  return finger.fingerID;
}

void sendAttendanceToServer(int fingerId) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Construct URL
    String url = "http://" + String(serverIP) + ":" + String(serverPort) + String(apiEndpoint);
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["finger_id"] = fingerId;
    doc["scanner_ip"] = WiFi.localIP().toString();
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    Serial.println("Sending: " + jsonPayload);
    
    // Send POST request
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
      
      // Parse JSON response
      StaticJsonDocument<512> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (!error) {
        const char* status = responseDoc["status"];
        const char* name = responseDoc["student"]["name"];
        const char* usn = responseDoc["student"]["usn"];
        const char* loginTime = responseDoc["login_time"];
        const char* logoutTime = responseDoc["logout_time"];
        
        // Display on LCD
        displayOnLCD(status, name, usn, loginTime, logoutTime);
      } else {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Parse Error");
      }
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Server Error");
      lcd.setCursor(0, 1);
      lcd.print("Code: ");
      lcd.print(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Error");
  }
}

void displayOnLCD(const char* status, const char* name, const char* usn, 
                  const char* loginTime, const char* logoutTime) {
  lcd.clear();
  
  if (strcmp(status, "login") == 0) {
    // Login display
    lcd.setCursor(0, 0);
    lcd.print("LIBRARY ENTRY");
    
    lcd.setCursor(0, 1);
    lcd.print("Name: ");
    lcd.print(name);
    
    lcd.setCursor(0, 2);
    lcd.print("USN: ");
    lcd.print(usn);
    
    lcd.setCursor(0, 3);
    lcd.print("IN: ");
    // Extract time from ISO string (simplified)
    String timeStr = String(loginTime);
    int tIndex = timeStr.indexOf('T');
    if (tIndex > 0) {
      String time = timeStr.substring(tIndex + 1, tIndex + 6);
      lcd.print(time);
    }
  } else {
    // Logout display
    lcd.setCursor(0, 0);
    lcd.print("LIBRARY EXIT");
    
    lcd.setCursor(0, 1);
    lcd.print("Name: ");
    lcd.print(name);
    
    lcd.setCursor(0, 2);
    lcd.print("USN: ");
    lcd.print(usn);
    
    lcd.setCursor(0, 3);
    lcd.print("OUT: ");
    // Extract time from ISO string (simplified)
    String timeStr = String(logoutTime);
    int tIndex = timeStr.indexOf('T');
    if (tIndex > 0) {
      String time = timeStr.substring(tIndex + 1, tIndex + 6);
      lcd.print(time);
    }
  }
}

/*
 * FINGERPRINT ENROLLMENT SKETCH
 * 
 * Use this separate sketch to enroll fingerprints and get template IDs.
 * Upload this sketch first to enroll all students, note their IDs,
 * then upload the main sketch above.
 * 
 * You can find enrollment examples in:
 * File -> Examples -> Adafruit Fingerprint Sensor Library -> enroll
 * 
 * Steps:
 * 1. Upload enrollment sketch
 * 2. Open Serial Monitor
 * 3. Follow prompts to enroll fingerprints
 * 4. Note the ID assigned to each student
 * 5. Register student in web app with same Finger ID
 * 6. Upload main attendance sketch
 */
