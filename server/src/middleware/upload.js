const multer = require("multer");
const path = require("path");

// Save to local 'uploads/' before pushing to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG/PNG files are allowed"), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
