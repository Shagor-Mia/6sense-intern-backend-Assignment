import { Request, Response } from "express";
import Category from "../models/category.model";
import { asyncHandler } from "../middlewares/errorHandler";
import mongoose from "mongoose";

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body;
    console.log("categoryName", name);

    if (!name) {
      res.status(400);
      throw new Error("Category name is required");
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400);
      throw new Error("Category already exists");
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  }
);

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await Category.find({});
    res.status(200).json(categories);
  }
);

//  Get a single category by ID
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Optional: Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid category ID");
    }

    const category = await Category.findById(id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    res.status(200).json(category);
  }
);
