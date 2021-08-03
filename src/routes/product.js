const { Router } = require("express");
const checkAuth = require("../middleware/checkAuth");
const {
  getAllProducts,
  addProduct,
  getProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/product");
const multer = require("multer");

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

router.delete("/product/:id", checkAuth, deleteProduct);

router.post("/product", checkAuth, upload.single("photo"), addProduct);

router.patch("/product/:id", checkAuth, upload.single("photo"), updateProduct);

module.exports = router;
