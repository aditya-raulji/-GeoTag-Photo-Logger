const router = require("express").Router();
const Entry = require("../models/Entry");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image uploads allowed"));
    cb(null, true);
  },
});

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, latitude, longitude } = req.body;

    if (!req.file) return res.status(400).json({ msg: "Image is required" });
    if (!title) return res.status(400).json({ msg: "Title is required" });

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ msg: "Valid latitude and longitude are required" });
    }

    const base =
      process.env.PUBLIC_BASE_URL ||
      `${req.protocol}://${req.get("host")}`;

    const entry = await Entry.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      latitude: lat,
      longitude: lng,
      imageUrl: `${base}/uploads/${req.file.filename}`,
      user: req.user
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create entry" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(entries);
  } catch {
    res.status(500).json({ msg: "Failed to fetch entries" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: "Entry not found" });

    if (String(entry.user) !== String(req.user)) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    const filename = entry.imageUrl ? entry.imageUrl.split("/uploads/")[1] : null;
    if (filename) {
      const filePath = path.join("uploads", filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await entry.deleteOne();
    res.json({ msg: "Deleted" });
  } catch {
    res.status(500).json({ msg: "Failed to delete entry" });
  }
});

module.exports = router;