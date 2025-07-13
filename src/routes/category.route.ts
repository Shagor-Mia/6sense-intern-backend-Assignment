import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
} from "../controllers/category.controller";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);

export default router;
