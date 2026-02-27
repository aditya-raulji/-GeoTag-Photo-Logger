const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/entries", require("./routes/entries"));

const PORT = Number(process.env.PORT) || 5000;

fs.mkdirSync("uploads", { recursive: true });

function normalizeMongoUri(uri) {
  if (!uri || typeof uri !== "string") return uri;
  // If Atlas URI has no db name, default to "geotag"
  const atlasHost = ".mongodb.net/";
  if (uri.includes(atlasHost)) {
    const afterHost = uri.split(atlasHost)[1] || "";
    const pathStart = afterHost.indexOf("/");
    if (pathStart >= 0) {
      const pathAndQuery = afterHost.slice(pathStart); // "/..." possibly with ?query
      const pathOnly = pathAndQuery.split("?")[0];
      if (pathOnly === "/") {
        const base = uri.split("?")[0].replace(/\/$/, "");
        const query = uri.includes("?") ? "?" + uri.split("?").slice(1).join("?") : "";
        return `${base}/geotag${query}`;
      }
    }
  }
  return uri;
}

const mongoUri = normalizeMongoUri(process.env.MONGO_URI);
console.log("Connecting to MongoDB...");

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  })
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.error(
      "Tip: If using MongoDB Atlas, ensure Network Access allows your IP, and MONGO_URI contains a database name (e.g. ...mongodb.net/geotag)"
    );
    process.exit(1);
  });