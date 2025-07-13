import express from "express";
import {
  createProduct,
  updateProduct,
  getProducts,
} from "../controllers/product.controller";
import { upload } from "../middlewares/multer";

const router = express.Router();

router
  .route("/")
  .post(
    upload.single("image"),
    (req, res, next) => {
      console.log("Multer file log:", req.file);
      next();
    },

    createProduct
  )
  .get(getProducts);

router.route("/:id").put(updateProduct);

export default router;
