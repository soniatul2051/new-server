import express from "express";
import dotenv from "dotenv";
import color from "colors";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./src/Config/db.js";
import route from "./src/Routes/UserRoutes.js";
import startArticleScheduler from "./src/scheduler.js";

const PORT = process.env.PORT || 5000;
dotenv.config();

connectDB();

const app = express();

// Configure CORS based on environment
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://alishempiresalon.com",
      "https://www.alishempiresalon.com",
      "https://admin.alishempiresalon.com",
      "http://localhost:5174",
      "http://localhost:5173"
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Essential middleware
app.use(express.json());
app.use(cors(corsOptions));

// Logging middleware
if (process.env.ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api", route);

// Start the article scheduler after DB connection is established
startArticleScheduler();

// Root route
app.get("/", (req, res) => {
  res.send(
    `${process.env.APP_NAME || "Test APP"} API is Working on ${
      process.env.ENV
    }.....`
  );
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy: Request not allowed" });
  }
  
  res.status(500).json({ 
    error: 'Something broke!',
    message: err.message,
    stack: process.env.ENV === "development" ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Server has started on http://localhost:${PORT}`.white.bgYellow.bold
  );
});