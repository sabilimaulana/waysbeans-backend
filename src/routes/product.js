const { Router } = require("express");
const checkAuth = require("../middleware/checkAuth");
const {
  getAllProducts,
  addProduct,
  getProduct,
} = require("../controllers/product");
// const { User } = require("../../models");
const multer = require("multer");

// Harusnya ini ada di .env

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
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

router.get("/products", getAllProducts);

router.get("/product/:id", getProduct);

router.post("/product", checkAuth, upload.single("photo"), addProduct);

module.exports = router;
