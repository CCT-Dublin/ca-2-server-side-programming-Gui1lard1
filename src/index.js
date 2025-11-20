// import essentials modules
const express = require("express");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const db = require("./database"); // mysql connection
const helmet = require("helmet"); // security HTTP headers

// initialize express app and define port
const app = express();
const port = express.env.PORT || 3000;

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
