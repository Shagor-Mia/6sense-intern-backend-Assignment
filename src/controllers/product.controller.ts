import { asyncHandler, errorHandler } from "./../middlewares/errorHandler";
import { Request, Response, NextFunction } from "express";
import Product, { IProduct } from "../models/product.model";
import Category from "../models/category.model";
import { generateProductCode } from "../utils/productCodeGenerater";
import cloudinary from "../utils/cloudinary";

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, price, discount, status, category } = req.body;
    const images = req.body.images; // from middleware

    if (!images || images.length === 0) {
      res.status(400);
      throw new Error("At least one image is required for the product.");
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      // If category is invalid, clean up uploaded images from Cloudinary
      for (const imageUrl of images) {
        const publicId = imageUrl.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`product-images/${publicId}`);
        }
      }
      res.status(400);
      throw new Error("Invalid category");
    }

    const productCode = generateProductCode(name);
    // Check for product code uniqueness and handle potential collision (though unlikely)
    let productCodeCounter = 0;
    let uniqueProductCode = productCode;
    while (await Product.findOne({ productCode: uniqueProductCode })) {
      productCodeCounter++;
      // Append a counter to ensure uniqueness if the base code collides
      uniqueProductCode = `${productCode}-${productCodeCounter}`;
    }

    const product = await Product.create({
      name,
      description,
      price,
      discount,
      images, // Use the uploaded image URLs
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
