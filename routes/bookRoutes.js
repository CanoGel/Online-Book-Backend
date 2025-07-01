// routes/bookRoutes.js
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

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'books'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
  
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
};

// Multer config
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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