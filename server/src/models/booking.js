const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    tickets: [
      {
        ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
        quantity: { type: Number, default: 1 },
      },
    ],
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
