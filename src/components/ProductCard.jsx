import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { createWish } from "../store/slices/wishSlice";
import { ShoppingCart, Star, Heart, Eye } from "lucide-react";

const ProductCard = ({ product, compact = false }) => {
  const dispatch = useDispatch();

  const { wishlist } = useSelector((state) => state.wish);

  if (!product) return null;

  const {
    _id,
    title,
    price,
    discount,
    thumbnil,
    category,
    subCategory,
    notes,
    rating = 0,
    numReviews: reviews = 0,
  } = product;

  // Check whether this product already exists in wishlist
  const isLiked = wishlist.some(
    (item) => item.productId?.toString() === product._id?.toString(),
  );

  // Calculate discounted price
  const discountedPrice = discount ? price - (price * discount) / 100 : price;

  // Add product to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToCart(product));
  };

  // Add product to wishlist
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(createWish(product._id));
  };

  return (
    <Link
      to={`/product/${_id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d12] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/10"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#111116]">
        {thumbnil ? (
          <img
            src={thumbnil}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
            <span className="text-4xl">🛍️</span>
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute left-3 top-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-violet-600/30">
            -{discount}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isLiked
              ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/30"
              : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
          }`}
          title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
        </button>

        {/* Quick View */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white">
            <Eye size={14} />
            Quick View
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col ${compact ? "p-2.5" : "p-4"}`}>
        {/* Category */}
        <div className={`mb-1.5 flex items-center gap-2 ${compact ? "hidden" : ""}`}>
          <span className="text-[11px] font-medium uppercase tracking-wider text-violet-400">
            {category || "General"}
          </span>

          {subCategory && (
            <>
              <span className="text-zinc-700">•</span>

              <span className="text-[11px] text-zinc-500">{subCategory}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          className={`mb-2 line-clamp-2 font-semibold leading-snug text-white transition-colors group-hover:text-violet-300 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {title}
        </h3>

        {/* Rating */}
        {!compact && (
          <div className="mb-3 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.floor(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-700"
                  }
                />
              ))}
            </div>

            <span className="text-[11px] text-zinc-500">
              {rating} ({reviews || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-bold text-white ${
                  compact ? "text-sm" : "text-lg"
                }`}
              >
                ${discountedPrice.toFixed(2)}
              </span>

              {discount > 0 && (
                <span className="text-xs text-zinc-500 line-through">
                  ${price.toFixed(2)}
                </span>
              )}
            </div>

            {notes && !compact && (
              <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">
                {notes}
              </p>
            )}
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 transition-all duration-300 hover:scale-110 hover:shadow-violet-600/40 active:scale-95 ${
              compact ? "h-7 w-7" : "h-9 w-9"
            }`}
            title="Add to cart"
          >
            <ShoppingCart size={compact ? 13 : 16} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
