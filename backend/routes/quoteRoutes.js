const express = require("express");
const router = express.Router();
const { createQuote, getQuotes } = require("../controllers/quoteController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, createQuote);
router.get("/", auth, getQuotes);

module.exports = router;