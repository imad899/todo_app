require('dotenv').config();
const mongoose = require('./db');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Task = require('./models/Task');
const User = require('./models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

cron.schedule('0 8 * * *', async () => {
  // Runs every day at 8:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const tasks = await Task.find({
    dueDate: { $gte: tomorrow, $lt: dayAfter },
    completed: false,
  }).populate('user');

  for (const task of tasks) {
    const user = task.user;
    if (!user.email) continue;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Task Reminder',
      text: `Reminder: Your task "${task.title}" is due tomorrow!`,
    });
  }

  console.log('Reminders sent for tasks due tomorrow.');
}); 