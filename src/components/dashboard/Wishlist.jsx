import { memo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiHeart,
  FiShoppingBag,
  FiShoppingCart,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";
import { getWish, createWish } from "../../store/slices/wishSlice";
import { addToCart } from "../../store/slices/cartSlice";

const getDiscountedPrice = (product) =>
  product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

const WishItem = memo(({ item, onRemove, onAddToCart }) => {
  const product = item.productId;

  // Product may have been deleted from the DB
  if (!product || !product._id) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 opacity-60">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#111116] text-zinc-600 ring-1 ring-white/[0.08]">
          <FiShoppingBag size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-400">
            Product no longer available
          </p>
          <p className="mt-0.5 text-xs text-zinc-600">This item was removed</p>
        </div>
        <button
          onClick={() => onRemove(item._id)}
          className="shrink-0 rounded-lg p-1.5 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
          aria-label="Remove from wishlist"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    );
  }

  const unitPrice = getDiscountedPrice(product);

  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors hover:border-violet-500/25">
      {/* Product image */}
      <Link
        to={`/product/${product._id}`}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#111116] ring-1 ring-white/[0.08]"
        aria-label={`View ${product.title}`}
      >
        {product.thumbnil ? (
          <img
            src={product.thumbnil}
            alt={product.title || "Product"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FiShoppingBag size={22} className="text-zinc-600" />
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${product._id}`}
              className="block truncate text-sm font-semibold text-white transition-colors hover:text-violet-300"
            >
              {product.title || "Untitled Product"}
            </Link>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-sm font-bold text-white">
                ৳{Number(unitPrice).toFixed(2)}
              </p>
              {product.discount > 0 && (
                <>
                  <p className="text-xs text-zinc-500 line-through">
                    ৳{Number(product.price).toFixed(2)}
                  </p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                    -{product.discount}%
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => onRemove(product._id)}
            className="shrink-0 rounded-lg p-1.5 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Remove ${product.title} from wishlist`}
          >
            <FiTrash2 size={16} />
          </button>
        </div>

        <div className="mt-auto pt-3">
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-violet-600/40 active:translate-y-0"
          >
            <FiShoppingCart size={14} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
});

WishItem.displayName = "WishItem";

const Wishlist = memo(() => {
  const dispatch = useDispatch();
  const { wishlist, loading, error } = useSelector((state) => state.wish);

  useEffect(() => {
    dispatch(getWish());
  }, [dispatch]);

  const handleRemove = (productId) => {
    dispatch(createWish(productId));
  };

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        _id: product._id,
        title: product.title,
        price: product.price,
        discount: product.discount,
        thumbnil: product.thumbnil,
        delivary: product.delivary,
        category: product.category,
        subCategory: product.subCategory,
      })
    );
  };

  return (
    <div className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <FiAlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && wishlist.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex animate-pulse gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
            >
              <div className="h-20 w-20 shrink-0 rounded-xl bg-white/[0.06]" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-1/3 rounded bg-white/[0.06]" />
                <div className="h-3 w-1/4 rounded bg-white/[0.06]" />
                <div className="h-8 w-28 rounded-xl bg-white/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
            <FiHeart size={28} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-white">
            Your wishlist is empty
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Tap the heart icon on any product to save it here
          </p>
        </div>
      ) : (
        <>
          {/* Header count */}
          <p className="text-xs font-medium text-zinc-500">
            {wishlist.length} item{wishlist.length > 1 ? "s" : ""} saved
          </p>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {wishlist.map((item) => (
              <WishItem
                key={item._id}
                item={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

Wishlist.displayName = "Wishlist";

export default Wishlist;