import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    author: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String,
      trim: true 
    },
    price: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0 
    },
    countInStock: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0 
    },
    image: { 
      type: String, 
      default: "/images/sample.jpg" 
    },
    category: { 
      type: String, 
      required: true,
      trim: true 
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    releaseDate: {
      type: Date,
      default: Date.now
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 }
      }
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Add to your existing schema
    purchases: {
      type: Number,
      default: 0
    },
    lastPurchased: {
      type: Date
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
  }
);

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', category: 'text' });
bookSchema.index({ salesCount: -1 });
bookSchema.index({ releaseDate: -1 });

// Virtual for formatted release date
bookSchema.virtual('formattedReleaseDate').get(function() {
  return this.releaseDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const Book = mongoose.model("Book", bookSchema);

export default Book;