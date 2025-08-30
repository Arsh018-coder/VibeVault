const Ticket = require('../models/ticket');

exports.createTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
};

exports.getTicketsByEvent = async (req, res, next) => {
  try {
    const tickets = await Ticket.findAll({
      where: { eventId: req.params.eventId }
    });
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};
