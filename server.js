// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use environment port or 3000

// --- Middleware ---
app.use(cors()); // Allow Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (HTML, CSS, JS)

// --- MongoDB Connection ---
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("Error: MONGODB_URI is not defined in the .env file.");
    process.exit(1); // Exit if connection string is missing
}
const client = new MongoClient(uri);
let db; // Variable to hold the database connection

async function connectDB() {
    try {
        await client.connect();
        db = client.db(); // Use the default DB from the connection string (or specify: client.db("marksheetDB"))
        console.log("Successfully connected to MongoDB Atlas!");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1); // Exit if connection fails
    }
}

// --- API Routes ---

// POST: Add a new student record
app.post('/api/students', async (req, res) => {
    if (!db) {
        return res.status(500).json({ message: 'Database not connected' });
    }
    try {
        const studentData = req.body;
        // Basic validation (add more as needed)
        if (!studentData.name || !studentData.uniqueId || !studentData.subject1 || !studentData.subject2 || !studentData.subject3 || !studentData.subject4) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if uniqueId already exists (optional but good practice)
        const existingStudent = await db.collection('students').findOne({ uniqueId: studentData.uniqueId });
        if (existingStudent) {
            return res.status(409).json({ message: 'Student with this Unique ID already exists' }); // 409 Conflict
        }

        const result = await db.collection('students').insertOne(studentData);
        console.log('Inserted student:', result.insertedId);
        // Send back the inserted document or just a success message
         res.status(201).json({ message: 'Student added successfully!', student: studentData });
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).json({ message: 'Failed to add student', error: error.message });
    }
});

// GET: Fetch student details by Unique ID
app.get('/api/students/:uniqueId', async (req, res) => {
    if (!db) {
        return res.status(500).json({ message: 'Database not connected' });
    }
    try {
        const uniqueId = req.params.uniqueId;
        const student = await db.collection('students').findOne({ uniqueId: uniqueId });

        if (student) {
            res.status(200).json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ message: 'Failed to fetch student', error: error.message });
    }
});

// --- Serve the HTML page for all other GET requests (for SPA behavior) ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start Server after DB Connection ---
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log("Closing MongoDB connection...");
    await client.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
});