// backend/controllers/contactController.js
import Message from '../models/Message.js';
import asyncHandler from 'express-async-handler';

// @desc    Create new contact message
// @route   POST /api/contact
// @access  Public
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required');
  }

  const newMessage = new Message({
    name,
    email,
    subject,
    message,
  });

  const createdMessage = await newMessage.save();
  res.status(201).json({
    message: 'Message received successfully!',
    data: createdMessage,
  });
  // In a real app, you might also trigger an email notification here
});

export { submitContactForm };