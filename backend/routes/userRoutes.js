const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAllAccounts,
  getAccountById,
  updateAccountByAdmin,
  deleteAccountByAdmin,
  getMessageRecipients
} = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.post("/avatar", auth, upload.single("avatar"), uploadAvatar);
router.get("/message-recipients", auth, getMessageRecipients);
router.get("/admin/accounts", auth, admin, getAllAccounts);
router.get("/admin/accounts/:id", auth, admin, getAccountById);
router.patch("/admin/accounts/:id", auth, admin, updateAccountByAdmin);
router.delete("/admin/accounts/:id", auth, admin, deleteAccountByAdmin);

module.exports = router;