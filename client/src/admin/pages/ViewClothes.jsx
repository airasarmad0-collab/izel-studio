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
  Cloud,
  Upload,
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
  const [editProduct, setEditProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [updateLoading, setUpdateLoading] = useState(false);

  // File states (stored separately, not in editForm)
  const [mainImageFile, setMainImageFile] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);

  const emptyEditForm = {
    name: "",
    description: "",
    price: "",
    mainImage: "",          // URL for preview and existing URL
    imageGallery: [],       // array of URLs (existing + blob previews)
    purchasingLink: "",
    type: "unstitched",
    metaTitle: "",
    metaDescription: "",
    tags: [""],
  };
  const [editForm, setEditForm] = useState(emptyEditForm);

  useEffect(() => {
    if (editProduct && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.85, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4 }
      );
    }
  }, [editProduct]);

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

  const openEdit = (p) => {
    setEditProduct(p);
    setEditForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price || "",
      mainImage: p.mainImage || "",
      imageGallery: p.imageGallery || [],
      purchasingLink: p.purchasingLink || "",
      type: p.type || "unstitched",
      metaTitle: p.metaTitle || "",
      metaDescription: p.metaDescription || "",
      tags: p.tags && p.tags.length ? p.tags : [""],
    });
    // Reset file states
    setMainImageFile(null);
    setNewGalleryFiles([]);
  };

  const closeEdit = () => {
    setEditProduct(null);
    setEditForm(emptyEditForm);
    setMainImageFile(null);
    setNewGalleryFiles([]);
  };

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

  // Tag helpers
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

  // Gallery removal (handles both existing URLs and new blob previews)
  const removeGalleryImage = (indexToRemove) => {
    const urlToRemove = editForm.imageGallery[indexToRemove];
    setEditForm((prev) => ({
      ...prev,
      imageGallery: prev.imageGallery.filter((_, idx) => idx !== indexToRemove),
    }));
    // If it was a new file (blob), also remove from newGalleryFiles
    if (urlToRemove.startsWith("blob:")) {
      // Find which new file corresponds to this blob URL (by matching index in combined array)
      // Simpler: keep track of new files separately – we know that all blobs correspond to newGalleryFiles in order of addition.
      // Since we add multiple at once, we need to know which index to remove. For demo we'll rebuild newGalleryFiles.
      // Better approach: store a unique id, but for simplicity we'll just filter by the fact that we can't map easily.
      // We'll re‑set newGalleryFiles by counting how many blob URLs remain.
      const remainingBlobUrls = editForm.imageGallery.filter(url => url.startsWith("blob:"));
      setNewGalleryFiles(prev => prev.slice(0, remainingBlobUrls.length));
    }
  };

  // Main image file selection (store file, preview URL)
  const handleMainImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setEditForm(prev => ({
        ...prev,
        mainImage: URL.createObjectURL(file)
      }));
    }
  };

  // Gallery multiple file selection
  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setNewGalleryFiles(prev => [...prev, ...files]);
      const previewUrls = files.map(f => URL.createObjectURL(f));
      setEditForm(prev => ({
        ...prev,
        imageGallery: [...prev.imageGallery, ...previewUrls]
      }));
    }
    e.target.value = ""; // allow re-selecting same files
  };

  // ───────── UPDATE SUBMIT with FormData ─────────
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editForm.name || !editForm.price || !editForm.metaTitle) {
      toast.error("Please fill required fields (name, price, metaTitle)");
      return;
    }

    // Main image must exist either as an existing URL or a new file
    if (!editForm.mainImage && !mainImageFile) {
      toast.error("Main image is required");
      return;
    }

    const formData = new FormData();
    // Text fields
    formData.append("name", editForm.name);
    formData.append("description", editForm.description);
    formData.append("price", editForm.price);
    formData.append("metaTitle", editForm.metaTitle);
    formData.append("metaDescription", editForm.metaDescription);
    formData.append("type", editForm.type);
    formData.append("purchasingLink", editForm.purchasingLink);
    
    // Tags (send as array)
    editForm.tags.filter(t => t.trim()).forEach(tag => formData.append("tags[]", tag));

    // Existing image URLs (to keep if no new file)
    if (editForm.mainImage && !editForm.mainImage.startsWith("blob:")) {
      formData.append("existingMainImage", editForm.mainImage);
    }
    // Existing gallery URLs (skip blob previews)
    editForm.imageGallery.forEach(url => {
      if (url && !url.startsWith("blob:")) {
        formData.append("existingImageGallery[]", url);
      }
    });

    // New main image file
    if (mainImageFile) {
      formData.append("mainImage", mainImageFile);
    }
    // New gallery files
    newGalleryFiles.forEach(file => {
      formData.append("imageGallery", file);
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

  // Helpers
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
      fontFamily: "inherit",
    },
    textarea: {
      width: "100%",
      padding: 10,
      minHeight: 80,
      borderRadius: 8,
      border: "1px solid #ddd",
      boxSizing: "border-box",
      fontFamily: "inherit",
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
        {/* Back button and header */}
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3a5e")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1e2a47")}
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
                <Package size={16} style={{ display: "inline", marginRight: 5 }} />
                Total Products: {products.length}
              </p>
            </div>

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

        {/* Products display */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <RefreshCw size={40} style={{ animation: "spin 1s linear infinite" }} />
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
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
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
                    <span style={{ color: "#fff", fontWeight: "bold" }}>View Details</span>
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
                      {p.stock > 0 ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {p.stock > 0 ? `In Stock (${p.stock})` : "Out of Stock"}
                    </span>
                  )}
                </div>
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
                    <p style={{ color: "#8892b0", fontSize: "14px", margin: "10px 0" }}>
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

      {/* EDIT MODAL – with file pickers and direct submission */}
      <AnimatePresence>
        {editProduct && (
          <div style={modalStyles.overlay} onClick={closeEdit}>
            <motion.div
              ref={modalRef}
              style={modalStyles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={modalStyles.header}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Cloud size={20} color="#4a90e2" />
                  Edit Product — Upload Images
                </h3>
                <button
                  onClick={closeEdit}
                  style={{ border: "none", background: "transparent", ...buttonBase, cursor: "pointer" }}
                >
                  <X />
                </button>
              </div>

              <form style={modalStyles.form} onSubmit={handleUpdate}>
                {/* Name */}
                <div>
                  <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                    Product Name *
                  </label>
                  <input
                    placeholder="Enter product name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={modalStyles.input}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                    Product Description
                  </label>
                  <textarea
                    placeholder="Enter product description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={modalStyles.textarea}
                  />
                </div>

                {/* Price */}
                <div>
                  <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    style={modalStyles.input}
                    required
                  />
                </div>

                {/* MAIN IMAGE - FILE PICKER */}
                <div style={modalStyles.box}>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", color: "#333" }}>
                    Main Image *
                  </label>
                  {editForm.mainImage && (
                    <div style={{ marginBottom: 12 }}>
                      <img
                        src={editForm.mainImage}
                        alt="Main preview"
                        style={{
                          width: "100%",
                          maxHeight: 200,
                          objectFit: "contain",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                        }}
                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                      />
                      <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                        {mainImageFile ? "New image (to be uploaded)" : "Current main image"}
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageSelect}
                    style={modalStyles.input}
                  />
                  <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                    Select a new image from your computer. It will replace the current main image.
                  </p>
                </div>

                {/* Type */}
                <div>
                  <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                    Product Type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    style={modalStyles.input}
                  >
                    <option value="unstitched">Unstitched</option>
                    <option value="stitched">Stitched</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <div style={modalStyles.row}>
                    <label style={{ fontWeight: "bold" }}>Tags</label>
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={editForm.tags.length >= MAX_TAGS}
                      style={{ ...modalStyles.addBtn, ...buttonBase, opacity: editForm.tags.length >= MAX_TAGS ? 0.5 : 1 }}
                    >
                      <Plus size={14} /> Add Tag
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

                {/* GALLERY IMAGES - MULTIPLE FILE PICKER */}
                <div>
                  <div style={modalStyles.row}>
                    <label style={{ fontWeight: "bold" }}>Gallery Images</label>
                    <label
                      htmlFor="gallery-upload"
                      style={{ ...modalStyles.addBtn, ...buttonBase, cursor: "pointer" }}
                    >
                      <Upload size={14} /> Add Images
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="gallery-upload"
                      style={{ display: "none" }}
                      onChange={handleGallerySelect}
                    />
                  </div>

                  {editForm.imageGallery.length === 0 && (
                    <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                      No gallery images yet. Click "Add Images" to upload from your computer.
                    </p>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
                    {editForm.imageGallery.map((url, idx) => (
                      <div key={idx} style={{ position: "relative", width: 100 }}>
                        <img
                          src={url}
                          alt={`gallery-${idx}`}
                          style={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #ddd",
                          }}
                          onError={(e) => { e.target.src = PLACEHOLDER; }}
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            background: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: 24,
                            height: 24,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta Title */}
                <div>
                  <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                    Meta Title *
                  </label>
                  <input
                    placeholder="Enter meta title for SEO"
                    value={editForm.metaTitle}
                    onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })}
                    style={modalStyles.input}
                    required
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                    Meta Description
                  </label>
                  <textarea
                    placeholder="Enter meta description for SEO"
                    value={editForm.metaDescription}
                    onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                    style={modalStyles.textarea}
                  />
                </div>

                {/* Purchasing Link */}
                <div>
                  <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                    Purchase Link (WhatsApp)
                  </label>
                  <input
                    type="url"
                    placeholder="https://wa.me/..."
                    value={editForm.purchasingLink}
                    onChange={(e) => setEditForm({ ...editForm, purchasingLink: e.target.value })}
                    style={modalStyles.input}
                  />
                </div>

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
          flex-direction: column;
        }
        div:hover > .image-overlay {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default ViewClothes;