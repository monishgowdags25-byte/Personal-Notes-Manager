
const fs = require('fs');
const path = require('path');


// Force restart to load updated schema definitions - Attempt 4




console.log("=== NOTEFLOW BACKEND STARTING ===");

function logToFile(message) {
    const logPath = path.join(__dirname, 'server.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage);
    try {
        fs.appendFileSync(logPath, logMessage);
    } catch (e) {
        // ignore
    }
}

process.on('uncaughtException', (err) => {
    logToFile(`Uncaught Exception: ${err.message}`);
    logToFile(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    logToFile(`Unhandled Rejection: ${reason}`);
});

require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');

const User = require("./models/user.model");
const Note = require("./models/note.model");
const StickyNote = require("./models/sticky-note.model");
const FlowItem = require("./models/flowItem.model");
const { authenticateToken } = require("./utilities");

const app = express();
const PORT = 5007;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: "*" }));

// Request Logger
app.use((req, res, next) => {
    logToFile(`${req.method} ${req.url}`);
    next();
});

// Root
app.get("/", (req, res) => {
    res.json({ message: "NoteFlow Backend is running" });
});

// Database Connection
const connectionString = process.env.MONGO_URI || config.connectionString;

logToFile("Starting server...");
logToFile(`Attempting to connect to MongoDB...`);

mongoose.connect(connectionString, {
    serverSelectionTimeoutMs: 5000,
    socketTimeoutMs: 45000,
})
    .then(async () => {
        logToFile("Connected to MongoDB");
        try {
            await Note.createIndexes();
            logToFile("Notes indexes verified/created");
            const count = await Note.countDocuments();
            logToFile(`Total notes in DB: ${count}`);
            logToFile(`userId schema type: ${Note.schema.path('userId').instance}`);
            logToFile(`Connected to database: ${mongoose.connection.name}`);
        } catch (err) {
            logToFile(`Error on startup: ${err.message}`);
        }
    })
    .catch((err) => {
        logToFile(`Could not connect to MongoDB: ${err.message}`);
        logToFile("Check your IP Whitelist on MongoDB Atlas or your internet connection.");
    });

// Google Auth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Routes

// Create Account
app.post("/signup", async (req, res) => {
    const { fullName, email, password, profilePicture } = req.body;
    logToFile(`Signup attempt for email: ${email}`);

    if (!fullName) return res.status(400).json({ error: true, message: "Full Name is required" });
    if (!email) return res.status(400).json({ error: true, message: "Email is required" });
    if (!password) return res.status(400).json({ error: true, message: "Password is required" });

    try {
        const isUser = await User.findOne({ email: email });

        if (isUser) {
            logToFile(`Signup failed: User already exists for email: ${email}`);
            return res.json({
                error: true,
                message: "User already exists",
            });
        }

        const user = new User({
            fullName,
            email,
            password,
            profilePicture: profilePicture || "",
        });

        await user.save();
        logToFile(`User created: ${user._id}`);

        const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });

        return res.json({
            error: false,
            user,
            accessToken,
            message: "Registration Successful",
        });
    } catch (error) {
        logToFile(`Signup error: ${error.message}`);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    logToFile(`Login attempt for email: ${email}`);

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    try {
        const userInfo = await User.findOne({ email: email });

        if (!userInfo) {
            logToFile(`Login failed: User not found for email: ${email}`);
            return res.status(400).json({ message: "User not found" });
        }

        if (userInfo.email == email && userInfo.password == password) {
            const user = { user: userInfo };
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "36000m",
            });

            logToFile(`Login successful for email: ${email}`);
            return res.json({
                error: false,
                message: "Login Successful",
                email,
                accessToken,
            });
        } else {
            logToFile(`Login failed: Invalid credentials for email: ${email}`);
            return res.status(400).json({ error: true, message: "Invalid Credentials" });
        }
    } catch (error) {
        logToFile(`Login error: ${error.message}`);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Google Login
app.post("/google-login", async (req, res) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email: email });

        if (!user) {
            user = new User({
                fullName: name,
                email: email,
                password: "GOOGLE_AUTH",
            });
            await user.save();
        }

        const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });

        return res.json({
            error: false,
            message: "Google login successful",
            email,
            accessToken,
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Google login failed: " + error.message,
        });
    }
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const isUser = await User.findOne({ _id: user._id });

        if (!isUser) return res.sendStatus(401);

        return res.json({
            user: {
                fullName: isUser.fullName,
                email: isUser.email,
                "_id": isUser._id,
                createdOn: isUser.createdOn,
                profilePicture: isUser.profilePicture
            },
            message: "",
        });
    } catch (error) {
        return res.sendStatus(500);
    }
});

// Update User
app.put("/update-user", authenticateToken, async (req, res) => {
    const { user } = req.user;
    const { fullName, profilePicture } = req.body;

    try {
        const isUser = await User.findOne({ _id: user._id });

        if (!isUser) return res.sendStatus(401);

        if (fullName) isUser.fullName = fullName;
        if (profilePicture) isUser.profilePicture = profilePicture;

        await isUser.save();

        return res.json({
            error: false,
            user: {
                fullName: isUser.fullName,
                email: isUser.email,
                "_id": isUser._id,
                createdOn: isUser.createdOn,
                profilePicture: isUser.profilePicture
            },
            message: "User updated successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags, priority, folderId, color, doodle, mediaAttachments, voiceAttachments, fileAttachments } = req.body;
    const { user } = req.user;

    if (!title) return res.status(400).json({ error: true, message: "Title is required" });
    if (!content) return res.status(400).json({ error: true, message: "Content is required" });

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            priority: priority || "medium",
            folderId: folderId || 1,
            color: color || "#e4eef0",
            userId: user._id,
            doodle: doodle || "",
            mediaAttachments: mediaAttachments || [],
            voiceAttachments: voiceAttachments || [],
            fileAttachments: fileAttachments || []
        });

        await note.save();
        logToFile(`Note added: ${note._id} for user ${user._id}`);

        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, priority, folderId, color, isPinned, doodle, mediaAttachments, voiceAttachments, fileAttachments } = req.body;
    const { user } = req.user;

    if (!title && !content && !tags && !priority && !folderId && !color && !doodle && !mediaAttachments && !voiceAttachments && !fileAttachments && isPinned === undefined) {
        return res.status(400).json({ error: true, message: "No changes provided" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) return res.status(404).json({ error: true, message: "Note not found" });

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (priority) note.priority = priority;
        if (folderId) note.folderId = folderId;
        if (color) note.color = color;
        if (isPinned !== undefined) note.isPinned = isPinned;
        if (doodle !== undefined) note.doodle = doodle;
        if (mediaAttachments !== undefined) note.mediaAttachments = mediaAttachments;
        if (voiceAttachments !== undefined) note.voiceAttachments = voiceAttachments;
        if (fileAttachments !== undefined) note.fileAttachments = fileAttachments;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });

    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Helper to strip heavy data from notes for list views
const getSummaryNote = (note) => {
    return {
        ...note,
        hasDoodle: !!note.doodle && note.doodle.length > 0,
        hasMedia: note.mediaAttachments && note.mediaAttachments.length > 0,
        hasFiles: note.fileAttachments && note.fileAttachments.length > 0,
        hasVoice: note.voiceAttachments && note.voiceAttachments.length > 0,
        // Strip heavy data
        mediaAttachments: (note.mediaAttachments || []).map(a => ({ name: a.name, type: a.type })),
        fileAttachments: (note.fileAttachments || []).map(a => ({ name: a.name, type: a.type })),
        voiceAttachments: (note.voiceAttachments || []).map(a => ""), // just metadata presence
        doodle: ""
    };
};

const NOTE_SUMMARY_PROJECTION = {
    _id: 1,
    title: 1,
    content: 1,
    tags: 1,
    isPinned: 1,
    priority: 1,
    color: 1,
    folderId: 1,
    createdOn: 1,
    updatedOn: 1,
    'mediaAttachments.name': 1,
    'mediaAttachments.type': 1,
    'fileAttachments.name': 1,
    'fileAttachments.type': 1,
    'voiceAttachments': 1,
    'doodle': 1
};
app.get("/get-all-notes", authenticateToken, async (req, res) => {
    console.log("=== GET ALL NOTES REQUEST RECEIVED ===");
    logToFile("GET ALL NOTES REQUEST RECEIVED");
    const { user } = req.user;
    console.log("User ID:", user._id);

    try {
        logToFile(`Starting Note Query for user ${user._id}`);
        const start = Date.now();

        // STRICT PROJECTION for the list view to ensure maximum speed
        const notes = await Note.find({ userId: user._id }, NOTE_SUMMARY_PROJECTION)
            .sort({ isPinned: -1, createdOn: -1 })
            .limit(100)
            .setOptions({ allowDiskUse: true })
            .lean()
            .exec();

        // Transform slightly to provide indicators without the heavy data
        const summaryNotes = notes.map(getSummaryNote);

        const duration = Date.now() - start;
        logToFile(`Query Finished in ${duration}ms. Retrieved ${notes.length} notes for user ${user._id}`);

        return res.json({
            error: false,
            notes: summaryNotes,
            message: "All notes retrieved successfully",
        });

    } catch (error) {
        console.error("Error in get-all-notes:", error);
        logToFile(`Error in get-all-notes: ${error.message}`);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Get Single Note (Full Details)
app.get("/get-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) return res.status(404).json({ error: true, message: "Note not found" });

        return res.json({
            error: false,
            note,
            message: "Note retrieved successfully",
        });

    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;

    logToFile(`Starting deletion of note ${noteId} for user ${user._id}`);

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            logToFile(`Deletion failed: Note ${noteId} not found for user ${user._id}`);
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        const deleteResult = await Note.deleteOne({ _id: noteId, userId: user._id });
        logToFile(`Note ${noteId} deleted from DB. Result: ${JSON.stringify(deleteResult)}`);

        return res.json({
            error: false,
            message: "Note deleted successfully",
        });

    } catch (error) {
        logToFile(`Error deleting note ${noteId}: ${error.message}`);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Update isPinned Value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
        const note = await Note.findOneAndUpdate(
            { _id: noteId, userId: user._id },
            { $set: { isPinned: isPinned } },
            { new: true, projection: { _id: 1, isPinned: 1, createdOn: 1, updatedOn: 1 } }
        );

        if (!note) return res.status(404).json({ error: true, message: "Note not found" });

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        logToFile(`Error pinning note ${noteId}: ${error.message}`);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Search Notes
app.get("/search-notes/", authenticateToken, async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;

    if (!query) return res.status(400).json({ error: true, message: "Search query is required" });

    try {
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { content: { $regex: new RegExp(query, "i") } },
            ],
        }, NOTE_SUMMARY_PROJECTION)
            .sort({ isPinned: -1, createdOn: -1 })
            .limit(100)
            .lean()
            .exec();

        const summaryNotes = matchingNotes.map(getSummaryNote);

        return res.json({
            error: false,
            notes: summaryNotes,
            message: "Notes matching the search query retrieved successfully",
        });

    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Sticky Note Routes

// Add Sticky Note
app.post("/add-sticky-note", authenticateToken, async (req, res) => {
    const { content, color, x, y } = req.body;
    const { user } = req.user;

    try {
        const stickyNote = new StickyNote({
            content,
            color,
            x: x || 50,
            y: y || 50,
            userId: user._id
        });

        await stickyNote.save();

        return res.json({
            error: false,
            stickyNote,
            message: "Sticky note added successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Get All Sticky Notes
app.get("/get-all-sticky-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const stickyNotes = await StickyNote.find({ userId: user._id });

        return res.json({
            error: false,
            stickyNotes,
            message: "All sticky notes retrieved successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Update Sticky Note
app.put("/edit-sticky-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { content, color, x, y } = req.body;
    const { user } = req.user;

    try {
        const stickyNote = await StickyNote.findOne({ _id: noteId, userId: user._id });

        if (!stickyNote) return res.status(404).json({ error: true, message: "Sticky note not found" });

        if (content !== undefined) stickyNote.content = content;
        if (color !== undefined) stickyNote.color = color;
        if (x !== undefined) stickyNote.x = x;
        if (y !== undefined) stickyNote.y = y;

        await stickyNote.save();

        return res.json({
            error: false,
            stickyNote,
            message: "Sticky note updated successfully",
        });

    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Delete Sticky Note
app.delete("/delete-sticky-note/:id", authenticateToken, async (req, res) => {
    const id = req.params.id;
    const { user } = req.user;

    logToFile(`Starting deletion of sticky note ${id} for user ${user._id}`);

    try {
        const stickyNote = await StickyNote.findOne({ _id: id, userId: user._id });

        if (!stickyNote) {
            logToFile(`Deletion failed: Sticky note ${id} not found for user ${user._id}`);
            return res.status(404).json({ error: true, message: "Sticky note not found" });
        }

        const deleteResult = await StickyNote.deleteOne({ _id: id, userId: user._id });
        logToFile(`Sticky note ${id} deleted from DB. Result: ${JSON.stringify(deleteResult)}`);

        return res.json({
            error: false,
            message: "Sticky note deleted successfully",
        });

    } catch (error) {
        logToFile(`Error deleting sticky note ${id}: ${error.message}`);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// --- FLOW BOARD ROUTES ---

// Add Flow Item
app.post("/add-flow-item", authenticateToken, async (req, res) => {
    const { type, content, data, fileName, x, y, width, height, rotation, color, zIndex } = req.body;
    const { user } = req.user;

    try {
        const flowItem = new FlowItem({
            userId: user._id,
            type,
            content,
            data,
            fileName,
            x: x || 0,
            y: y || 0,
            width: width || 200,
            height: height || 100,
            rotation: rotation || 0,
            color: color || '#ffffff',
            zIndex: zIndex || 1
        });

        await flowItem.save();

        return res.json({
            error: false,
            flowItem,
            message: "Flow item added successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Get All Flow Items
app.get("/get-flow-items", authenticateToken, async (req, res) => {
    const { user } = req.user;
    try {
        const flowItems = await FlowItem.find({ userId: user._id }).sort({ createdOn: 1 });
        return res.json({
            error: false,
            flowItems,
            message: "Flow items retrieved successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Update Flow Item
app.put("/update-flow-item/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const { user } = req.user;

    try {
        const flowItem = await FlowItem.findOne({ _id: id, userId: user._id });
        if (!flowItem) return res.status(404).json({ error: true, message: "Flow item not found" });

        Object.keys(updates).forEach(key => {
            flowItem[key] = updates[key];
        });

        await flowItem.save();
        return res.json({ error: false, flowItem, message: "Flow item updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Delete Flow Item
app.delete("/delete-flow-item/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { user } = req.user;
    try {
        await FlowItem.deleteOne({ _id: id, userId: user._id });
        return res.json({ error: false, message: "Flow item deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    logToFile(`Server is running on port ${PORT}`);
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;