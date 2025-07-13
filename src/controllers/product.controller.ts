import fs from "fs";
import { asyncHandler } from "./../middlewares/errorHandler";
import { Request, Response, NextFunction } from "express";
import Product from "../models/product.model";
import Category from "../models/category.model";
import { generateProductCode } from "../utils/productCodeGenerater";
import cloudinary from "../utils/cloudinary";
import path from "path";

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, price, discount, status, category } = req.body;

    if (!req.file) {
      res.status(400);
      throw new Error("Image file is required.");
    }

    // Upload image to Cloudinary
    const localFilePath = path.resolve(req.file.path);
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(localFilePath, {
        folder: "product-images",
      });
    } catch (err) {
      // Cleanup local file on error
      fs.unlinkSync(localFilePath);
      res.status(500);
      throw new Error("Failed to upload image to Cloudinary.");
    }

    // Delete local file after successful upload
    fs.unlinkSync(localFilePath);

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      // Delete uploaded image on Cloudinary if category invalid
      await cloudinary.uploader.destroy(uploadResult.public_id);
      res.status(400);
      throw new Error("Invalid category");
    }

    // Generate unique productCode
    const baseProductCode = generateProductCode(name);
    let productCodeCounter = 0;
    let uniqueProductCode = baseProductCode;
    while (await Product.findOne({ productCode: uniqueProductCode })) {
      productCodeCounter++;
      uniqueProductCode = `${baseProductCode}-${productCodeCounter}`;
    }

    // Create product record with uploaded image URL
    const product = await Product.create({
      name,
      description,
      price,
      discount,
      image: uploadResult.secure_url, // array with single image URL
      status,
      productCode: uniqueProductCode,
      category,
    });

    res.status(201).json(product);
  }
);
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    // Only description, discount, and status can be updated via this endpoint per instructions
    const { description, discount, status } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    product.description =
      description !== undefined ? description : product.description;
    product.discount = discount !== undefined ? discount : product.discount;
    product.status = status !== undefined ? status : product.status;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  }
);

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, search } = req.query;

  const query: any = {};
  if (category) {
    // Validate if the category ID is a valid Mongoose ObjectId before querying
    if (!Category.base.Types.ObjectId.isValid(category as string)) {
      res.status(400);
      throw new Error("Invalid category ID format");
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(400);
      throw new Error("Category not found");
    }
    query.category = category;
  }
  if (search) {
    // Case-insensitive partial or full match on name
    query.name = { $regex: search, $options: "i" };
  }

  // Populate the category details and apply the virtual for finalPrice
  const products = await Product.find(query).populate("category", "name");

  // The finalPrice is automatically added by the virtual defined in the schema
  res.json(products);
});
