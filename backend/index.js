require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { globalLimiter } = require("./middleware/rateLimit");
const generateRouter = require("./routes/generate");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: "*" })); // Lock down to your app domain in production
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(globalLimiter);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", ts: Date.now() }));

// Routes
app.use("/api/generate", generateRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
