import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import usersRouter from "./routes/users";
import metricsRouter from "./metrics";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/metrics", metricsRouter);

// Serve frontend
app.use(express.static(path.join(__dirname, "../dist")));
app.get(/^(?!\/api).*$/, (_req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
