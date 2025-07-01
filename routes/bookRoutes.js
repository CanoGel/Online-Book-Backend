import express from "express";
import multer from "multer";
import path from "path";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getNewReleases,
  getBestSellers
} from "../controllers/bookController.js";

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const upload = multer({ storage, fileFilter });

// Public routes
router.get("/", getBooks);
router.get("/new-releases", getNewReleases);
router.get("/best-sellers", getBestSellers);
router.get("/:id", getBookById);

// Protected admin routes
router.post("/", protect, admin, upload.single("image"), createBook);
router.put("/:id", protect, admin, upload.single("image"), updateBook);
router.delete("/:id", protect, admin, deleteBook);

export default router;