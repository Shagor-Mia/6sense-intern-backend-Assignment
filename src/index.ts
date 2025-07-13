import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import dbConnection from "./database/connect";
import { errorHandler } from "./middlewares/errorHandler";
import categoryRoutes from "./routes/category.route";
import productRoutes from "./routes/product.route";

const app = express();
const port = 4000;

// Connect to database
dbConnection();

// Middlewares
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Global error handler — must come after routes
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
