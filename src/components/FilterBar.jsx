import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Automotive",
  "Groceries",
  "Other",
];

const SUBCATEGORIES = {
  Electronics: [
    "Phones",
    "Laptops",
    "Audio",
    "Cameras",
    "Accessories",
    "Gaming",
  ],
  Fashion: ["Men", "Women", "Kids", "Shoes", "Accessories", "Bags"],
  "Home & Living": ["Furniture", "Decor", "Kitchen", "Bedding", "Lighting"],
  Beauty: ["Skincare", "Makeup", "Haircare", "Fragrance"],
  Sports: ["Fitness", "Outdoor", "Cycling", "Team Sports"],
  Books: ["Fiction", "Non-Fiction", "Comics", "Textbooks"],
  Toys: ["Action Figures", "Board Games", "Puzzles", "Educational"],
  Automotive: ["Parts", "Accessories", "Tools", "Car Care"],
  Groceries: ["Fresh", "Beverages", "Snacks", "Pantry"],
  Other: ["General", "Miscellaneous"],
};

const BRANDS = [
  "Apple",
  "Samsung",
  "Sony",
  "Nike",
  "Adidas",
  "Zara",
  "H&M",
  "Dell",
  "HP",
  "LG",
  "Bose",
  "Gucci",
];

const FilterBar = ({ filters, onFilterChange, onClear }) => {
  const [showMobile, setShowMobile] = useState(false);

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    onFilterChange(updated);
  };

  const handleClear = () => {
    onClear();
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.subCategory !== "all" ||
    filters.brand !== "all" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "";

  const FilterContent = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-3">
      {/* Category */}
      <div className="relative">
        <select
          value={filters.category}
          onChange={(e) => handleChange("category", e.target.value)}
          className="h-[42px] w-full appearance-none rounded-xl border border-white/[0.08] bg-[#0d0d12] pl-4 pr-10 text-sm text-zinc-300 outline-none transition-all duration-200 hover:border-white/[0.12] focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 lg:w-[160px]"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
      </div>

      {/* Subcategory */}
      <div className="relative">
        <select
          value={filters.subCategory}
          onChange={(e) => handleChange("subCategory", e.target.value)}
          disabled={filters.category === "all"}
          className="h-[42px] w-full appearance-none rounded-xl border border-white/[0.08] bg-[#0d0d12] pl-4 pr-10 text-sm text-zinc-300 outline-none transition-all duration-200 hover:border-white/[0.12] focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-40 lg:w-[160px]"
        >
          <option value="all">All Subcategories</option>
          {(SUBCATEGORIES[filters.category] || []).map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
      </div>

      {/* Brand */}
      <div className="relative">
        <select
          value={filters.brand}
          onChange={(e) => handleChange("brand", e.target.value)}
          className="h-[42px] w-full appearance-none rounded-xl border border-white/[0.08] bg-[#0d0d12] pl-4 pr-10 text-sm text-zinc-300 outline-none transition-all duration-200 hover:border-white/[0.12] focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 lg:w-[140px]"
        >
          <option value="all">All Brands</option>
          {BRANDS.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
      </div>

      {/* Price Range */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min $"
          value={filters.minPrice}
          onChange={(e) => handleChange("minPrice", e.target.value)}
          className="h-[42px] w-[90px] rounded-xl border border-white/[0.08] bg-[#0d0d12] px-3 text-sm text-zinc-300 outline-none transition-all duration-200 placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
        />
        <span className="text-zinc-600">—</span>
        <input
          type="number"
          placeholder="Max $"
          value={filters.maxPrice}
          onChange={(e) => handleChange("maxPrice", e.target.value)}
          className="h-[42px] w-[90px] rounded-xl border border-white/[0.08] bg-[#0d0d12] px-3 text-sm text-zinc-300 outline-none transition-all duration-200 placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="flex h-[42px] items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-500/20"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );

  return (
    <div className="border-b border-white/[0.06] bg-[#08080c]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-4 sm:px-8 lg:px-12">
        {/* Desktop */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-400">
            <SlidersHorizontal size={16} className="text-violet-400" />
            Filters
          </div>
          {FilterContent}
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMobile(!showMobile)}
            className="flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#0d0d12] text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-violet-500/30"
          >
            <SlidersHorizontal size={16} className="text-violet-400" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>
          {showMobile && <div className="mt-3 space-y-3">{FilterContent}</div>}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
