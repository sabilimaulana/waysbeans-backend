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
  notification,
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

// Untuk membuat transaksi baru
router.post(
  "/transaction",
  checkAuth,
  upload.single("attachment"),
  addTransaction
);

router.post("/notification", notification);

// Mendapatkan semua daftar transaksi
router.get("/transactions", getAllTransactions);

// Mengupdate transaksi
router.patch(
  "/transaction/:id",
  checkAuth,
  upload.single("attachment"),
  updateTransaction
);

// Mendapatkan satu data transaksi
router.get("/transaction/:id", getTransactionById);

// Opsional
// untuk user
router.get("/transactions/order", checkAuth, getOrder);

module.exports = router;
