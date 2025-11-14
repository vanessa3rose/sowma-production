import express from "express";
import usersRouter from "./routes/users";
import cors from "cors";
import dotenv from "dotenv";
import metricsRouter from "./metrics"; // Import your metrics route

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);

// Routes
app.use("/api/metrics", metricsRouter); // Mount the metrics route

// Root route
app.get("/", (_req, res) => {
  res.send("Express + Vite backend running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

