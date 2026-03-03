const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    userId: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    // New fields for note customization
    priority: { type: String, default: "medium" }, // low, medium, high
    folderId: { type: Number, default: 1 }, // Folder ID
    color: { type: String, default: "#e4eef0" }, // Note background color
    // Attachment fields
    doodle: { type: String, default: "" }, // Base64 encoded doodle image
    mediaAttachments: {
        type: [{
            data: String,
            name: String,
            type: String
        }],
        default: []
    }, // Array of media file URLs (Data URIs) with metadata
    voiceAttachments: { type: [String], default: [] }, // Array of voice recording URLs
    fileAttachments: {
        type: [{
            data: String,
            name: String,
            type: String
        }],
        default: []
    }, // Array of file attachments with metadata
});

// Add compound index to optimize the main dashboard query (Get All Notes)
// This prevents the "Sort exceeded memory limit" error when notes have large attachments
noteSchema.index({ userId: 1, isPinned: -1, createdOn: -1 });

module.exports = mongoose.model("Note", noteSchema);