import express from "express";
import usersRouter from "./routes/users";
import cors from "cors";
import dotenv from "dotenv";
// import exampleRouter from "./routes/example";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter)

// Routes
// app.use("/api/example", exampleRouter);

app.get("/", (req, res) => {
  res.send("Express + Vite backend running!");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
