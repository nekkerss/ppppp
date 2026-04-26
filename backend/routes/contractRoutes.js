const express = require("express");
const router = express.Router();
const {
  createContract,
  getContracts,
  renewContract,
  cancelContract,
  updateContract,
  deleteContract,
  getAllContractsGestionnaire,
  reviewContract,
  payContract
} = require("../controllers/contractController");
const auth = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Specific paths before /:id to avoid param conflicts
router.get("/gestionnaire/all", auth, adminMiddleware, getAllContractsGestionnaire);

router.post("/", auth, createContract);
router.get("/", auth, getContracts);
router.patch("/:id", auth, updateContract);
router.post("/:id/renew", auth, renewContract);
router.post("/:id/cancel", auth, cancelContract);
router.delete("/:id", auth, deleteContract);
router.patch("/:id/pay", auth, payContract);
router.patch("/:id/review", auth, adminMiddleware, reviewContract);

module.exports = router;
