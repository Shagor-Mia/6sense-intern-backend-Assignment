import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "../types";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discount: number;
  images: string[]; // Changed from 'image' to 'images' (array of URLs)
  status: "In Stock" | "Stock Out";
  productCode: string;
  category: ICategory["_id"];
  finalPrice: number; // Virtual field
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, max: 100, default: 0 },
    images: [{ type: String, required: true }], // Changed to array of strings
    status: { type: String, enum: ["In Stock", "Stock Out"], required: true },
    productCode: { type: String, required: true, unique: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // Calculate finalPrice only if price is a number
        ret.finalPrice =
          typeof ret.price === "number"
            ? ret.price * (1 - ret.discount / 100)
            : 0;
        delete ret.__v; // Optionally remove the __v field
        return ret;
      },
    },
    toObject: { virtuals: true }, // Ensure virtuals are included when converting to object
  }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
