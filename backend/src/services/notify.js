const Notification = require("../models/Notification");

async function notify(userId, { title, body, type = "general", meta = {} }) {
  if (!userId) return null;
  return Notification.create({ user: userId, title, body, type, meta });
}

module.exports = { notify };
