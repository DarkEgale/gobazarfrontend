import { memo, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage } from "react-icons/fi";
import { API_ENDPOINTS, getApiUrl } from "../../config/apiConfig";
import ProductForm from "./ProductForm";

const PRODUCTS_API = `${getApiUrl(API_ENDPOINTS.PRODUCTS_ALL)}`;

const AdminProducts = memo(() => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch all products — Edit form-এর জন্য সব field ধরে রাখা হয়
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${PRODUCTS_API}?limit=100`, {
        withCredentials: true,
      });
      const raw = res.data?.data?.products || [];
      const mapped = raw.map((p) => ({
        id: p._id,
        title: p.title,
        description: p.description || "",
        category: p.category || "Uncategorized",
        subCategory: p.subCategory || "",
        price: p.price,
        discount: p.discount || 0,
        notes: p.notes || "",
        delivary: p.delivary ?? "",
        paymentMethod: p.paymentMethod || "",
        searchTags: Array.isArray(p.searchTags)
          ? p.searchTags.join(", ")
          : p.searchTags || "",
        thumbnil: p.thumbnil || null, // existing thumbnail URL
        photos: p.photos || [], // existing photo URLs
        image: p.thumbnil,
      }));
      setProducts(mapped);
    } catch (error) {
      console.error(
        "Fetch products error:",
        error.response?.data?.message || error.message,
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = useCallback(
    async (formData) => {
      setSaving(true);
      try {
        await axios.post(getApiUrl(API_ENDPOINTS.PRODUCTS), formData, {
          withCredentials: true,
        });
        setShowForm(false);
        setEditingProduct(null);
        await fetchProducts();
      } catch (error) {
        console.error(
          "Create product error:",
          error.response?.data?.message || error.message,
        );
        alert(error.response?.data?.message || error.message);
      } finally {
        setSaving(false);
      }
    },
    [fetchProducts],
  );

  const handleUpdate = useCallback(
    async (formData) => {
      setSaving(true);
      try {
        await axios.put(
          `${getApiUrl(API_ENDPOINTS.PRODUCTS)}/${editingProduct.id}`,
          formData,
          { withCredentials: true },
        );
        setShowForm(false);
        setEditingProduct(null);
        await fetchProducts();
      } catch (error) {
        console.error(
          "Update product error:",
          error.response?.data?.message || error.message,
        );
        alert(error.response?.data?.message || error.message);
      } finally {
        setSaving(false);
      }
    },
    [editingProduct, fetchProducts],
  );

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`${getApiUrl(API_ENDPOINTS.PRODUCTS)}/${id}`, {
        withCredentials: true,
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(
        "Delete product error:",
        error.response?.data?.message || error.message,
      );
      alert(error.response?.data?.message || error.message);
    }
  }, []);

  const startEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <FiSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
          />
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm((prev) => !prev);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-violet-600/40"
        >
          <FiPlus size={16} />
          Add Product
        </button>
      </div>

      {/* Add/Edit form — image preview + partial update সহ */}
      {showForm && (
        <ProductForm
          initialData={editingProduct}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          onCancel={closeForm}
          saving={saving}
        />
      )}

      {/* Products list */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
          <span className="ml-3 text-sm text-zinc-500">
            Loading products...
          </span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
            <FiPackage size={28} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-white">
            No products found
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Add your first product to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors hover:border-white/[0.12]"
            >
              <div className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-white/[0.08]"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-white">
                    {product.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {product.category}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      ${product.price}
                    </span>
                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                      {product.discount > 0
                        ? `${product.discount}% off`
                        : "No discount"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/[0.06] pt-3">
                <button
                  onClick={() => startEdit(product)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <FiEdit2 size={13} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                >
                  <FiTrash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

AdminProducts.displayName = "AdminProducts";

export default AdminProducts;
