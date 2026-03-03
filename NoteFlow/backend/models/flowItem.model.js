const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const flowItemSchema = new Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true }, // 'text', 'image', 'doodle', 'file', 'voice'

    // Content Data
    content: { type: String, default: "" }, // The text note content, or title
    data: { type: String, default: "" }, // Base64 Data URL for media/files
    fileName: { type: String }, // Original filename for files

    // Geometry & Style
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 100 }, // Can be 'auto' logic on frontend, but saved as number here
    rotation: { type: Number, default: 0 },
    color: { type: String, default: "#ffffff" }, // Background color

    // State
    isLocked: { type: Boolean, default: false },
    zIndex: { type: Number, default: 1 },

    createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FlowItem", flowItemSchema);
