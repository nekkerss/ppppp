const express = require("express");
const router = express.Router();
const { createContract, getContracts, renewContract, cancelContract } = require("../controllers/contractController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, createContract);
router.get("/", auth, getContracts);
router.post("/:id/renew", auth, renewContract);
router.post("/:id/cancel", auth, cancelContract);

module.exports = router;