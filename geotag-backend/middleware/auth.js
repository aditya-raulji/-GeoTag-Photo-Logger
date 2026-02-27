const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const raw = req.header("Authorization");

  if (!raw) return res.status(401).json({ msg: "No token" });

  const token = raw.startsWith("Bearer ") ? raw.slice("Bearer ".length) : raw;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};