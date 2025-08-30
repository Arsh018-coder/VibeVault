const Event = require('../models/event');
const User = require('../models/user');

exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdById: req.user.id, // Sequelize foreign key
    });

    res.status(201).json({ message: 'Event created', event });
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email'], // only select needed fields
        },
      ],
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};
