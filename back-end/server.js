// Modified

import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle port-in-use error gracefully
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n❌ Port ${PORT} is already in use. You likely have another server instance running.\n`
    );
    console.error("Options:");
    console.error(`  1. Kill the existing process: lsof -iTCP:${PORT} -sTCP:LISTEN -n -P`);
    console.error(`  2. Use a different port: PORT=8001 npm start`);
    console.error(`  3. Or run: lsof -ti:${PORT} | xargs kill -9\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

export default app;
