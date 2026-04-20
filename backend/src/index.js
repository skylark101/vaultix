require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const assetRoutes = require("./routes/assetRoutes");

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // your Vercel frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", app: "Vaultix" }),
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`Vaultix backend running on port ${PORT}`));
