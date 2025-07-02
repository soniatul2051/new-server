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

// Essential middleware should come first
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

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

// Error handling middleware (recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Server has started on http://localhost:${PORT}`.white.bgYellow.bold
  );
});