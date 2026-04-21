const Message = require("../models/Message");
const User = require("../models/User");

exports.sendMessage = async (req, res) => {
  const msg = new Message({
    senderId: req.user.id,
    receiverId: req.body.receiverId,
    content: req.body.content
  });

  await msg.save();
  res.json(msg);
};

exports.getMessages = async (req, res) => {
  const currentUser = await User.findById(req.user.id).select("role");
  const canSeeAll = ["admin", "gestionnaire"].includes(currentUser?.role);

  const query = canSeeAll
    ? {}
    : {
        $or: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      };

  const msgs = await Message.find(query)
    .populate("senderId", "name email role")
    .populate("receiverId", "name email role");

  res.json(msgs);
};