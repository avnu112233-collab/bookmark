const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
require('dotenv').config();

let db;

// Initialize database based on DB_TYPE
const initDatabase = () => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'postgresql') {
    // PostgreSQL connection
    db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✓ Connected to PostgreSQL database');
    return createTablesPostgreSQL();
  } else {
    // SQLite connection (default)
    const dbPath = process.env.DB_PATH || './database.sqlite';
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err);
      } else {
        console.log('✓ Connected to SQLite database');
      }
    });

    return createTablesSQLite();
  }
};

// Create tables for SQLite
const createTablesSQLite = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Students table
      db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usn TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          finger_id INTEGER UNIQUE NOT NULL,
          branch TEXT,
          semester TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating students table:', err);
        else console.log('✓ Students table ready');
      });

      // Attendance logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          usn TEXT NOT NULL,
          name TEXT NOT NULL,
          login_time DATETIME NOT NULL,
          logout_time DATETIME,
          session_date DATE NOT NULL,
          mode TEXT DEFAULT 'IN',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Error creating attendance_logs table:', err);
        else console.log('✓ Attendance logs table ready');
      });

      // Borrowed books table
      db.run(`
        CREATE TABLE IF NOT EXISTS borrowed_books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          branch TEXT NOT NULL,
          semester TEXT NOT NULL,
          book_code TEXT NOT NULL,
          borrow_date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating borrowed_books table:', err);
          reject(err);
        } else {
          console.log('✓ Borrowed books table ready');
          resolve();
        }
      });
    });
  });
};

// Create tables for PostgreSQL
const createTablesPostgreSQL = async () => {
  try {
    // Students table
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        usn VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        finger_id INTEGER UNIQUE NOT NULL,
        branch VARCHAR(100),
        semester VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Students table ready');

    // Attendance logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance_logs (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        usn VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        login_time TIMESTAMP NOT NULL,
        logout_time TIMESTAMP,
        session_date DATE NOT NULL,
        mode VARCHAR(10) DEFAULT 'IN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Attendance logs table ready');
  } catch (err) {
    console.error('Error creating tables:', err);
    throw err;
  }
};

// Query wrapper for both databases
const query = (sql, params = []) => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'postgresql') {
    return db.query(sql, params).then(result => result.rows);
  } else {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Run query (for INSERT, UPDATE, DELETE)
const run = (sql, params = []) => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'postgresql') {
    return db.query(sql, params).then(result => ({
      lastID: result.rows[0]?.id,
      changes: result.rowCount
    }));
  } else {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

// Get single row
const get = (sql, params = []) => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'postgresql') {
    return db.query(sql, params).then(result => result.rows[0]);
  } else {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = {
  initDatabase,
  query,
  run,
  get,
  db
};
