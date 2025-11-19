// database.js
const mysql = require("mysql2");

// Create a MySQL connection using mysql2
// Update 'user' and 'password' if your MySQL setup uses different credentials
// Make sure the 'company_db' database exists in your MySQL server before running
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // ← change if needed
  password: "", // ← change if needed
  database: "company_db", // ← create this DB in MySQL first
});

// Attempt to connect to the database
// Exit the process if connection fails (critical for security and reliability)
db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1); // Stop the app if DB is unreachable
  }
  console.log("✅ Connected to MySQL");
});

module.exports = db;
