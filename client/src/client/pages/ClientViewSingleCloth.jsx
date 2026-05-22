import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
  Calendar,
  Layers,
  Share2,
} from "lucide-react";
import { FaTags, FaStar } from "react-icons/fa";
import apiBase from "../../common/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientNavbar from "../components/ClientNavbar";
import Footer from "../components/Footer";

// ----------------------------------------------------------------------
// Helper: make image URL absolute (relative -> full URL)
// ----------------------------------------------------------------------
const getImageUrl = (url) => {
  if (!url) return null;

  const baseUrl = import.meta.env.VITE_API_URL;

  // Fix old localhost URLs saved in DB
  if (url.includes("localhost:5000")) {
    const cleanPath = url.replace(
      "http://localhost:5000",
      ""
    );
    return `${baseUrl}${cleanPath}`;
  }

  // Already production URL
  if (url.startsWith("https://")) {
    return url;
  }

  // Relative path
  return `${baseUrl}${url}`;
};

// ----------------------------------------------------------------------
// STYLES – fully responsive, dynamic margins (unchanged)
// ----------------------------------------------------------------------
const STYLE_ID = "client-single-cloth-styles-v6";
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    :root {
      --sg-bg: #f8fafc;
      --sg-surface: #ffffff;
      --sg-surface2: #f1f5f9;
      --sg-border: #e2e8f0;
      --sg-text: #0f172a;
      --sg-muted: #64748b;
      --sg-accent: #0f172a;
      --sg-gold: #f59e0b;
      --navbar-h: 72px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .sg-page {
      background: var(--sg-bg);
      min-height: 100vh;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--sg-text);
      display: flex;
      flex-direction: column;
    }
    .sg-main {
      flex: 1;
      padding-top: var(--navbar-h);
    }

    /* Back button – responsive top margin */
    .sg-back {
      max-width: 1200px;
      margin: 10vh auto 0;
      padding: 0 32px;
    }
    .sg-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: 1.5px solid var(--sg-border);
      border-radius: 40px;
      padding: 8px 18px;
      font-size: 0.83rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--sg-text);
      transition: all 0.2s;
    }
    .sg-back-btn:hover {
      border-color: var(--sg-accent);
      background: var(--sg-accent);
      color: #fff;
    }

    /* Hero grid – desktop */
    .sg-hero {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 32px 0;
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      gap: 48px;
      align-items: start;
    }

    /* Image panel */
    .sg-img-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: sticky;
      top: calc(var(--navbar-h) + 20px);
      margin-bottom: 10vh;
    }
    .sg-img-stage {
      position: relative;
      min-height: 70vh;
      max-height: 80vh;
      width: 100%;
      overflow: hidden;
      border-radius: 16px;
      background: var(--sg-surface2);
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .sg-img-stage img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.28s ease;
    }
    .sg-img-stage:hover img { transform: scale(1.07); }

    .sg-arrow {
      position: absolute;
      top: 50%; transform: translateY(-50%);
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.92);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      transition: background 0.2s, transform 0.2s;
    }
    .sg-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
    .sg-arrow.prev { left: 12px; }
    .sg-arrow.next { right: 12px; }
    .sg-img-counter {
      position: absolute;
      bottom: 12px; right: 12px;
      background: rgba(15,23,42,0.7);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 40px;
      backdrop-filter: blur(6px);
      z-index: 5;
    }
    .sg-dots {
      display: flex;
      justify-content: center;
      gap: 7px;
    }
    .sg-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #cbd5e1;
      border: none; cursor: pointer; padding: 0;
      transition: background 0.2s, transform 0.2s;
    }
    .sg-dot.active { background: var(--sg-accent); transform: scale(1.4); }
    .sg-thumbs {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .sg-thumbs::-webkit-scrollbar { display: none; }
    .sg-thumb {
      width: 60px; height: 80px;
      object-fit: cover;
      border-radius: 10px;
      border: 2.5px solid transparent;
      cursor: pointer;
      flex-shrink: 0;
      transition: border-color 0.2s, transform 0.2s;
    }
    .sg-thumb:hover { transform: scale(1.05); }
    .sg-thumb.active { border-color: var(--sg-accent); }

    /* Info panel */
    .sg-info { display: flex; flex-direction: column; gap: 0; padding-top: 4px; }
    .sg-category {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--sg-muted);
      margin-bottom: 12px;
    }
    .sg-title {
      font-size: 1.8rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    .sg-price {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--sg-accent);
      margin-bottom: 24px;
    }
    .sg-divider {
      height: 1px;
      background: var(--sg-border);
      margin: 20px 0;
    }
    .sg-desc {
      font-size: 0.9rem;
      line-height: 1.7;
      color: var(--sg-muted);
      margin-bottom: 24px;
    }
    .sg-meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 24px;
    }
    .sg-meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--sg-surface2);
      border: 1px solid var(--sg-border);
      border-radius: 40px;
      padding: 6px 14px;
      font-size: 0.7rem;
      color: var(--sg-muted);
      font-weight: 500;
    }
    .sg-cta-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .sg-btn-primary {
      flex: 1;
      min-width: 160px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      background: var(--sg-accent);
      color: #fff;
      border: none;
      border-radius: 40px;
      padding: 13px 24px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: opacity 0.2s, transform 0.18s;
    }
    .sg-btn-primary:hover { opacity: 0.87; transform: translateY(-1px); }
    .sg-btn-primary.disabled {
      background: #cbd5e1;
      cursor: not-allowed;
      pointer-events: none;
    }
    .sg-btn-icon {
      width: 48px; height: 48px;
      border-radius: 50%;
      border: 1.5px solid var(--sg-border);
      background: var(--sg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .sg-btn-icon:hover { border-color: var(--sg-accent); background: var(--sg-accent); color: #fff; }
    .sg-volume-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #fff 0%, #fffbeb 100%);
      border: 1px solid rgba(245,158,11,0.25);
      border-radius: 12px;
      padding: 10px 16px;
      margin-top: 20px;
      font-size: 0.78rem;
      color: var(--sg-muted);
    }
    .sg-volume-badge strong { color: var(--sg-text); font-size: 0.84rem; }

    /* Related products – responsive bottom margin */
    .sg-related {
      max-width: 1200px;
      margin: 60px auto 5vh;
      padding: 0 32px;
    }
    .sg-related-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sg-related-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--sg-border);
    }
    .sg-related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 24px;
    }
    .sg-related-card {
      background: var(--sg-surface);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: transform 0.28s, box-shadow 0.28s;
    }
    .sg-related-card:hover { transform: translateY(-5px); box-shadow: 0 12px 28px rgba(0,0,0,0.1); }
    .sg-related-img {
      width: 100%; aspect-ratio: 3/4;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
    }
    .sg-related-card:hover .sg-related-img { transform: scale(1.04); }
    .sg-related-img-wrap { overflow: hidden; }
    .sg-related-body { padding: 12px; }
    .sg-related-name { font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; line-height: 1.3; }
    .sg-related-price { font-weight: 700; font-size: 0.85rem; color: var(--sg-accent); }

    .sg-shimmer {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: sg-shimmer 1.2s infinite;
      border-radius: 8px;
    }
    @keyframes sg-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ────────── TABLET (max-width: 1024px) ────────── */
    @media (max-width: 1024px) {
      :root { --navbar-h: 64px; }
      .sg-hero {
        grid-template-columns: 2fr 1fr;
        gap: 28px;
      }
      .sg-title { font-size: 1.6rem; }
      .sg-img-stage {
        min-height: 70vh;
        max-height: 80vh;
      }
      .sg-img-panel {
        max-width: none;
        width: 100%;
      }
    }

    /* ────────── MOBILE (max-width: 768px) ────────── */
    @media (max-width: 768px) {
      :root { --navbar-h: 60px; }
      .sg-back {
        margin: 15vh auto 0;
        padding: 0 16px;
      }
      .sg-hero {
        grid-template-columns: 1fr;
        gap: 28px;
        padding: 20px 16px 0;
      }
      .sg-img-panel {
        position: static;
        max-width: 400px;
        margin: 0 auto;
      }
      .sg-img-stage {
        min-height: 70vh;
        max-height: 80vh;
      }
      .sg-title {
        font-size: 1.4rem;
      }
      .sg-price {
        font-size: 1.4rem;
        margin-bottom: 20px;
      }
      .sg-related {
        margin: 40px auto 3vh;
        padding: 0 16px;
      }
      .sg-related-grid {
        gap: 14px;
      }
    }

    /* ────────── SMALL MOBILE (max-width: 480px) ────────── */
    @media (max-width: 480px) {
      :root { --navbar-h: 56px; }
      .sg-back {
        margin: 2vh auto 0;
      }
      .sg-title {
        font-size: 1.2rem;
      }
      .sg-price {
        font-size: 1.2rem;
      }
      .sg-cta-row {
        flex-direction: column;
      }
      .sg-btn-primary {
        width: 100%;
      }
      .sg-btn-icon {
        width: 44px;
        height: 44px;
        align-self: center;
      }
      .sg-related-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .sg-thumb {
        width: 50px;
        height: 66px;
      }
      .sg-img-stage {
        min-height: 40vh;
        max-height: 45vh;
      }
    }
  `;
  document.head.appendChild(s);
}

// ----------------------------------------------------------------------
// Lightbox Modal Component (updated with getImageUrl)
// ----------------------------------------------------------------------
const LightboxModal = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [dir, setDir] = useState(1);

  const goTo = (next) => {
    setDir(next > currentIndex ? 1 : -1);
    setCurrentIndex(next);
  };
  const prev = () => goTo(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  const next = () => goTo(currentIndex < images.length - 1 ? currentIndex + 1 : 0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -50 : 50, opacity: 0 }),
  };

  return (
    <div
      className="sg-lightbox-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.95)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <div
        className="sg-lightbox-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "70vw",
          maxHeight: "80vh",
          width: "100%",
          height: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            background: "none",
            border: "none",
            color: "white",
            fontSize: 28,
            cursor: "pointer",
            zIndex: 10001,
          }}
        >
          ✕
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: "absolute",
                left: -50,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                fontSize: 24,
              }}
            >
              ‹
            </button>
            <button
              onClick={next}
              style={{
                position: "absolute",
                right: -50,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                fontSize: 24,
              }}
            >
              ›
            </button>
          </>
        )}

        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.img
            key={currentIndex}
            src={getImageUrl(images[currentIndex])}
            alt={`full-${currentIndex}`}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: 8,
            }}
            onError={(e) => (e.target.src = "https://via.placeholder.com/800x1000?text=No+Image")}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              background: "rgba(0,0,0,0.6)",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 14,
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Image Slider (with click handler) – updated image URLs
// ----------------------------------------------------------------------
const ImageSlider = ({ images, onImageClick }) => {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const goTo = (next) => {
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  };
  const prev = () => goTo(idx > 0 ? idx - 1 : images.length - 1);
  const next = () => goTo(idx < images.length - 1 ? idx + 1 : 0);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [idx]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -50 : 50, opacity: 0 }),
  };

  if (!images.length) return null;

  // Convert all images to absolute URLs once
  const absoluteImages = images.map(getImageUrl);

  return (
    <div className="sg-img-panel">
      <div className="sg-img-stage" onClick={() => onImageClick?.(idx)}>
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.img
            key={idx}
            src={absoluteImages[idx]}
            alt={`product-${idx + 1}`}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            draggable={false}
            onError={(e) => (e.target.src = "https://via.placeholder.com/400x500?text=No+Image")}
          />
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button
              className="sg-arrow prev"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="sg-arrow next"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              <ChevronRight size={18} />
            </button>
            <div className="sg-img-counter">
              {idx + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="sg-dots">
          {absoluteImages.map((_, i) => (
            <button
              key={i}
              className={`sg-dot ${i === idx ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
      {images.length > 1 && (
        <div className="sg-thumbs">
          {absoluteImages.map((img, i) => (
            <img
              key={i}
              src={img}
              className={`sg-thumb ${i === idx ? "active" : ""}`}
              onClick={() => goTo(i)}
              alt={`thumb-${i}`}
              onError={(e) => (e.target.src = "https://via.placeholder.com/60x80?text=No+Image")}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// Related Card Component – updated image URL
// ----------------------------------------------------------------------
const RelatedCard = ({ product, onClick }) => {
const imageUrl = getImageUrl(
  product.mainImage || product.imageGallery?.[0]
);
console.log(imageUrl);
  return (
    <motion.div
      className="sg-related-card"
      onClick={() => onClick(product._id)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="sg-related-img-wrap">
        <img
          src={imageUrl}
          className="sg-related-img"
          alt={product.name}
          onError={(e) => (e.target.src = "https://via.placeholder.com/200x300?text=No+Image")}
        />
      </div>
      <div className="sg-related-body">
        <div className="sg-related-name">{product.name}</div>
        <div className="sg-related-price">Rs {product.price?.toLocaleString()}</div>
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const ClientViewSingleCloth = () => {
  const { clothId } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await apiBase.get(`/api/client/get/product/${clothId}`);
        setProduct(res.data.data);
        setRelated(res.data.relatedProducts || []);
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError(true);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    if (clothId) fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [clothId]);

  useEffect(() => {
    if (!loading && product && pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [loading, product]);

  // Build array of absolute image URLs for the product
  const images = product
    ? [product.mainImage, ...(product.imageGallery || [])]
        .filter(Boolean)
        .map(getImageUrl)
    : [];

  const ShimmerHero = () => (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 32px 0",
        display: "grid",
        gridTemplateColumns: "0.9fr 1.1fr",
        gap: 48,
      }}
    >
      <div>
        <div
          className="sg-shimmer"
          style={{ minHeight: "55vh", maxHeight: "60vh", borderRadius: 16 }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="sg-shimmer"
              style={{ width: 60, height: 80, borderRadius: 10 }}
            />
          ))}
        </div>
      </div>
      <div>
        <div
          className="sg-shimmer"
          style={{ height: 12, width: "30%", marginBottom: 16 }}
        />
        <div
          className="sg-shimmer"
          style={{ height: 32, width: "80%", marginBottom: 12 }}
        />
        <div
          className="sg-shimmer"
          style={{ height: 32, width: "40%", marginBottom: 28 }}
        />
        <div className="sg-shimmer" style={{ height: 1, marginBottom: 24 }} />
        {[100, 90, 75, 60].map((w, i) => (
          <div
            key={i}
            className="sg-shimmer"
            style={{ height: 12, width: `${w}%`, marginBottom: 10 }}
          />
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <div
            className="sg-shimmer"
            style={{ flex: 1, height: 48, borderRadius: 40 }}
          />
          <div
            className="sg-shimmer"
            style={{ width: 48, height: 48, borderRadius: "50%" }}
          />
        </div>
      </div>
    </div>
  );

  // Error state
  if (error && !loading) {
    return (
      <div className="sg-page">
        <Helmet>
          <title>Izel Studio - Product Not Found</title>
          <meta
            name="description"
            content="The product you are looking for does not exist."
          />
        </Helmet>
        <ClientNavbar />
        <div
          className="sg-main"
          style={{ textAlign: "center", paddingTop: "120px" }}
        >
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
              ❌ Product not found
            </p>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "#0f172a",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "40px",
                cursor: "pointer",
              }}
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayTitle = product
    ? `Izel Studio - ${product.metaTitle || product.name}`
    : "Izel Studio - Loading";
  const pageDescription =
    product?.metaDescription ||
    product?.description ||
    "Discover premium quality clothing at Izel Studio.";

  return (
    <div className="sg-page">
      <Helmet>
        <title>{displayTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={displayTitle} />
        <meta property="og:description" content={pageDescription} />
        {product?.mainImage && (
          <meta property="og:image" content={getImageUrl(product.mainImage)} />
        )}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <ToastContainer position="top-right" autoClose={3000} />
      <ClientNavbar />
      <div className="sg-main">
        {loading ? (
          <ShimmerHero />
        ) : product ? (
          <div ref={pageRef}>
            <div className="sg-back">
              <button className="sg-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={15} /> Back to Collection
              </button>
            </div>

            <div className="sg-hero">
              <ImageSlider
                images={[product.mainImage, ...(product.imageGallery || [])].filter(Boolean)}
                onImageClick={(index) => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
              />
              <div className="sg-info">
                {product.metaTitle && (
                  <div className="sg-category">
                    <FaTags size={11} color="var(--sg-gold)" />
                    {product.metaTitle}
                  </div>
                )}
                <h1 className="sg-title">{product.name}</h1>
                <div className="sg-price">
                  Rs {product.price?.toLocaleString()}
                </div>
                <div className="sg-divider" />
                {product.description && (
                  <p className="sg-desc">{product.description}</p>
                )}

                <div className="sg-meta-row">
                  {product.volume?.name && (
                    <span className="sg-meta-pill">
                      <Layers size={12} /> {product.volume.name}
                    </span>
                  )}
                  {product.createdAt && (
                    <span className="sg-meta-pill">
                      <Calendar size={12} />
                      {new Date(product.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  {images.length > 1 && (
                    <span className="sg-meta-pill">
                      <Tag size={12} /> {images.length} Photos
                    </span>
                  )}
                </div>

                <div className="sg-cta-row">
                    <a
                      href="https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you"
                      target="_blank"
                      rel="noreferrer"
                      className="sg-btn-primary"
                    >
                      <ShoppingBag size={17} /> Shop Now
                      <ExternalLink size={14} style={{ opacity: 0.7 }} />
                    </a>
                  <button
                    className="sg-btn-icon"
                    title="Share"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied!");
                      }
                    }}
                  >
                    <Share2 size={17} />
                  </button>
                </div>

                {product.volume && (
                  <div className="sg-volume-badge">
                    <FaStar size={12} color="var(--sg-gold)" />
                    <span>
                      From collection: <strong>{product.volume.name}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {related.length > 0 && (
              <div className="sg-related">
                <div className="sg-related-title">You May Also Like</div>
                <div className="sg-related-grid">
                  {related.map((p) => (
                    <RelatedCard
                      key={p._id}
                      product={p}
                      onClick={(id) => navigate(`/view/cloth/${id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
      <Footer />

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <LightboxModal
          images={[product.mainImage, ...(product.imageGallery || [])].filter(Boolean)}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default ClientViewSingleCloth;