const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 generations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Generation rate limit exceeded. Please wait a moment." },
});

module.exports = { globalLimiter, generateLimiter };
