import express from "express";
import {
  createProduct,
  updateProduct,
  getProducts,
} from "../controllers/product.controller";
import { upload } from "../middlewares/multer"; // Multer setup
import { uploadToCloudinary } from "../middlewares/uploader";

const router = express.Router();

// POST /api/products -> create product (with up to 5 images)
// GET /api/products -> get all products with optional filters
router
  .route("/")
  .post(upload.array("images", 5), uploadToCloudinary, createProduct)
  .get(getProducts);

// PUT /api/products/:id -> update description, discount, and status
router.route("/:id").put(updateProduct);

export default router;
