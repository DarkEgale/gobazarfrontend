import { memo, useEffect, useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  subCategory: "",
  price: "",
  discount: "",
  notes: "",
  delivary: "",
  paymentMethod: "",
  searchTags: "",
};

// Category → Sub Category map (dropdown-এর জন্য)
const CATEGORIES = {
  Electronics: ["Headphones", "Smart Watch", "Camera", "Keyboard", "Speaker", "Mobile", "Laptop", "Accessories"],
  Fashion: ["Men", "Women", "Kids", "Shoes", "Bags", "Accessories"],
  "Home & Living": ["Furniture", "Kitchen", "Decor", "Bedding", "Lighting"],
  Beauty: ["Skincare", "Makeup", "Hair Care", "Fragrance"],
  Sports: ["Fitness", "Outdoor", "Cycling", "Team Sports"],
  Books: ["Fiction", "Non-Fiction", "Academic", "Comics"],
  Toys: ["Kids Toys", "Board Games", "Action Figures", "Puzzles"],
  Grocery: ["Snacks", "Beverages", "Staples"],
  Others: ["General"],
};

/**
 * ProductForm — Create + Edit দুটোই handle করে।
 *
 * Edit mode-এ image "partial update" হয়:
 * - Existing thumbnail/photos প্রথমেই preview হিসেবে দেখা যায়
 * - ✕ চাপলে সেটা removedPhotos-এ যায় (backend Cloudinary থেকে delete করে)
 * - নতুন ফাইল select করলে শুধু সেগুলোই upload হয় (append)
 * - কিছু পরিবর্তন না করলে কোনো image field-ই পাঠানো হয় না
 */
const ProductForm = memo(({ initialData, onSubmit, onCancel, saving }) => {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState(() => {
    if (!initialData) return { ...EMPTY_FORM };
    return {
      title: initialData.title || "",
      description: initialData.description || "",
      category: initialData.category || "",
      subCategory: initialData.subCategory || "",
      price: initialData.price ?? "",
      discount: initialData.discount ?? "",
      notes: initialData.notes || "",
      delivary: initialData.delivary ?? "",
      paymentMethod: initialData.paymentMethod || "",
      searchTags: initialData.searchTags || "",
    };
  });

  // Thumbnail state
  const [existingThumb, setExistingThumb] = useState(initialData?.thumbnil || null);
  const [newThumb, setNewThumb] = useState(null); // File
  const [newThumbPreview, setNewThumbPreview] = useState(null);

  // Photos state
  const [existingPhotos, setExistingPhotos] = useState(initialData?.photos || []); // রাখা হবে
  const [removedPhotos, setRemovedPhotos] = useState([]); // Cloudinary থেকে delete হবে
  const [newPhotos, setNewPhotos] = useState([]); // নতুন File[]
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);

  // Unmount হলে object URL গুলো revoke
  useEffect(() => {
    return () => {
      if (newThumbPreview) URL.revokeObjectURL(newThumbPreview);
      newPhotoPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Category change করলে sub category reset হবে (নতুন categoryর sub আলাদা)
  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      category: value,
      subCategory: CATEGORIES[value]?.includes(prev.subCategory)
        ? prev.subCategory
        : "",
    }));
  };

  // Edit mode-এ পুরনো category/sub list-এ না থাকলেও option হিসেবে দেখাবে
  const categoryOptions = form.category && !CATEGORIES[form.category]
    ? [...Object.keys(CATEGORIES), form.category]
    : Object.keys(CATEGORIES);
  const subCategoryOptions = form.category
    ? [
        ...(CATEGORIES[form.category] || []),
        ...(form.subCategory && !(CATEGORIES[form.category] || []).includes(form.subCategory)
          ? [form.subCategory]
          : []),
      ]
    : [];

  // ---- Thumbnail handlers ----
  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (newThumbPreview) URL.revokeObjectURL(newThumbPreview);
    setNewThumb(file);
    setNewThumbPreview(URL.createObjectURL(file));
  };

  const undoThumbChange = () => {
    if (newThumbPreview) URL.revokeObjectURL(newThumbPreview);
    setNewThumb(null);
    setNewThumbPreview(null);
  };

  // ---- Existing photo remove (Cloudinary থেকে delete হবে) ----
  const removeExistingPhoto = (url) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== url));
    setRemovedPhotos((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  // ---- নতুন photo add/remove ----
  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewPhotos((prev) => [...prev, ...files]);
    setNewPhotoPreviews((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    ]);
    e.target.value = ""; // একই ফাইল আবার select করা যায় এমনটা নিশ্চিত করতে
  };

  const removeNewPhoto = (index) => {
    URL.revokeObjectURL(newPhotoPreviews[index].url);
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEdit && !newThumb) {
      alert("Thumbnail is required");
      return;
    }

    const formData = new FormData();

    // Text fields — খালি হলে পাঠানো হবে না (backend পুরনো মান রাখবে)
    Object.keys(form).forEach((key) => {
      if (form[key] !== "" && form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key]);
      }
    });

    // Thumbnail — শুধু নতুন ফাইল থাকলে
    if (newThumb) {
      formData.append("thumbnil", newThumb);
    }

    if (isEdit) {
      // Partial photo update: কোনগুলো রাখা হবে + কোনগুলো delete হবে
      formData.append("photos", JSON.stringify(existingPhotos));
      if (removedPhotos.length) {
        formData.append("removedPhotos", JSON.stringify(removedPhotos));
      }
    }

    // নতুন photos (create-তে সব, edit-এ শুধু নতুনগুলো)
    newPhotos.forEach((photo) => formData.append("photos", photo));

    onSubmit(formData);
  };

  const inputClasses =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-violet-500/30";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Close form"
        >
          <FiX size={18} />
        </button>
      </div>
      {/* ---- Text fields ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Product title" className={inputClasses} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            className={inputClasses}
          >
            <option value="">Select category</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat} className="bg-[#0d0d12]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Sub Category</label>
          <select
            name="subCategory"
            value={form.subCategory}
            onChange={handleChange}
            disabled={!form.category}
            className={`${inputClasses} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="">
              {form.category ? "Select sub category" : "Select category first"}
            </option>
            {subCategoryOptions.map((sub) => (
              <option key={sub} value={sub} className="bg-[#0d0d12]">
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Price (৳)</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} required placeholder="0.00" className={inputClasses} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Discount (%)</label>
          <input type="number" name="discount" value={form.discount} onChange={handleChange} placeholder="0" className={inputClasses} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Delivery Charge</label>
          <input type="number" name="delivary" value={form.delivary} onChange={handleChange} placeholder="0" className={inputClasses} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Payment Method</label>
          <input type="text" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} placeholder="e.g. COD, Card" className={inputClasses} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Search Tags</label>
          <input type="text" name="searchTags" value={form.searchTags} onChange={handleChange} placeholder="Comma separated tags" className={inputClasses} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Product description" className={`${inputClasses} resize-none`} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Notes</label>
          <input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. brand / extra notes" className={inputClasses} />
        </div>
      </div>

      {/* ---- Images ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Thumbnail */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
            Thumbnail {isEdit ? "(unchanged unless replaced)" : "(Required)"}
          </label>

          {(newThumbPreview || existingThumb) && (
            <div className="relative mb-2 w-fit">
              <img
                src={newThumbPreview || existingThumb}
                alt="Thumbnail preview"
                className="h-28 w-28 rounded-xl object-cover ring-1 ring-white/[0.1]"
              />
              {newThumb ? (
                <button
                  type="button"
                  onClick={undoThumbChange}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-400"
                  aria-label="Undo thumbnail change"
                >
                  <FiX size={13} />
                </button>
              ) : (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                  Current
                </span>
              )}
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-4 text-sm text-zinc-500 transition hover:border-violet-500/40 hover:text-violet-400">
            <FiUpload size={16} />
            {newThumb ? newThumb.name : existingThumb ? "Replace thumbnail" : "Upload thumbnail"}
            <input type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
          </label>
        </div>

        {/* Photos */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
            Product Photos {isEdit && "(✕ দিয়ে remove, নতুন add করা যাবে)"}
          </label>

          {existingPhotos.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {existingPhotos.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="Product photo" className="h-16 w-16 rounded-lg object-cover ring-1 ring-white/[0.1]" />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(url)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-400"
                    aria-label="Remove photo"
                  >
                    <FiX size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {newPhotoPreviews.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {newPhotoPreviews.map((p, i) => (
                <div key={p.url} className="relative">
                  <img src={p.url} alt="New photo" className="h-16 w-16 rounded-lg object-cover ring-2 ring-violet-500/40" />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-400"
                    aria-label="Remove new photo"
                  >
                    <FiX size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-4 text-sm text-zinc-500 transition hover:border-violet-500/40 hover:text-violet-400">
            <FiUpload size={16} />
            {newPhotos.length ? `${newPhotos.length} new photo(s) added` : "Add photos"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotosChange} />
          </label>

          {removedPhotos.length > 0 && (
            <p className="mt-1.5 text-[11px] text-red-400/80">
              {removedPhotos.length} photo(s) will be deleted on save
            </p>
          )}
        </div>
      </div>

      {/* ---- Actions ---- */}
      <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-violet-600/40 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
});

ProductForm.displayName = "ProductForm";

export default ProductForm;
