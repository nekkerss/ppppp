const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const msg = new Message({
      senderId:   req.user.id,
      receiverId: req.body.receiverId,
      content:    req.body.content
    });
    await msg.save();
    const populated = await Message.findById(msg._id)
      .populate("senderId",   "name email role avatar")
      .populate("receiverId", "name email role avatar");
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all conversations for the current user (grouped by partner, with last msg + unread count)
exports.getConversations = async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);

    const messages = await Message.find({
      $or: [{ senderId: uid }, { receiverId: uid }]
    })
      .populate("senderId",   "name email role avatar")
      .populate("receiverId", "name email role avatar")
      .sort({ createdAt: -1 });

    const map = {};
    messages.forEach((msg) => {
      if (!msg.senderId || !msg.receiverId) return;

      const sId = msg.senderId._id.toString();
      const rId = msg.receiverId._id.toString();
      const myId = uid.toString();
      const otherId = sId === myId ? rId : sId;
      const otherUser = sId === myId ? msg.receiverId : msg.senderId;

      if (!map[otherId]) {
        map[otherId] = { user: otherUser, lastMessage: msg, unreadCount: 0 };
      }
      if (rId === myId && !msg.read) {
        map[otherId].unreadCount++;
      }
    });

    return res.json(Object.values(map));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get full message thread between current user and another user (marks their messages as read)
exports.getConversationWith = async (req, res) => {
  try {
    const uid      = new mongoose.Types.ObjectId(req.user.id);
    const otherId  = new mongoose.Types.ObjectId(req.params.userId);

    const messages = await Message.find({
      $or: [
        { senderId: uid,     receiverId: otherId },
        { senderId: otherId, receiverId: uid     }
      ]
    })
      .populate("senderId",   "name email role avatar")
      .populate("receiverId", "name email role avatar")
      .sort({ createdAt: 1 });

    // Mark messages from the other user as read
    await Message.updateMany(
      { senderId: otherId, receiverId: uid, read: false },
      { $set: { read: true } }
    );

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Total unread count for badge
exports.getUnreadCount = async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);
    const count = await Message.countDocuments({ receiverId: uid, read: false });
    return res.json({ count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete all messages in a conversation between current user and another user
exports.deleteConversation = async (req, res) => {
  try {
    const uid     = new mongoose.Types.ObjectId(req.user.id);
    const otherId = new mongoose.Types.ObjectId(req.params.userId);

    await Message.deleteMany({
      $or: [
        { senderId: uid,     receiverId: otherId },
        { senderId: otherId, receiverId: uid     }
      ]
    });

    return res.json({ message: "Conversation supprimée" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get messages scoped to the current user only (every role sees only their own)
exports.getMessages = async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);
    const msgs = await Message.find({
      $or: [{ senderId: uid }, { receiverId: uid }]
    })
      .populate("senderId",   "name email role")
      .populate("receiverId", "name email role")
      .sort({ createdAt: -1 });

    return res.json(msgs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
