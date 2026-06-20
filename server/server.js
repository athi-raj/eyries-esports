require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const contentRoutes = require("./routes/content");
const usersRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", usersRoutes);

// Serve the frontend (everything in /public) as static files
app.use(express.static(path.join(__dirname, "..", "public")));

// Any non-API route falls back to index.html (single-page app behavior)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const PORT = process.env.PORT || 4000;

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error(
      "\n❌ MONGODB_URI is not set.\n" +
      "   Copy .env.example to .env and fill in your real MongoDB connection string.\n"
    );
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error(
      "\n❌ JWT_SECRET is not set.\n" +
      "   Copy .env.example to .env and fill in a random secret string.\n"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`✅ Eyries Esports server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
}

start();