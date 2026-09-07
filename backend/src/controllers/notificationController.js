const Notification = require("../models/Notification");

async function list(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(80);
    res.json({ notifications, unread: notifications.filter((n) => !n.read).length });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    if (req.body.all) {
      await Notification.updateMany({ user: req.user._id }, { read: true });
    } else {
      await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, markRead };
