require("dotenv").config();

// import essentials modules
const express = require("express");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const db = require("./database"); // mysql connection
const helmet = require("helmet"); // security HTTP headers

// initialize express app and define port
const app = express();
const port = 3000 || 4000;

// Apply Helmet middleware to enhance security
// - Sets Content Security Policy (CSP)
// - Blocks inline scripts by default (except in styles for simplicity)
// - Helps prevent XSS and other common web vulnerabilities
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Only allow resources from same origin
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (for quick UI)
        scriptSrc: ["'self'"], // Only allow trusted scripts
      },
    },
  })
);

// Parse incoming JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Validate each CSV row to ensure data integrity and prevent injection
// Returns true only if all fields meet format and length requirements
function validateRow(row) {
  const { first_name, last_name, email, age } = row;
  const a = Number(age);
  return (
    first_name &&
    last_name &&
    email &&
    age &&
    /^[a-zA-Z0-9]{1,20}$/.test(first_name) && // Alphanumeric, max 20 chars
    /^[a-zA-Z0-9]{1,20}$/.test(last_name) && // Same for last name
    /^\S+@\S+\.\S+$/.test(email) && // Basic email format
    !isNaN(a) &&
    a >= 0 &&
    a <= 150 // Reasonable age range
  );
}

// Load and process the CSV file once when the server starts
// Insert only validated records into the database
function loadCSV() {
  const valid = []; // Store valid rows for batch insert
  let line = 2; // Track CSV line number (header = line 1)

  fs.createReadStream("person_info.csv")
    .pipe(csv()) // Parse CSV stream
    .on("data", (row) => {
      if (validateRow(row)) {
        // Push safe data as array for efficient INSERT ... VALUES ?
        valid.push([row.first_name, row.last_name, row.email, row.age]);
      } else {
        console.error(`❌ Invalid data at row ${line}:`, row);
      }
      line++;
    })
    .on("end", () => {
      if (valid.length > 0) {
        // Use mysql2's safe batch insert (prevents SQL injection)
        const sql =
          "INSERT INTO mysql_table (first_name, last_name, email, age) VALUES ?";
        db.query(sql, [valid], (err) => {
          if (err) console.error("Insert failed:", err);
          else console.log(`✅ ${valid.length} records inserted.`);
        });
      }
    });
}

// Handle POST requests from frontend form
// Validates all fields before accepting submission
app.post("/submit", (req, res) => {
  const { first_name, last_name, email, phone, eircode } = req.body;

  // Apply strict validation rules (aligned with Irish/UK standards)
  if (!/^[a-zA-Z0-9]{1,20}$/.test(first_name))
    return res.status(400).send("Invalid first name");
  if (!/^[a-zA-Z0-9]{1,20}$/.test(last_name))
    return res.status(400).send("Invalid last name");
  if (!/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).send("Invalid email");
  if (!/^\d{10}$/.test(phone))
    return res.status(400).send("Phone must be 10 digits");
  if (!/^[0-9][a-zA-Z0-9]{5}$/.test(eircode))
    return res.status(400).send("Invalid Eircode"); // Irish postal code format

  // In a production system, this data would be inserted into a secure table
  // For now, log to console to confirm validation works
  console.log("✅ Valid form data:", {
    first_name,
    last_name,
    email,
    phone,
    eircode,
  });
  res.send("✅ Form submitted securely!");
});

// Start the server and trigger CSV loading once ready
app.listen(3000, (err) => {
  if (err) {
    console.error("❌ Server failed:", err);
    process.exit(1);
  }
  console.log(`✅ Server running on http://localhost:${3000}`);
  loadCSV(); // Load initial data from CSV
});
