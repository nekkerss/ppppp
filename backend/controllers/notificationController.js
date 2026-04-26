const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  const notifs = await Notification.find({ userId: req.user.id });
  res.json(notifs);
};

exports.markAsRead = async (req, res) => {
  const notif = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { returnDocument: "after" }
  );

  res.json(notif);
};