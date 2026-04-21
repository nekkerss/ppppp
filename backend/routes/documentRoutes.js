const express = require("express");
const router = express.Router();
const { uploadDocument, getDocuments, deleteDocument } = require("../controllers/documentController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/upload", auth, upload.single("file"), uploadDocument);
router.get("/", auth, getDocuments);
router.delete("/:id", auth, deleteDocument);

module.exports = router;