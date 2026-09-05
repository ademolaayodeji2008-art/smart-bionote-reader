import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Resolve .env relative to this file so the server can be started
// from any working directory without losing its environment variables.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
};

startServer();
