// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Define environment variables
const API_URL = process.env.API_URL;
const CLUB_MEMORY = process.env.CLUB_MEMORY;

// Route to send API URL and CLUB_MEMORY to frontend
app.get('/api-config', (req, res) => {
    res.json({ API_URL, CLUB_MEMORY });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});