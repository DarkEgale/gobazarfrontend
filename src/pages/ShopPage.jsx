import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchTrendingProducts,
} from "../store/slices/productSlice";
import Navbar from "../components/Navbar";
import { getWish } from "../store/slices/wishSlice";
import FilterBar from "../components/FilterBar";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import {
  Loader2,
  PackageOpen,
  SearchX,
  Sparkles,
  Flame,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  BadgePercent,
  Gift,
  Zap,
  Clock,
} from "lucide-react";

const DEFAULT_FILTERS = {
  category: "all",
  subCategory: "all",
  brand: "all",
  minPrice: "",
  maxPrice: "",
};

const ShopPage = () => {
  const dispatch = useDispatch();
  const {
    products,
    loading,
    error,
    totalProducts,
    totalPages,
    trendingProducts,
    trendingLoading,
  } = useSelector((state) => state.product);
  const { wishList } = useSelector((state) => state.wish);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const allProductsRef = useRef(null);

  useEffect(() => {
    dispatch(getWish());
    dispatch(fetchTrendingProducts());
  }, []);

  // Fetch products when filters, search, or page changes
  useEffect(() => {
    const params = { page: currentPage, limit: 12 };

    if (filters.category !== "all") params.category = filters.category;
    if (filters.subCategory !== "all") params.subCategory = filters.subCategory;
    if (filters.brand !== "all") params.brand = filters.brand;
    if (filters.minPrice !== "") params.minPrice = filters.minPrice;
    if (filters.maxPrice !== "") params.maxPrice = filters.maxPrice;
    if (searchTerm) params.search = searchTerm;

    dispatch(fetchProducts(params));
  }, [dispatch, filters, searchTerm, currentPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    scrollToAllProducts();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToAllProducts = () =>
    allProductsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Products theke highest discount ber kora (discount banner e dynamic dekhabe)
  const maxDiscount = trendingProducts.reduce(
    (max, p) => Math.max(max, p?.discount || 0),
    0,
  );

  const navigate = useNavigate();

  // ---------- Hero image slider ----------
  // Trending product er thumbnail gulo diye hero slider banano
  const heroSlides = trendingProducts.filter((p) => p?.thumbnil).slice(0, 5);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = setInterval(
      () => setHeroSlide((s) => (s + 1) % heroSlides.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // ---------- Trending slideshow ----------
  const TRENDING_PER_SLIDE = 8;
  const trendingChunks = [];
  for (let i = 0; i < trendingProducts.length; i += TRENDING_PER_SLIDE) {
    trendingChunks.push(trendingProducts.slice(i, i + TRENDING_PER_SLIDE));
  }
  const trendingPages = Math.max(1, trendingChunks.length);
  const [trendingPage, setTrendingPage] = useState(0);

  useEffect(() => {
    if (trendingPages < 2) return;
    const timer = setInterval(
      () => setTrendingPage((p) => (p + 1) % trendingPages),
      6000,
    );
    return () => clearInterval(timer);
  }, [trendingPages]);

  const goHero = (dir) =>
    setHeroSlide(
      (s) => (s + dir + heroSlides.length) % Math.max(1, heroSlides.length),
    );

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

      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative">
        <Navbar onSearch={handleSearch} />

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 lg:px-12">
          {/* ================= HERO IMAGE SLIDER (max 500px) ================= */}
          <section className="relative h-[400px] max-h-[500px] overflow-hidden rounded-3xl border border-white/[0.08] shadow-2xl shadow-violet-900/30 sm:h-[500px]">
            {heroSlides.length > 0 ? (
              <>
                {heroSlides.map((product, i) => (
                  <div
                    key={product._id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                      i === heroSlide ? "z-10 opacity-100" : "z-0 opacity-0"
                    }`}
                  >
                    <img
                      src={product.thumbnil}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                    {/* Readable text er jonno gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/95 via-[#0b0b14]/65 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507]/85 via-transparent to-[#050507]/25" />

                    <div className="absolute inset-0 flex flex-col justify-center gap-4 px-6 sm:px-12">
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-200 backdrop-blur-md sm:text-xs">
                        <Sparkles size={13} />
                        {product.discount > 0
                          ? `${product.discount}% Off Today`
                          : "Featured Product"}
                      </span>

                      <h2 className="max-w-xl text-2xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                        {product.title}
                      </h2>

                      <p className="text-sm text-zinc-300 sm:text-base">
                        Premium quality · Best price · Free delivery over $50
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-violet-500/50 active:scale-95"
                        >
                          Shop Now
                          <ArrowRight size={16} />
                        </button>

                        {product.discount > 0 && (
                          <span className="text-xl font-black text-amber-300 drop-shadow sm:text-2xl">
                            UP TO {product.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Prev / Next arrows */}
                {heroSlides.length > 1 && (
                  <>
                    <button
                      onClick={() => goHero(-1)}
                      className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 active:scale-90"
                      aria-label="Previous slide"
                    >
                      <ArrowRight size={18} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => goHero(1)}
                      className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 active:scale-90"
                      aria-label="Next slide"
                    >
                      <ArrowRight size={18} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                      {heroSlides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHeroSlide(i)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            i === heroSlide
                              ? "w-7 bg-gradient-to-r from-violet-400 to-fuchsia-400"
                              : "w-2 bg-white/40 hover:bg-white/60"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (

              /* Fallback gradient banner (product image na thakle) */
              <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700 via-indigo-700 to-fuchsia-700">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-3xl" />

                <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                    <Sparkles size={13} />
                    Limited Time Offer
                  </span>
                  <h2 className="max-w-xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                    First Purchase Offer —{" "}
                    <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                      Extra 10% OFF
                    </span>
                  </h2>
                  <p className="max-w-md text-sm text-white/80 sm:text-base">
                    Sign up and grab an exclusive discount on your very first
                    order.
                  </p>
                  <button
                    onClick={scrollToAllProducts}
                    className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-700 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                  >
                    Shop Now
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ================= TRUST BADGES ================= */}
          <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Truck, title: "Free Delivery", sub: "On orders over $50" },
              { icon: ShieldCheck, title: "Secure Payment", sub: "100% protected" },
              { icon: RotateCcw, title: "Easy Returns", sub: "7-day return policy" },
              { icon: Headphones, title: "24/7 Support", sub: "Dedicated service" },
            ].map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0d0d12] px-4 py-3.5 transition-colors hover:border-violet-500/25"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 text-violet-400">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white sm:text-sm">{title}</p>
                  <p className="truncate text-[11px] text-zinc-500">{sub}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ================= TRENDING PRODUCTS ================= */}
          <section className="mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/30">
                  <Flame size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    Trending{" "}
                    <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      Products
                    </span>
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
                    Best sellers everyone is loving right now
                  </p>
                </div>
              </div>

              <button
                onClick={scrollToAllProducts}
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-300 transition-all duration-200 hover:bg-violet-500/20 sm:text-sm"
              >
                View All
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>

            {/* Fixed 500px slideshow container (width 100%) */}
            {trendingLoading ? (
              <div className="grid h-[500px] max-h-[500px] w-full grid-cols-2 place-items-center gap-3 rounded-3xl border border-white/[0.06] bg-[#0d0d12] px-4 py-6 sm:grid-cols-4 sm:px-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-[150px] sm:w-[180px]">
                    <div className="aspect-square animate-pulse rounded-2xl bg-white/[0.05]" />
                    <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-white/[0.05]" />
                  </div>
                ))}
              </div>
            ) : trendingProducts.length > 0 ? (
              <div className="relative h-[500px] max-h-[500px] w-full overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0d0d12]">
                {/* Slides */}
                <div
                  className="flex h-full transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${trendingPage * 100}%)` }}
                >
                  {trendingChunks.map((chunk, i) => (
                    <div
                      key={i}
                      className="grid h-full w-full shrink-0 grid-cols-2 place-items-center gap-3 px-4 py-6 sm:grid-cols-4 sm:gap-5 sm:px-8"
                    >
                      {chunk.map((product) => (
                        <div key={product._id} className="w-[150px] sm:w-[180px]">
                          <ProductCard product={product} compact />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Prev / Next */}
                {trendingPages > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setTrendingPage(
                          (p) => (p - 1 + trendingPages) % trendingPages,
                        )
                      }
                      className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-90"
                      aria-label="Previous products"
                    >
                      <ArrowRight size={18} className="rotate-180" />
                    </button>
                    <button
                      onClick={() =>
                        setTrendingPage((p) => (p + 1) % trendingPages)
                      }
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-90"
                      aria-label="Next products"
                    >
                      <ArrowRight size={18} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
                      {[...Array(trendingPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setTrendingPage(i)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            i === trendingPage
                              ? "w-7 bg-gradient-to-r from-violet-400 to-fuchsia-400"
                              : "w-2 bg-white/30 hover:bg-white/50"
                          }`}
                          aria-label={`Go to page ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </section>

          {/* ================= UP TO 30% DISCOUNT BANNER ================= */}
          <section className="relative mt-12 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-2xl shadow-orange-900/30">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.25),transparent_50%)]" />
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full border-[3px] border-dashed border-white/25" />

            <div className="relative flex flex-col items-start gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
              <div className="flex items-center gap-5">
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm sm:flex">
                  <BadgePercent size={32} className="text-white" />
                </div>
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/85">
                    <Clock size={13} />
                    Mega Discount Week
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-4xl">
                    UP TO{" "}
                    <span className="rounded-xl bg-white/20 px-3 py-0.5 backdrop-blur-sm">
                      {maxDiscount > 0 ? maxDiscount : 30}% OFF
                    </span>
                  </h3>
                  <p className="mt-1.5 text-sm text-white/85">
                    On selected products — grab yours before the offer ends!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white">
                  Limited Stock
                </span>
                <button
                  onClick={scrollToAllProducts}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-600 shadow-lg shadow-black/15 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                >
                  Grab The Deal
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>

          {/* ================= ALL PRODUCTS ================= */}
          <section ref={allProductsRef} className="mt-12 scroll-mt-24">
            {/* Heading + filter chips */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {searchTerm ? (
                    <>
                      Results for{" "}
                      <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        "{searchTerm}"
                      </span>
                    </>
                  ) : (
                    <>
                      Explore{" "}
                      <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        All Products
                      </span>
                    </>
                  )}
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {loading
                    ? "Loading products..."
                    : `${totalProducts} product${totalProducts !== 1 ? "s" : ""} found`}
                </p>
              </div>

              {(filters.category !== "all" ||
                filters.subCategory !== "all" ||
                filters.brand !== "all" ||
                filters.minPrice !== "" ||
                filters.maxPrice !== "") && (
                <div className="flex flex-wrap items-center gap-2">
                  {filters.category !== "all" && (
                    <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                      {filters.category}
                    </span>
                  )}
                  {filters.subCategory !== "all" && (
                    <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                      {filters.subCategory}
                    </span>
                  )}
                  {filters.brand !== "all" && (
                    <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                      {filters.brand}
                    </span>
                  )}
                  {(filters.minPrice !== "" || filters.maxPrice !== "") && (
                    <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                      ${filters.minPrice || "0"} - ${filters.maxPrice || "∞"}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Filters */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClearFilters}
            />

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 size={40} className="animate-spin text-violet-500" />
                <p className="mt-4 text-sm text-zinc-500">Loading products...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-32">
                <SearchX size={48} className="text-rose-500" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  Something went wrong
                </h3>
                <p className="mt-2 text-sm text-zinc-500">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <PackageOpen size={48} className="text-zinc-600" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  No products found
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:opacity-90"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-12 border-t border-white/[0.06] pt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ShopPage;