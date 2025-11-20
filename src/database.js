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

// After successful connection, ensure the data table exists
// Table uses snake_case column names (industry best practice)
// All fields are NOT NULL to enforce data integrity
db.query(
  `
  CREATE TABLE IF NOT EXISTS mysql_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    age INT NOT NULL
  )
`,
  (err) => {
    if (err) {
      console.error("Table creation error:", err);
    } else {
      console.log("✅ Table mysql_table ready");
    }
  }
);

module.exports = db;
