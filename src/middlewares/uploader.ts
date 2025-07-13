import { asyncHandler } from "./errorHandler";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../utils/cloudinary";
import path from "path";
import fs from "fs";

export const uploadToCloudinary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (
        !req.files ||
        !(req.files instanceof Array) ||
        req.files.length === 0
      ) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const images = [];

      for (const file of req.files as Express.Multer.File[]) {
        const filePath = path.resolve(file.path);

        const result = await cloudinary.uploader.upload(filePath, {
          folder: "product-images",
        });

        images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });

        // Delete the temp file after uploading
        fs.unlinkSync(filePath);
      }

      // Attach uploaded images to req.body.images for controller
      req.body.images = images;

      next();
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return res
        .status(500)
        .json({ message: "Cloudinary upload failed", error });
    }
  }
);
