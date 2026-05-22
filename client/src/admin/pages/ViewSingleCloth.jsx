import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiBase from "../../common/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";

// Helper: convert relative image URL to absolute
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_URL;
  return `${baseUrl}${url}`;
};

const ViewSingleCloth = () => {
  const { clothId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [viewer, setViewer] = useState({
    open: false,
    img: "",
    zoom: 1,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await apiBase.get(`/api/admin/get/product/${clothId}`);
        const prod = res?.data?.data;
        if (!prod) throw new Error("Product not found");
        setProduct(prod);
        setRelatedProducts(res?.data?.relatedProducts || []);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (clothId) fetchProduct();
  }, [clothId]);

  const openImage = (img) => {
    setViewer({ open: true, img: getImageUrl(img), zoom: 1 });
  };

  const closeViewer = () => {
    setViewer({ open: false, img: "", zoom: 1 });
  };

  const zoomIn = () => {
    setViewer((v) => ({ ...v, zoom: Math.min(v.zoom + 0.2, 4) }));
  };

  const zoomOut = () => {
    setViewer((v) => ({ ...v, zoom: Math.max(v.zoom - 0.2, 1) }));
  };

  if (loading) {
    return (
      <div style={{ background: "#0E1526", minHeight: "100vh" }}>
        <AdminNavbar />
        <div style={{ padding: 40, color: "#fff", textAlign: "center" }}>Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ background: "#0E1526", minHeight: "100vh" }}>
        <AdminNavbar />
        <div style={{ padding: 40, color: "#fff", textAlign: "center" }}>
          <p>Product not found or an error occurred.</p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            style={{ marginTop: 16, padding: "8px 16px", background: "#fff", color: "#000", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allImages = [product.mainImage, ...(product.imageGallery || [])].filter(Boolean);
  const purchaseLink = product.purchasingLink || "https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you";

  const RelatedCard = ({ p }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: "#131d33",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "transform 0.2s",
      }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/admin/dashboard/view/cloth/${p._id}`)}
    >
      <img
        src={getImageUrl(p.mainImage)}
        style={{ width: "100%", height: 260, objectFit: "cover" }}
        onError={(e) => (e.target.src = "https://via.placeholder.com/400x500?text=No+Image")}
      />
      <div style={{ padding: 15 }}>
        <p style={{ color: "#aaa", fontSize: 12 }}>{p.metaTitle || "Product"}</p>
        <h3 style={{ fontSize: "1rem", margin: "6px 0" }}>{p.name}</h3>
        <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>Rs {p.price?.toLocaleString()}</p>
      </div>
    </motion.div>
  );

  return (
    <div style={{ background: "#0E1526", minHeight: "100vh", color: "#fff" }}>
      <AdminNavbar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 20px" }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            padding: "8px 16px",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            marginBottom: 24,
            fontSize: "0.8rem",
          }}
        >
          ← Back
        </button>

        {/* Product main section */}
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          {/* Left: Images */}
          <div style={{ flex: "1", minWidth: 280 }}>
            <img
              src={getImageUrl(product.mainImage)}
              onClick={() => openImage(product.mainImage)}
              style={{ width: "100%", maxWidth: 400, borderRadius: 12, cursor: "zoom-in" }}
              onError={(e) => (e.target.src = "https://via.placeholder.com/400x500?text=No+Image")}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={getImageUrl(img)}
                  onClick={() => openImage(img)}
                  style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8, cursor: "pointer" }}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/70x70?text=No+Image")}
                />
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div style={{ flex: "1.5" }}>
            <p style={{ color: "#aaa", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 1 }}>
              {product.metaTitle || "Collection Piece"}
            </p>
            <h1 style={{ fontSize: "2rem", margin: "12px 0 8px" }}>{product.name}</h1>
            <p style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 24 }}>Rs {product.price?.toLocaleString()}</p>

            {product.volume && (
              <div style={{ background: "#131d33", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
                <p style={{ color: "#aaa", fontSize: "0.7rem", marginBottom: 4 }}>Volume / Collection</p>
                <p style={{ fontWeight: 500 }}>{product.volume.name || product.volume.title}</p>
              </div>
            )}

            <p style={{ color: "#bbb", lineHeight: 1.6, marginBottom: 28 }}>
              {product.description || "No description available for this product."}
            </p>

            <a
              href={purchaseLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "#fff",
                color: "#000",
                borderRadius: 40,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Purchase Now
            </a>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <>
            <h2 style={{ marginTop: 60, marginBottom: 24, fontSize: "1.5rem" }}>You May Also Like</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 24 }}>
              {relatedProducts.map((p) => (
                <RelatedCard key={p._id} p={p} />
              ))}
            </div>
          </>
        )}

        {/* Image viewer modal */}
        <AnimatePresence>
          {viewer.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeViewer}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.92)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                zIndex: 9999,
                backdropFilter: "blur(8px)",
              }}
            >
              <button
                onClick={closeViewer}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                <X size={20} />
              </button>

              <motion.img
                src={viewer.img}
                style={{
                  maxHeight: "80vh",
                  maxWidth: "90vw",
                  transform: `scale(${viewer.zoom})`,
                  transition: "transform 0.2s ease",
                }}
                onClick={(e) => e.stopPropagation()}
              />

              <div style={{ marginTop: 24, display: "flex", gap: 20 }}>
                <button
                  onClick={zoomOut}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={zoomIn}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ViewSingleCloth;