const Booking = require('../models/booking');
const Ticket = require('../models/ticket');

exports.createBooking = async (req, res, next) => {
  try {
    const { ticketId, quantity } = req.body;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const booking = await Booking.create({
      userId: req.user.id,      // make sure Booking model has userId as foreign key
      ticketId: ticket.id,      // Booking model should have ticketId as foreign key
      quantity,
      totalPrice: ticket.price * quantity,
    });

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    next(err);
  }
};
