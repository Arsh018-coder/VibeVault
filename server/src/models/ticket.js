const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    type: { type: String, enum: ["regular", "vip", "early-bird"], default: "regular" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
