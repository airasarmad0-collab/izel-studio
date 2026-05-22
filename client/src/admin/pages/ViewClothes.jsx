import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiBase from "../../common/api";
import { toast } from "react-toastify";
import AdminNavbar from "../components/AdminNavbar"; // Adjust path as needed
import {
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  Tag,
  Ruler,
  Palette,
  Layers,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  DollarSign,
  Grid,
  List,
  Eye,
  Star,
  Truck,
  RefreshCw,
  ExternalLink
} from "lucide-react";

const PLACEHOLDER = "https://via.placeholder.com/400x500?text=No+Image";

const ViewClothes = () => {
  const { volumeId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [volume, setVolume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

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

  // ───────── UPDATE ─────────
  const handleUpdate = async () => {
    if (!editProduct.name || !editProduct.price) {
      toast.error("Name and price are required");
      return;
    }

    try {
      const response = await apiBase.put(
        `/api/admin/update/product/${editProduct._id}`,
        {
          name: editProduct.name,
          price: editProduct.price,
          description: editProduct.description,
          mainImage: editProduct.mainImage,
          additionalImages: editProduct.additionalImages,
          sizes: editProduct.sizes,
          colors: editProduct.colors,
          category: editProduct.category,
          stock: editProduct.stock
        }
      );

      if (response.data.success) {
        toast.success("Product updated successfully");
        setEditProduct(null);
        setImagePreview("");
        fetchProducts();
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // ───────── HANDLE IMAGE CHANGE ─────────
  const handleImageChange = (e) => {
    const url = e.target.value;
    setEditProduct({ ...editProduct, mainImage: url });
    setImagePreview(url);
  };

  // ───────── IMAGE SAFE ─────────
  const safeImg = (url) => {
    if (!url || url === "") return PLACEHOLDER;
    return url;
  };

  // ───────── FORMAT PRICE ─────────
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // ───────── NAVIGATE TO SINGLE PRODUCT ─────────
  const viewSingleProduct = (clothId) => {
    navigate(`/admin/dashboard/view/cloth/${clothId}`);
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: "80px 20px 20px 20px", background: "#0e1526", minHeight: "100vh", color: "#fff" }}>
        
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
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2a3a5e"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#1e2a47"}
          >
            <ArrowLeft size={18} />
            Back to Volumes
          </Link>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <ShoppingBag size={28} color="#4a90e2" />
                {volume?.name || "Collection Products"}
              </h1>
              <p style={{ color: "#8892b0", marginTop: 5 }}>
                <Package size={16} style={{ display: "inline", marginRight: 5 }} />
                Total Products: {products.length}
              </p>
            </div>
            
            {/* View Toggle Buttons */}
            <div style={{ display: "flex", gap: "10px", background: "#1e2a47", padding: "5px", borderRadius: "8px" }}>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "8px 12px",
                  background: viewMode === "grid" ? "#4a90e2" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: viewMode === "grid" ? "#fff" : "#8892b0",
                  transition: "all 0.2s"
                }}
              >
                <Grid size={18} />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  padding: "8px 12px",
                  background: viewMode === "list" ? "#4a90e2" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: viewMode === "list" ? "#fff" : "#8892b0",
                  transition: "all 0.2s"
                }}
              >
                <List size={18} />
                List
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCTS DISPLAY */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <RefreshCw size={40} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 10 }}>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#131d33", borderRadius: "12px" }}>
            <Package size={60} color="#8892b0" />
            <h3 style={{ marginTop: 20 }}>No Products Found</h3>
            <p style={{ color: "#8892b0" }}>This collection doesn't have any products yet.</p>
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
                fontWeight: "bold"
              }}
            >
              <PlusCircle size={18} />
              Add First Product
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          // GRID VIEW
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
                {/* IMAGE WITH CLICKABLE AREA */}
                <div 
                  style={{ position: "relative", cursor: "pointer" }}
                  onClick={() => viewSingleProduct(p._id)}
                >
                  <img
                    src={safeImg(p.mainImage)}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src = PLACEHOLDER;
                    }}
                  />
                  {/* View Details Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0,0,0,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.3s",
                      gap: "10px"
                    }}
                    className="image-overlay"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0";
                    }}
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
                        gap: "4px"
                      }}
                    >
                      {p.stock > 0 ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {p.stock > 0 ? `In Stock (${p.stock})` : "Out of Stock"}
                    </span>
                  )}
                </div>

                {/* INFO */}
                <div style={{ padding: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h3 style={{ margin: "0 0 5px", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
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
                        fontSize: "12px"
                      }}
                      title="View full details"
                    >
                      <ExternalLink size={14} />
                      Details
                    </button>
                  </div>
                  <p style={{ color: "#4a90e2", fontSize: "22px", fontWeight: "bold", margin: "10px 0" }}>
    PKR:                    {formatPrice(p.price)}
                  </p>
                  
                  {p.description && (
                    <p style={{ color: "#8892b0", fontSize: "14px", margin: "10px 0" }}>
                      {p.description.length > 80 ? p.description.substring(0, 80) + "..." : p.description}
                    </p>
                  )}
                  
                  {/* TAGS */}
                  <div style={{ display: "flex", gap: "8px", margin: "10px 0", flexWrap: "wrap" }}>
                    {p.category && (
                      <span style={{ background: "#1e2a47", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Layers size={12} />
                        {p.category}
                      </span>
                    )}
                    {p.sizes && p.sizes.length > 0 && (
                      <span style={{ background: "#1e2a47", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Ruler size={12} />
                        {p.sizes.join(", ")}
                      </span>
                    )}
                    {p.colors && p.colors.length > 0 && (
                      <span style={{ background: "#1e2a47", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Palette size={12} />
                        {p.colors.join(", ")}
                      </span>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditProduct(p);
                        setImagePreview(p.mainImage);
                      }}
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
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#357abd"}
                      onMouseLeave={(e) => e.target.style.background = "#4a90e2"}
                    >
                      <Edit size={16} />
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProduct(p._id);
                      }}
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
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#c82333"}
                      onMouseLeave={(e) => e.target.style.background = "#dc3545"}
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
          // LIST VIEW
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
                  cursor: "pointer"
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
                    borderRadius: "8px"
                  }}
                  onError={(e) => {
                    e.target.src = PLACEHOLDER;
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "10px" }}>
                    <h3 style={{ margin: "0 0 5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Tag size={16} color="#4a90e2" />
                      {p.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewSingleProduct(p._id);
                      }}
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
                        fontSize: "12px"
                      }}
                    >
                      <Eye size={14} />
                      View Full Details
                    </button>
                  </div>
                  <p style={{ color: "#4a90e2", fontSize: "20px", fontWeight: "bold", margin: "5px 0" }}>
                    <DollarSign size={16} style={{ display: "inline" }} />
                    {formatPrice(p.price)}
                  </p>
                  {p.description && (
                    <p style={{ color: "#8892b0", fontSize: "14px", margin: "5px 0" }}>
                      {p.description.length > 100 ? p.description.substring(0, 100) + "..." : p.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "8px", margin: "10px 0", flexWrap: "wrap" }}>
                    {p.category && (
                      <span style={{ background: "#1e2a47", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Layers size={12} />
                        {p.category}
                      </span>
                    )}
                    {p.sizes && p.sizes.length > 0 && (
                      <span style={{ background: "#1e2a47", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Ruler size={12} />
                        {p.sizes.join(", ")}
                      </span>
                    )}
                    {p.stock !== undefined && (
                      <span style={{ background: p.stock > 0 ? "#4caf50" : "#f44336", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        {p.stock > 0 ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        Stock: {p.stock}
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditProduct(p);
                      setImagePreview(p.mainImage);
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "#4a90e2",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProduct(p._id);
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
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

        {/* ───────── EDIT MODAL ───────── */}
        {editProduct && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: "20px"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditProduct(null);
                setImagePreview("");
              }
            }}
          >
            <div
              style={{
                background: "#131d33",
                padding: "30px",
                borderRadius: "12px",
                width: "90%",
                maxWidth: "550px",
                maxHeight: "90vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                  <Edit size={24} color="#4a90e2" />
                  Edit Product
                </h2>
                <button
                  onClick={() => {
                    setEditProduct(null);
                    setImagePreview("");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#8892b0"
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Image Preview */}
              <div style={{ marginBottom: "20px", textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={safeImg(imagePreview || editProduct.mainImage)}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "250px",
                      objectFit: "contain",
                      borderRadius: "8px"
                    }}
                    onError={(e) => {
                      e.target.src = PLACEHOLDER;
                    }}
                  />
                  <ImageIcon size={20} style={{ position: "absolute", bottom: "10px", right: "10px", background: "#0e1526", padding: "4px", borderRadius: "4px" }} />
                </div>
              </div>

              <input
                value={editProduct.name}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, name: e.target.value })
                }
                placeholder="Product Name *"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  background: "#0e1526",
                  border: "1px solid #2a3a5e",
                  borderRadius: "6px",
                  color: "#fff"
                }}
              />

              <input
                value={editProduct.price}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, price: e.target.value })
                }
                placeholder="Price *"
                type="number"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  background: "#0e1526",
                  border: "1px solid #2a3a5e",
                  borderRadius: "6px",
                  color: "#fff"
                }}
              />

              <textarea
                value={editProduct.description || ""}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, description: e.target.value })
                }
                placeholder="Description"
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  background: "#0e1526",
                  border: "1px solid #2a3a5e",
                  borderRadius: "6px",
                  color: "#fff",
                  resize: "vertical"
                }}
              />

              <input
                value={editProduct.mainImage || ""}
                onChange={handleImageChange}
                placeholder="Main Image URL"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  background: "#0e1526",
                  border: "1px solid #2a3a5e",
                  borderRadius: "6px",
                  color: "#fff"
                }}
              />

              <input
                value={editProduct.category || ""}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, category: e.target.value })
                }
                placeholder="Category"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  background: "#0e1526",
                  border: "1px solid #2a3a5e",
                  borderRadius: "6px",
                  color: "#fff"
                }}
              />

              <input
                value={editProduct.sizes ? editProduct.sizes.join(", ") : ""}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    sizes: e.target.value.split(",").map(s => s.trim())
                  })
                }
                placeholder="Sizes (comma-separated, e.g., S, M, L, XL)"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  background: "#0e1526",
                  border: "1px solid #2a3a5e",
                  borderRadius: "6px",
                  color: "#fff"
                }}
              />

              <input
                value={editProduct.colors ? editProduct.colors.join(", ") : ""}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    colors: e.target.value.split(",").map(c => c.trim())
                  })
                }
                placeholder="Colors (comma-separated, e.g., Red, Blue, Black)"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  background: "#0e1526",
                  border: "1px solid #2a3a5e",
                  borderRadius: "6px",
                  color: "#fff"
                }}
              />

              <input
                value={editProduct.stock || 0}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })
                }
                placeholder="Stock Quantity"
                type="number"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "20px",
                  background: "#0e1526",
                  border: "1px solid #2a3a5e",
                  borderRadius: "6px",
                  color: "#fff"
                }}
              />

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    setEditProduct(null);
                    setImagePreview("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <X size={18} />
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#4a90e2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add animation keyframes */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
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
        `}
      </style>
    </>
  );
};

export default ViewClothes;