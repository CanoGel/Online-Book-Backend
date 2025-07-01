import Book from "../models/bookModel.js";
import fs from 'fs';
import path from 'path';
import asyncHandler from 'express-async-handler';

// Helper to delete old image file
const deleteOldImage = (imagePath) => {
  if (imagePath && !imagePath.startsWith('http')) {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({});
  res.json(books);
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  res.json(book);
});

// @desc    Get new releases (published in last 30 days)
// @route   GET /api/books/new-releases
// @access  Public
export const getNewReleases = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const books = await Book.find({
    releaseDate: { $gte: thirtyDaysAgo },
    isPublished: true
  }).sort({ releaseDate: -1 }).limit(20);

  res.json(books);
});

// @desc    Get best sellers (based on sales data)
// @route   GET /api/books/best-sellers
// @access  Public
export const getBestSellers = asyncHandler(async (req, res) => {
  const books = await Book.find({ isPublished: true })
    .sort({ salesCount: -1 })
    .limit(20);

  res.json(books);
});

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
export const createBook = asyncHandler(async (req, res) => {
  const { title, author, description, price, countInStock, category } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }

  const book = new Book({
    title,
    author,
    description,
    price: Number(price),
    countInStock: Number(countInStock),
    image: `/uploads/${req.file.filename}`,
    category,
    user: req.user._id,
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Store old image path for cleanup
  const oldImage = book.image;

  // Update fields
  book.title = req.body.title || book.title;
  book.author = req.body.author || book.author;
  book.description = req.body.description || book.description;
  book.price = Number(req.body.price) || book.price;
  book.countInStock = Number(req.body.countInStock) || book.countInStock;
  book.category = req.body.category || book.category;

  // Update image if new file uploaded
  if (req.file) {
    book.image = `/uploads/${req.file.filename}`;
    // Delete old image file
    deleteOldImage(oldImage);
  }

  const updatedBook = await book.save();
  res.json(updatedBook);
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Delete associated image file
  try {
    deleteOldImage(book.image);
  } catch (err) {
    console.error('Failed to delete image file:', err.message);
    // Don't throw, just log
  }

  await Book.deleteOne({ _id: book._id }); // Use deleteOne instead of remove
  res.json({ message: 'Book deleted successfully' });
});