import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetails,
  fetchProductReviews,
  submitReview,
  toggleReviewHelpful,
  deleteReview,
} from "../store/slices/productSlice";
import { addToCart } from "../store/slices/cartSlice";
import Navbar from "../components/Navbar";
import {
  Loader2,
  ShoppingCart,
  Star,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
  Check,
  MessageSquare,
  ThumbsUp,
  Trash2,
} from "lucide-react";

// review-এর তারিখ relative format এ দেখানো
const formatReviewDate = (d) => {
  if (!d) return "";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, detailsLoading, error } = useSelector(
    (state) => state.product,
  );
  const {
    reviews: productReviews,
    reviewsLoading,
    reviewSummary,
    reviewSubmitting,
    reviewError,
    reviewMessage,
  } = useSelector((state) => state.product);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  // Review write form — আগে থেকে review থাকলে prefill হয়ে update হবে
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    hoverRating: 0,
    title: "",
    comment: "",
  });
  const [reviewFormError, setReviewFormError] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchProductReviews(id));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, dispatch]);

  useEffect(() => {
    if (addedToCart) {
      const timer = setTimeout(() => setAddedToCart(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [addedToCart]);

  // এই user-এর আগের review আছে কিনা (update mode)
  // NOTE: এটা ও নিচের useEffect অবশ্যই early return এর আগে থাকতে হবে —
  // নাহলে "Rendered more hooks than during the previous render" error হয়
  const myReview = isAuthenticated
    ? productReviews.find(
        (r) =>
          String(r.userId?._id || r.userId) === String(user?._id),
      )
    : null;

  // নিজের আগের review থাকলে form এ prefill করা (edit mode)
  useEffect(() => {
    if (myReview) {
      setReviewForm({
        rating: myReview.rating,
        hoverRating: 0,
        title: myReview.title || "",
        comment: myReview.comment || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myReview?._id]);

  if (detailsLoading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 size={40} className="animate-spin text-violet-500" />
          <p className="mt-4 text-sm text-zinc-500">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#050507] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40">
          <h3 className="text-lg font-semibold text-white">
            Product not found
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <Link
            to="/"
            className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:opacity-90"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    price,
    discount,
    thumbnil,
    photos = [],
    category,
    subCategory,
    description,
    notes,
    delivary,
    paymentMethod,
    searchTags = [],
    rating: productRating = 0,
    numReviews = 0,
  } = product;

  const allImages = [thumbnil, ...photos].filter(Boolean);
  const discountedPrice = discount ? price - (price * discount) / 100 : price;

  // Live review summary থাকলে সেটাই দেখাবে, নাহলে product doc-এর cached value
  const rating = reviewSummary.numReviews > 0 ? reviewSummary.rating : productRating;
  const totalReviews = reviewSummary.numReviews || numReviews;
  const breakdown = reviewSummary.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // এই user-এর আগের review আছে কিনা (update mode) — myReview উপরে হিসাব হয়েছে
  const hasVotedHelpful = (review) =>
    isAuthenticated &&
    (review.helpfulBy || []).some(
      (v) => String(v?._id || v) === String(user?._id),
    );

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewFormError("");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!reviewForm.rating) {
      setReviewFormError("Please select a star rating");
      return;
    }
    if (reviewForm.comment.trim().length < 3) {
      setReviewFormError("Review comment must be at least 3 characters");
      return;
    }
    try {
      await dispatch(
        submitReview({
          productId: id,
          rating: reviewForm.rating,
          title: reviewForm.title.trim(),
          comment: reviewForm.comment.trim(),
        }),
      ).unwrap();
      setReviewForm({ rating: 0, hoverRating: 0, title: "", comment: "" });
    } catch {
      // error redux state-এ চলে যায়
    }
  };

  const handleHelpful = (reviewId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(toggleReviewHelpful(reviewId));
  };

  const handleDeleteMyReview = (reviewId) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      dispatch(deleteReview(reviewId));
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    setAddedToCart(true);
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity }));
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-violet-600/10 blur-[120px]" />
        <div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-indigo-600/10 blur-[120px]"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative">
        <Navbar />

        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
            <Link to="/" className="transition-colors hover:text-violet-400">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link to="/" className="transition-colors hover:text-violet-400">
              {category || "Products"}
            </Link>
            {subCategory && (
              <>
                <ChevronRight size={14} />
                <span className="text-zinc-400">{subCategory}</span>
              </>
            )}
          </nav>

          {/* Product Main */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Image Gallery */}
            <div>
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0d0d12]">
                {allImages[activeImage] ? (
                  <img
                    src={allImages[activeImage]}
                    alt={title}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
                    <span className="text-6xl">🛍️</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="absolute left-4 top-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30">
                    -{discount}%
                  </div>
                )}

                <button
                  onClick={() => setLiked(!liked)}
                  className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
                    liked
                      ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/30"
                      : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
                  }`}
                >
                  <Heart size={20} fill={liked ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        activeImage === index
                          ? "border-violet-500 shadow-lg shadow-violet-500/20"
                          : "border-white/[0.06] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${title} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Category */}
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                  {category || "General"}
                </span>
                {subCategory && (
                  <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-400">
                    {subCategory}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {title}
              </h1>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-700"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-white">
                  {rating}
                </span>
                <span className="text-sm text-zinc-500">
                  ({totalReviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white">
                  ${discountedPrice.toFixed(2)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-xl text-zinc-500 line-through">
                      ${price.toFixed(2)}
                    </span>
                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                      Save ${(price - discountedPrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Features */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0d0d12] p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Delivery</p>
                    <p className="text-[11px] text-zinc-500">
                      {delivary ? `$${delivary}` : "Free"} shipping
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0d0d12] p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Secure</p>
                    <p className="text-[11px] text-zinc-500">
                      Payment protected
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0d0d12] p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Returns</p>
                    <p className="text-[11px] text-zinc-500">7-day returns</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              {paymentMethod && (
                <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0d0d12] p-3.5">
                  <p className="text-xs font-semibold text-white">
                    Payment Methods
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {paymentMethod}
                  </p>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Quantity */}
                <div className="flex h-[52px] items-center rounded-xl border border-white/[0.08] bg-[#0d0d12]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-full w-12 items-center justify-center text-zinc-400 transition-colors hover:text-violet-400"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-full w-12 items-center justify-center text-zinc-400 transition-colors hover:text-violet-400"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    addedToCart
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-violet-600/40"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Add to Cart
                    </>
                  )}
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  className="h-[52px] rounded-xl border border-violet-500/30 bg-violet-500/10 px-8 text-sm font-bold text-violet-300 transition-all duration-300 hover:bg-violet-500/20"
                >
                  Buy Now
                </button>
              </div>

              {/* Search Tags */}
              {searchTags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {searchTags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-xs text-zinc-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16">
            <div className="flex gap-1 border-b border-white/[0.06]">
              {["description", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-3 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "text-violet-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab === "description"
                    ? "Description"
                    : `Reviews (${totalReviews})`}
                  {activeTab === tab && (
                    <div className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="py-8">
              {activeTab === "description" ? (
                <div className="max-w-3xl">
                  <h3 className="text-lg font-semibold text-white">
                    Product Description
                  </h3>
                  {/* Description */}
                  <p className="mt-6 leading-7 text-zinc-400 whitespace-pre-wrap">
                    {description ||
                      notes ||
                      "This premium product is crafted with the highest quality materials and attention to detail. Perfect for everyday use and designed to last."}
                  </p>
                  {notes && (
                    <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#0d0d12] p-5">
                      <h4 className="text-sm font-semibold text-white">
                        Additional Notes
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
                  {/* Reviews List */}
                  <div className="space-y-6">
                    {/* Rating Summary */}
                    {totalReviews > 0 && (
                      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d12] p-6">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="text-center">
                            <p className="text-4xl font-bold text-white">
                              {rating}
                            </p>
                            <div className="mt-1 flex items-center justify-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={13}
                                  className={
                                    i < Math.round(rating)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-zinc-700"
                                  }
                                />
                              ))}
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                              {totalReviews} review
                              {totalReviews !== 1 ? "s" : ""}
                            </p>
                          </div>
                          {/* Rating breakdown bars */}
                          <div className="flex-1 space-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = breakdown[star] || 0;
                              const pct =
                                totalReviews > 0
                                  ? Math.round((count / totalReviews) * 100)
                                  : 0;
                              return (
                                <div
                                  key={star}
                                  className="flex items-center gap-2 text-xs text-zinc-500"
                                >
                                  <span className="w-3">{star}</span>
                                  <Star
                                    size={11}
                                    className="fill-amber-400 text-amber-400"
                                  />
                                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400 transition-all duration-300"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-7 text-right">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {reviewsLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2
                          size={28}
                          className="animate-spin text-violet-500"
                        />
                      </div>
                    ) : productReviews.length === 0 ? (
                      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d12] p-10 text-center">
                        <MessageSquare
                          size={28}
                          className="mx-auto text-zinc-600"
                        />
                        <p className="mt-3 text-sm text-zinc-500">
                          No reviews yet. Be the first to share your feedback!
                        </p>
                      </div>
                    ) : (
                      <>
                        {productReviews.map((review) => {
                          const reviewer = review.userId || {};
                          const reviewerInitial = (reviewer.name || "U")
                            .trim()
                            .charAt(0)
                            .toUpperCase();
                          const voted = hasVotedHelpful(review);
                          return (
                            <div
                              key={review._id}
                              className="rounded-2xl border border-white/[0.06] bg-[#0d0d12] p-6"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  {reviewer.avatar ? (
                                    <img
                                      src={reviewer.avatar}
                                      alt={reviewer.name}
                                      className="h-11 w-11 rounded-full object-cover ring-2 ring-violet-500/40"
                                    />
                                  ) : (
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
                                      {reviewerInitial}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold text-white">
                                        {reviewer.name || "User"}
                                      </p>
                                      {review.verifiedPurchase && (
                                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                          <Check size={9} />
                                          Verified Purchase
                                        </span>
                                      )}
                                      {myReview?._id === review._id && (
                                        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                      {formatReviewDate(review.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={
                                        i < review.rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-zinc-700"
                                      }
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.title && (
                                <h4 className="mt-4 text-sm font-semibold text-white">
                                  {review.title}
                                </h4>
                              )}
                              <p className="mt-2 text-sm leading-6 text-zinc-400">
                                {review.comment}
                              </p>
                              <div className="mt-4 flex items-center gap-4">
                                <button
                                  onClick={() => handleHelpful(review._id)}
                                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                                    voted
                                      ? "text-violet-400"
                                      : "text-zinc-500 hover:text-violet-400"
                                  }`}
                                >
                                  <ThumbsUp
                                    size={13}
                                    className={voted ? "fill-violet-400/30" : ""}
                                  />
                                  Helpful ({review.helpful || 0})
                                </button>
                                {myReview?._id === review._id && (
                                  <button
                                    onClick={() =>
                                      handleDeleteMyReview(review._id)
                                    }
                                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-red-400"
                                  >
                                    <Trash2 size={13} />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Write Review */}
                  <div className="h-fit rounded-2xl border border-white/[0.06] bg-[#0d0d12] p-6">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={18} className="text-violet-400" />
                      <h3 className="text-sm font-semibold text-white">
                        {myReview ? "Update Your Review" : "Write a Review"}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      {isAuthenticated
                        ? "Share your experience with this product"
                        : "Please log in to share your feedback"}
                    </p>

                    {isAuthenticated ? (
                      <form onSubmit={handleReviewSubmit}>
                        {/* Interactive star rating */}
                        <div className="mt-4 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setReviewForm((p) => ({ ...p, rating: star }))
                              }
                              onMouseEnter={() =>
                                setReviewForm((p) => ({ ...p, hoverRating: star }))
                              }
                              onMouseLeave={() =>
                                setReviewForm((p) => ({ ...p, hoverRating: 0 }))
                              }
                              className="transition-transform hover:scale-110"
                              aria-label={`${star} star`}
                            >
                              <Star
                                size={22}
                                className={
                                  star <=
                                  (reviewForm.hoverRating || reviewForm.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-zinc-700"
                                }
                              />
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) =>
                            setReviewForm((p) => ({ ...p, title: e.target.value }))
                          }
                          placeholder="Review title (optional)"
                          maxLength={100}
                          className="mt-4 w-full rounded-xl border border-white/[0.08] bg-[#0f0f14] px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
                        />
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm((p) => ({
                              ...p,
                              comment: e.target.value,
                            }))
                          }
                          placeholder="Write your review..."
                          maxLength={1000}
                          className="mt-3 h-28 w-full resize-none rounded-xl border border-white/[0.08] bg-[#0f0f14] p-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
                        />
                        <p className="mt-1 text-right text-[11px] text-zinc-600">
                          {reviewForm.comment.length}/1000
                        </p>

                        {(reviewFormError || reviewError) && (
                          <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                            {reviewFormError || reviewError}
                          </p>
                        )}
                        {reviewMessage && !reviewError && (
                          <p className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                            {reviewMessage}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reviewSubmitting && (
                            <Loader2 size={15} className="animate-spin" />
                          )}
                          {reviewSubmitting
                            ? "Submitting..."
                            : myReview
                              ? "Update Review"
                              : "Submit Review"}
                        </button>
                      </form>
                    ) : (
                      <Link
                        to="/login"
                        className="mt-4 block w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:opacity-90"
                      >
                        Log in to Review
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductDetails;
