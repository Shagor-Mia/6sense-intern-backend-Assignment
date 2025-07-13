export interface ICategory {
  _id: string;
  name: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  image: string; // Changed from 'image' to 'images'
  status: "In Stock" | "Stock Out";
  productCode: string;
  category: ICategory["_id"];
  finalPrice: number;
}
