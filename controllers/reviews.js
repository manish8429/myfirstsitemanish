const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyreview = async (req, res) => {
  try {
    let { id, reviewId } = req.params;

    // Check if the listing exists
    const listing = await Listing.findById(id);
    if (!listing) {
      console.error("Listing not found");
      return res.status(404).send("Listing not found");
    }

    // Check if the review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      console.error("Review not found");
      return res.status(404).send("Review not found");
    }

    // If both listing and review exist, proceed with deletion
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).send("Failed to delete review");
  }
};