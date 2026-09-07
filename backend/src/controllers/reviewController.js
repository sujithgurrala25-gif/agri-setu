const Review = require("../models/Review");
const FarmerProfile = require("../models/FarmerProfile");

async function createReview(req, res, next) {
  try {
    const review = await Review.create({
      reviewer: req.user._id,
      farmer: req.body.farmer,
      product: req.body.product,
      order: req.body.order,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    const agg = await Review.aggregate([
      { $match: { farmer: review.farmer } },
      { $group: { _id: "$farmer", avg: { $avg: "$rating" }, n: { $sum: 1 } } },
    ]);
    if (agg[0]) {
      await FarmerProfile.updateOne(
        { user: review.farmer },
        { rating: Math.round(agg[0].avg * 10) / 10, reviewCount: agg[0].n }
      );
    }
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

async function listReviews(req, res, next) {
  try {
    const filter = {};
    if (req.query.farmer) filter.farmer = req.query.farmer;
    if (req.query.product) filter.product = req.query.product;
    const reviews = await Review.find(filter).populate("reviewer", "name").sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReview, listReviews };
