import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiBase from "../../common/api";
import { toast } from "react-toastify";
import AdminNavbar from "../components/AdminNavbar";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  X,
  Tag,
  Ruler,
  Palette,
  Layers,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Grid,
  List,
  Eye,
  RefreshCw,
  ExternalLink,
  Plus,
} from "lucide-react";

const PLACEHOLDER = "https://via.placeholder.com/400x500?text=No+Image";
const MAX_TAGS = 10;
const MAX_GALLERY = 9;

const ViewClothes = () => {
  const { volumeId } = useParams();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [volume, setVolume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // holds the product being edited
  const [viewMode, setViewMode] = useState("grid");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Edit form state (mirrors CreateCloth)
  const emptyEditForm = {
    name: "",
    description: "",
    price: "",
    mainImage: null,         // File object (new upload) or null
    mainImagePreview: "",    // preview URL (existing or new)
    imageGallery: [],        // array of File objects or null (null = keep existing)
    galleryPreviews: [],     // preview URLs
    purchasingLink: "",
    type: "unstitched",
    metaTitle: "",
    metaDescription: "",
    tags: [""],
  };
  const [editForm, setEditForm] = useState(emptyEditForm);

  // ───────── GSAP modal animation ─────────
  useEffect(() => {
    if (editProduct && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.85, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4 }
      );
    }
  }, [editProduct]);

  // ───────── FETCH ─────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiBase.get(`/api/admin/get-all/products/${volumeId}`);
      setProducts(res.data.data || []);
      setVolume(res.data.volume || null);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (volumeId) fetchProducts();
  }, [volumeId]);

  // ───────── OPEN EDIT MODAL ─────────
  const openEdit = (p) => {
    setEditProduct(p);
    setEditForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price || "",
      mainImage: null,
      mainImagePreview: p.mainImage || "",
      imageGallery: (p.imageGallery || []).map(() => null), // placeholders for existing
      galleryPreviews: p.imageGallery || [],
      purchasingLink: p.purchasingLink || "",
      type: p.type || "unstitched",
      metaTitle: p.metaTitle || "",
      metaDescription: p.metaDescription || "",
      tags: p.tags && p.tags.length ? p.tags : [""],
    });
  };

  const closeEdit = () => {
    setEditProduct(null);
    setEditForm(emptyEditForm);
  };

  // ───────── DELETE ─────────
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiBase.delete(`/api/admin/delete/product/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Delete failed. Please try again.");
    }
  };

  // ───────── TAG HELPERS ─────────
  const handleTagChange = (val, i) => {
    const updated = [...editForm.tags];
    updated[i] = val;
    setEditForm({ ...editForm, tags: updated });
  };

  const addTag = () => {
    if (editForm.tags.length >= MAX_TAGS) return;
    setEditForm({ ...editForm, tags: [...editForm.tags, ""] });
  };

  const removeTag = (i) => {
    const updated = editForm.tags.filter((_, idx) => idx !== i);
    setEditForm({ ...editForm, tags: updated.length ? updated : [""] });
  };

  // ───────── MAIN IMAGE ─────────
  const handleMainImage = (file) => {
    setEditForm({
      ...editForm,
      mainImage: file,
      mainImagePreview: file ? URL.createObjectURL(file) : editForm.mainImagePreview,
    });
  };

  // ───────── GALLERY HELPERS ─────────
  const handleGalleryChange = (file, i) => {
    const updatedFiles = [...editForm.imageGallery];
    const updatedPreviews = [...editForm.galleryPreviews];
    updatedFiles[i] = file;
    updatedPreviews[i] = file ? URL.createObjectURL(file) : updatedPreviews[i];
    setEditForm({ ...editForm, imageGallery: updatedFiles, galleryPreviews: updatedPreviews });
  };

  const addGallery = () => {
    if (editForm.imageGallery.length >= MAX_GALLERY) return;
    setEditForm({
      ...editForm,
      imageGallery: [...editForm.imageGallery, null],
      galleryPreviews: [...editForm.galleryPreviews, ""],
    });
  };

  const removeGallery = (i) => {
    setEditForm({
      ...editForm,
      imageGallery: editForm.imageGallery.filter((_, idx) => idx !== i),
      galleryPreviews: editForm.galleryPreviews.filter((_, idx) => idx !== i),
    });
  };

  // ───────── UPDATE SUBMIT ─────────
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editForm.name || !editForm.price || !editForm.metaTitle) {
      toast.error("Please fill required fields (name, price, metaTitle)");
      return;
    }

    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("description", editForm.description);
    formData.append("price", editForm.price);
    formData.append("metaTitle", editForm.metaTitle);
    formData.append("metaDescription", editForm.metaDescription);
    formData.append("type", editForm.type);
    formData.append("purchasingLink", editForm.purchasingLink);

    const tagsString = editForm.tags.filter((t) => t.trim()).join(",");
    formData.append("tags", tagsString);

    // Only append mainImage if a new file was chosen
    if (editForm.mainImage) {
      formData.append("mainImage", editForm.mainImage);
    }

    // Only append gallery files that were newly chosen
    editForm.imageGallery.forEach((file) => {
      if (file) formData.append("imageGallery", file);
    });

    try {
      setUpdateLoading(true);
      const res = await apiBase.put(
        `/api/admin/update/product/${editProduct._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("Product updated successfully!");
        closeEdit();
        fetchProducts();
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ───────── HELPERS ─────────
  const safeImg = (url) => (!url || url === "" ? PLACEHOLDER : url);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(price);

  const viewSingleProduct = (clothId) => {
    navigate(`/admin/dashboard/view/cloth/${clothId}`);
  };

  // ───────── SHARED STYLES (matches CreateCloth) ─────────
  const buttonBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    cursor: "pointer",
  };

  const modalStyles = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: 10,
    },
    modal: {
      width: "100%",
      maxWidth: 600,
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      maxHeight: "90vh",
      overflowY: "auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    input: {
      width: "100%",
      padding: 10,
      borderRadius: 8,
      border: "1px solid #ddd",
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      padding: 10,
      minHeight: 80,
      borderRadius: 8,
      border: "1px solid #ddd",
      boxSizing: "border-box",
    },
    box: {
      padding: 10,
      background: "#f5f5f5",
      borderRadius: 8,
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    tagRow: {
      display: "flex",
      gap: 8,
      marginTop: 8,
    },
    galleryItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
      padding: 10,
      background: "#f5f5f5",
      borderRadius: 8,
      marginTop: 6,
    },
    addBtn: {
      background: "#000",
      color: "#fff",
      border: "none",
      padding: "6px 10px",
      borderRadius: 6,
      cursor: "pointer",
    },
    removeBtn: {
      background: "#ffeded",
      border: "1px solid #ffcccc",
      color: "red",
      padding: 6,
      borderRadius: 6,
      cursor: "pointer",
    },
    submitBtn: {
      padding: "10px",
      background: "#000",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      marginTop: 10,
    },
  };

  // ───────── RENDER ─────────
  return (
    <>
      <Helmet>
        <title>Admin — View Products</title>
      </Helmet>
      <AdminNavbar />

      <div
        style={{
          padding: "80px 20px 20px 20px",
          background: "#0e1526",
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        {/* BACK BUTTON AND HEADER */}
        <div style={{ marginBottom: 20 }}>
          <Link
            to="/admin/dashboard/view/volumes"
            style={{
              color: "#fff",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
              padding: "8px 16px",
              background: "#1e2a47",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#2a3a5e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#1e2a47")
            }
          >
            <ArrowLeft size={18} />
            Back to Volumes
          </Link>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <ShoppingBag size={28} color="#4a90e2" />
                {volume?.name || "Collection Products"}
              </h1>
              <p style={{ color: "#8892b0", marginTop: 5 }}>
                <Package
                  size={16}
                  style={{ display: "inline", marginRight: 5 }}
                />
                Total Products: {products.length}
              </p>
            </div>

            {/* View Toggle */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                background: "#1e2a47",
                padding: "5px",
                borderRadius: "8px",
              }}
            >
              {["grid", "list"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: "8px 12px",
                    background: viewMode === mode ? "#4a90e2" : "transparent",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: viewMode === mode ? "#fff" : "#8892b0",
                    transition: "all 0.2s",
                    textTransform: "capitalize",
                  }}
                >
                  {mode === "grid" ? <Grid size={18} /> : <List size={18} />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUCTS DISPLAY */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <RefreshCw
              size={40}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <p style={{ marginTop: 10 }}>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#131d33",
              borderRadius: "12px",
            }}
          >
            <Package size={60} color="#8892b0" />
            <h3 style={{ marginTop: 20 }}>No Products Found</h3>
            <p style={{ color: "#8892b0" }}>
              This collection doesn't have any products yet.
            </p>
            <Link
              to={`/admin/dashboard/create/cloth/${volumeId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "20px",
                padding: "12px 24px",
                background: "#4a90e2",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              <PlusCircle size={18} />
              Add First Product
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          // ── GRID VIEW ──
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {products.map((p) => (
              <div
                key={p._id}
                style={{
                  background: "#131d33",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* IMAGE */}
                <div
                  style={{ position: "relative", cursor: "pointer" }}
                  onClick={() => viewSingleProduct(p._id)}
                >
                  <img
                    src={safeImg(p.mainImage)}
                    alt={p.name}
                    style={{ width: "100%", height: "300px", objectFit: "cover" }}
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                  <div
                    className="image-overlay"
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    <Eye size={30} color="#fff" />
                    <span style={{ color: "#fff", fontWeight: "bold" }}>
                      View Details
                    </span>
                  </div>
                  {p.stock !== undefined && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: p.stock > 0 ? "#4caf50" : "#f44336",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {p.stock > 0 ? (
                        <CheckCircle size={12} />
                      ) : (
                        <AlertCircle size={12} />
                      )}
                      {p.stock > 0 ? `In Stock (${p.stock})` : "Out of Stock"}
                    </span>
                  )}
                </div>

                {/* INFO */}
                <div style={{ padding: "15px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 5px",
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Tag size={16} color="#4a90e2" />
                      {p.name}
                    </h3>
                    <button
                      onClick={() => viewSingleProduct(p._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#4a90e2",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                      }}
                    >
                      <ExternalLink size={14} />
                      Details
                    </button>
                  </div>

                  <p
                    style={{
                      color: "#4a90e2",
                      fontSize: "22px",
                      fontWeight: "bold",
                      margin: "10px 0",
                    }}
                  >
                    {formatPrice(p.price)}
                  </p>

                  {p.description && (
                    <p
                      style={{
                        color: "#8892b0",
                        fontSize: "14px",
                        margin: "10px 0",
                      }}
                    >
                      {p.description.length > 80
                        ? p.description.substring(0, 80) + "..."
                        : p.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      margin: "10px 0",
                      flexWrap: "wrap",
                    }}
                  >
                    {p.category && (
                      <span
                        style={{
                          background: "#1e2a47",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Layers size={12} />
                        {p.category}
                      </span>
                    )}
                    {p.sizes && p.sizes.length > 0 && (
                      <span
                        style={{
                          background: "#1e2a47",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Ruler size={12} />
                        {p.sizes.join(", ")}
                      </span>
                    )}
                    {p.colors && p.colors.length > 0 && (
                      <span
                        style={{
                          background: "#1e2a47",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Palette size={12} />
                        {p.colors.join(", ")}
                      </span>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#4a90e2",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProduct(p._id); }}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ── LIST VIEW ──
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {products.map((p) => (
              <div
                key={p._id}
                style={{
                  background: "#131d33",
                  borderRadius: "12px",
                  padding: "15px",
                  display: "flex",
                  gap: "20px",
                  transition: "transform 0.2s",
                  flexWrap: "wrap",
                  cursor: "pointer",
                }}
                onClick={() => viewSingleProduct(p._id)}
              >
                <img
                  src={safeImg(p.mainImage)}
                  alt={p.name}
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Tag size={16} color="#4a90e2" />
                      {p.name}
                    </h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); viewSingleProduct(p._id); }}
                      style={{
                        background: "#4a90e2",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                      }}
                    >
                      <Eye size={14} />
                      View Full Details
                    </button>
                  </div>

                  <p
                    style={{
                      color: "#4a90e2",
                      fontSize: "20px",
                      fontWeight: "bold",
                      margin: "5px 0",
                    }}
                  >
                    {formatPrice(p.price)}
                  </p>

                  {p.description && (
                    <p style={{ color: "#8892b0", fontSize: "14px", margin: "5px 0" }}>
                      {p.description.length > 100
                        ? p.description.substring(0, 100) + "..."
                        : p.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      margin: "10px 0",
                      flexWrap: "wrap",
                    }}
                  >
                    {p.category && (
                      <span
                        style={{
                          background: "#1e2a47",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Layers size={12} />
                        {p.category}
                      </span>
                    )}
                    {p.sizes && p.sizes.length > 0 && (
                      <span
                        style={{
                          background: "#1e2a47",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Ruler size={12} />
                        {p.sizes.join(", ")}
                      </span>
                    )}
                    {p.stock !== undefined && (
                      <span
                        style={{
                          background: p.stock > 0 ? "#4caf50" : "#f44336",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {p.stock > 0 ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        Stock: {p.stock}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                    style={{
                      padding: "8px 16px",
                      background: "#4a90e2",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProduct(p._id); }}
                    style={{
                      padding: "8px 16px",
                      background: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ───────── EDIT MODAL (identical style to CreateCloth) ───────── */}
      <AnimatePresence>
        {editProduct && (
          <div style={modalStyles.overlay} onClick={closeEdit}>
            <motion.div
              ref={modalRef}
              style={modalStyles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div style={modalStyles.header}>
                <h3 style={{ margin: 0 }}>Edit Product</h3>
                <button
                  onClick={closeEdit}
                  style={{
                    border: "none",
                    background: "transparent",
                    ...buttonBase,
                    cursor: "pointer",
                  }}
                >
                  <X />
                </button>
              </div>

              <form style={modalStyles.form} onSubmit={handleUpdate}>
                {/* NAME */}
                <input
                  placeholder="Product Name *"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  style={modalStyles.input}
                  required
                />

                {/* DESCRIPTION */}
                <textarea
                  placeholder="Product Description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  style={modalStyles.textarea}
                />

                {/* PRICE */}
                <input
                  type="number"
                  placeholder="Price *"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, price: e.target.value })
                  }
                  style={modalStyles.input}
                  required
                />

                {/* MAIN IMAGE */}
                <div style={modalStyles.box}>
                  <b>Main Image</b>
                  {editForm.mainImagePreview && (
                    <div style={{ margin: "8px 0" }}>
                      <img
                        src={editForm.mainImagePreview}
                        alt="Main preview"
                        style={{
                          width: "100%",
                          maxHeight: 200,
                          objectFit: "contain",
                          borderRadius: 8,
                        }}
                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                      />
                      <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                        Current image — upload a new file to replace
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainImage(e.target.files[0])}
                  />
                </div>

                {/* TYPE */}
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                  style={modalStyles.input}
                >
                  <option value="unstitched">Unstitched</option>
                  <option value="stitched">Stitched</option>
                </select>

                {/* TAGS */}
                <div>
                  <div style={modalStyles.row}>
                    <b>Tags</b>
                    <button
                      type="button"
                      onClick={addTag}
                      style={{ ...modalStyles.addBtn, ...buttonBase }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  {editForm.tags.map((t, i) => (
                    <div key={i} style={modalStyles.tagRow}>
                      <input
                        placeholder="Enter tag"
                        value={t}
                        onChange={(e) => handleTagChange(e.target.value, i)}
                        style={modalStyles.input}
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(i)}
                        style={{ ...modalStyles.removeBtn, ...buttonBase }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* GALLERY IMAGES */}
                <div>
                  <div style={modalStyles.row}>
                    <b>Gallery Images</b>
                    <button
                      type="button"
                      onClick={addGallery}
                      style={{ ...modalStyles.addBtn, ...buttonBase }}
                    >
                      <Plus size={14} /> Add Image
                    </button>
                  </div>

                  {editForm.imageGallery.map((file, i) => (
                    <div key={i} style={modalStyles.galleryItem}>
                      <div style={{ flex: 1 }}>
                        {editForm.galleryPreviews[i] && (
                          <img
                            src={editForm.galleryPreviews[i]}
                            alt={`gallery-${i}`}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                              marginBottom: 4,
                              display: "block",
                            }}
                            onError={(e) => { e.target.src = PLACEHOLDER; }}
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleGalleryChange(e.target.files[0], i)
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGallery(i)}
                        style={{ ...modalStyles.removeBtn, ...buttonBase }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* META TITLE */}
                <input
                  placeholder="Meta Title *"
                  value={editForm.metaTitle}
                  onChange={(e) =>
                    setEditForm({ ...editForm, metaTitle: e.target.value })
                  }
                  style={modalStyles.input}
                  required
                />

                {/* META DESCRIPTION */}
                <textarea
                  placeholder="Meta Description"
                  value={editForm.metaDescription}
                  onChange={(e) =>
                    setEditForm({ ...editForm, metaDescription: e.target.value })
                  }
                  style={modalStyles.textarea}
                />

                {/* PURCHASING LINK */}
                <input
                  placeholder="Purchase Link (WhatsApp)"
                  value={editForm.purchasingLink}
                  onChange={(e) =>
                    setEditForm({ ...editForm, purchasingLink: e.target.value })
                  }
                  style={modalStyles.input}
                />

                {/* SUBMIT */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.95 }}
                  style={{ ...modalStyles.submitBtn, ...buttonBase }}
                  disabled={updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .image-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
          gap: 10px;
        }
        div:hover > .image-overlay {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default ViewClothes;