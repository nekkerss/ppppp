const express = require("express");
const router  = express.Router();
const {
  sendMessage,
  getMessages,
  getConversations,
  getConversationWith,
  getUnreadCount
} = require("../controllers/messageController");
const auth = require("../middleware/authMiddleware");

router.get("/unread-count",          auth, getUnreadCount);
router.get("/conversations",         auth, getConversations);
router.get("/conversation/:userId",  auth, getConversationWith);
router.post("/",                     auth, sendMessage);
router.get("/",                      auth, getMessages);

module.exports = router;
