const { Router } = require("express");
const multer = require("multer");
const {
  addTransaction,
  getAllTransactions,
  updateTransaction,
  getTransactionById,
  getOrder,
  getHistory,
  getTransactionsByOwnerId,
  addTransactionTwo,
} = require("../controllers/transaction");
const checkAuth = require("../middleware/checkAuth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 },
});

const router = Router();

router.post(
  "/transaction",
  checkAuth,
  upload.single("attachment"),
  addTransaction
);

// router.post("/transactiontwo", checkAuth, addTransactionTwo);

router.get("/transactions", getAllTransactions);

router.patch(
  "/transaction/:id",
  checkAuth,
  upload.single("attachment"),
  updateTransaction
);

router.get("/transaction/:id", getTransactionById);

// Opsional
// untuk user
router.get("/transactions/order", checkAuth, getOrder);

// router.get("/transactions/history", checkAuth, getHistory);

// router.get("/transactions/:ownerId", checkAuth, getTransactionsByOwnerId);

module.exports = router;
