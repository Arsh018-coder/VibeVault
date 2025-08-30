const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    banner: { type: String }, // Cloudinary image
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
