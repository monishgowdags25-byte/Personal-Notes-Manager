const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stickyNoteSchema = new Schema({
    userId: { type: String, required: true },
    content: { type: String, default: "" },
    color: { type: String, default: "#fff3cd" }, // Default yellow
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model("StickyNote", stickyNoteSchema);
