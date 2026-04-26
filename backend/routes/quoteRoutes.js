const express = require("express");
const router = express.Router();
const { createQuote, getQuotes, estimateQuote } = require("../controllers/quoteController");
const auth = require("../middleware/authMiddleware");

router.post("/estimate", auth, estimateQuote);
router.post("/", auth, createQuote);
router.get("/", auth, getQuotes);

module.exports = router;
