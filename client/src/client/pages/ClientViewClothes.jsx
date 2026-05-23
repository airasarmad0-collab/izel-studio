import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Helmet } from "react-helmet-async";
import {
  Eye,
  X,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
  ArrowUpDown,
  Star,
  Heart,
  Info,
} from "lucide-react";
import { FaStar, FaTags } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientNavbar from "../components/ClientNavbar";
import Footer from "../components/Footer";
import apiBase from "../../common/api";

// ----------------------------------------------------------------------
// Helper: make image URL absolute (relative -> full URL)
// ----------------------------------------------------------------------
const API_BASE =
  import.meta.env.VITE_API_URL || "https://izel-studio.onrender.com";

const PRODUCTION_DOMAIN = "https://izelstudio.store";
const FALLBACK_DOMAIN = "https://izel-studio.onrender.com";

const getImageUrl = (url) => {
  if (!url) return null;

  // already full URL
  if (url.startsWith("http")) return url;

  const cleanPath = url.startsWith("/") ? url : `/${url}`;

  // ALWAYS prefer production domain for images
  return `${PRODUCTION_DOMAIN}${cleanPath}`;
};
// ----------------------------------------------------------------------
// Global styles (fully responsive)
// ----------------------------------------------------------------------
const STYLE_ID = "client-view-clothes-styles-v6";
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --client-bg: #f8fafc;
      --client-surface: #ffffff;
      --client-surface2: #f1f5f9;
      --client-border: #e2e8f0;
      --client-text: #0f172a;
      --client-muted: #64748b;
      --client-accent: #0f172a;
      --client-gold: #f59e0b;
      --navbar-h: 72px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .client-gallery {
      background: var(--client-bg);
      min-height: 100vh;
      color: var(--client-text);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
    }
    .client-main-content {
      flex: 1;
      padding-top: var(--navbar-h);
    }
    .client-header {
      max-width: 1300px;
      margin: 0 auto;
      padding: 48px 32px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      border-bottom: 1.5px solid var(--client-border);
      margin-bottom: 40px;
      width: 100%;
    }
    .client-volume-info {
      width: 100%;
      max-width: 680px;
      background: linear-gradient(135deg, #fff 0%, #fffbeb 100%);
      padding: 24px 28px 20px 32px;
      border-radius: 20px;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
      text-align: center;
      margin-top: 5vh;
    }
    .client-volume-info::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 5px; height: 100%;
      background: linear-gradient(180deg, var(--client-accent), var(--client-gold));
      border-radius: 20px 0 0 20px;
    }
    .client-volume-name {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .client-volume-desc {
      color: var(--client-muted);
      line-height: 1.5;
      margin-bottom: 14px;
      font-size: 0.88rem;
    }
    .client-volume-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      font-size: 0.72rem;
      color: var(--client-muted);
      border-top: 1px solid var(--client-border);
      padding-top: 12px;
      justify-content: center;
    }
    .client-meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .client-controls {
      width: 100%;
      max-width: 680px;
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }
    .client-search-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 400px;
    }
    .client-search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--client-muted);
    }
    .client-search {
      width: 100%;
      padding: 11px 16px 11px 42px;
      border-radius: 40px;
      border: 1.5px solid var(--client-border);
      background: var(--client-surface);
      font-size: 0.88rem;
      transition: all 0.2s;
      color: var(--client-text);
    }
    .client-search:focus {
      border-color: var(--client-accent);
      box-shadow: 0 0 0 3px rgba(15,23,42,0.08);
      outline: none;
    }
    .client-sort {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--client-surface);
      border: 1.5px solid var(--client-border);
      border-radius: 40px;
      padding: 8px 18px;
      font-size: 0.83rem;
      cursor: pointer;
      white-space: nowrap;
      transition: border-color 0.2s;
    }
    .client-sort:hover { border-color: var(--client-accent); }
    .client-sort select {
      background: transparent;
      border: none;
      outline: none;
      font-family: inherit;
      font-size: 0.83rem;
      cursor: pointer;
      color: var(--client-text);
    }
    .client-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 28px;
      padding: 0 32px 60px;
      max-width: 1300px;
      margin: 0 auto;
      width: 100%;
    }
    .client-card {
      background: var(--client-surface);
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.2,0,0,1), box-shadow 0.3s cubic-bezier(0.2,0,0,1);
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
      cursor: pointer;
      border-radius: 4px;
    }
    .client-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 32px -8px rgba(0,0,0,0.12);
    }
    .client-img-wrap {
      position: relative;
      aspect-ratio: 3/4;
      overflow: hidden;
      background: var(--client-surface2);
    }
    .client-img-main, .client-img-hover {
      position: absolute;
      inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      transition: opacity 0.45s ease, transform 0.6s ease;
    }
    .client-img-hover { opacity: 0; transform: scale(1.06); }
    .client-card:hover .client-img-main {
      opacity: 0;
      transform: scale(1.06);
    }
    .client-card:hover .client-img-hover {
      opacity: 1;
      transform: scale(1);
    }
    .client-card.no-hover-image:hover .client-img-main {
      opacity: 1;
      transform: scale(1.06);
    }
    .client-card.no-hover-image .client-img-hover {
      display: none;
    }
    .client-quick {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      background: rgba(255,255,255,0.96);
      backdrop-filter: blur(8px);
      padding: 13px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      cursor: pointer;
      z-index: 2;
    }
    .client-card:hover .client-quick { transform: translateY(0); }
    .client-body { padding: 16px; }
    .client-cat {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--client-muted);
      margin-bottom: 7px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .client-name {
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 0.95rem;
      line-height: 1.35;
      color: var(--client-text);
    }
    .client-price {
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--client-accent);
    }
    .client-detail-link {
      background: none;
      border: none;
      font-size: 0.68rem;
      text-decoration: underline;
      cursor: pointer;
      color: var(--client-muted);
      transition: color 0.2s;
    }
    .client-detail-link:hover { color: var(--client-accent); }
    .client-pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 14px;
      padding: 0 32px 72px;
    }
    .client-pagination-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 1.5px solid var(--client-border);
      background: var(--client-surface);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .client-pagination-btn:not(:disabled):hover {
      border-color: var(--client-accent);
      background: var(--client-accent);
      color: white;
    }
    .client-pagination-btn:disabled { opacity: 0.35; cursor: default; }
    .client-empty {
      text-align: center;
      padding: 80px 20px;
      color: var(--client-muted);
      font-size: 1rem;
      grid-column: 1 / -1;
    }
    .client-shimmer {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
      border-radius: 4px;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    /* Modal styles */
    .client-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.78);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9000;
      padding: 20px;
      padding-top:2vh;
    }
    .client-modal {
      background: #fff;
      border-radius: 28px;
      max-width: 900px;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-height: 90vh;
      min-height: 90vh;
      padding-top: 5vh;
      padding-left:5vh;
      overflow: hidden;
      position: relative;
      box-shadow: 0 24px 60px rgba(0,0,0,0.3);
    }
    .client-modal-close {
      position: absolute;
      top: 14px; right: 14px;
      width: 38px; height: 38px;
      border-radius: 50%;
      background: #0f172a;
      border: 2.5px solid #fff;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      box-shadow: 0 2px 14px rgba(0,0,0,0.4);
      transition: transform 0.22s, background 0.22s;
    }
    .client-modal-close:hover {
      transform: rotate(90deg) scale(1.1);
      background: #ef4444;
    }
    .client-modal-img-wrap {
      position: relative;
      overflow: hidden;
      background: #f1f5f9;
      display: flex;
      flex-direction: column;
    }
    .modal-img-stage {
      position: relative;
      flex: 1;
      overflow: hidden;
      cursor: zoom-in;
    }
    .modal-img-stage img {
      position: absolute;
      inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease;
    }
    .modal-img-stage:hover img { transform: scale(1.08); }
    .modal-img-arrow {
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
      z-index: 10;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      transition: background 0.2s, transform 0.2s;
    }
    .modal-img-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
    .modal-img-arrow.prev { left: 10px; }
    .modal-img-arrow.next { right: 10px; }
    .modal-img-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      padding: 10px 0 12px;
      background: #fff;
      flex-shrink: 0;
    }
    .modal-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #cbd5e1;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: background 0.2s, transform 0.2s;
    }
    .modal-dot.active {
      background: var(--client-accent);
      transform: scale(1.35);
    }
    .modal-thumb-strip {
      display: flex;
      gap: 8px;
      padding: 0 12px 14px;
      background: #fff;
      overflow-x: auto;
      justify-content: center;
      flex-shrink: 0;
    }
    .modal-thumb-strip::-webkit-scrollbar { display: none; }
    .modal-thumb {
      width: 52px; height: 68px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      flex-shrink: 0;
      transition: border-color 0.2s, transform 0.2s;
    }
    .modal-thumb:hover { transform: scale(1.05); }
    .modal-thumb.active { border-color: var(--client-accent); }
    .client-modal-right {
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    .client-buy-btn {
      background: var(--client-accent);
      color: white;
      padding: 13px 20px;
      text-align: center;
      border-radius: 40px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.88rem;
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: opacity 0.2s;
    }
    .client-buy-btn:hover { opacity: 0.85; }
    .detail-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 32px 60px;
    }
    .back-button {
      background: none;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 32px;
      cursor: pointer;
      font-size: 0.88rem;
      color: var(--client-text);
      transition: opacity 0.2s;
    }
    .back-button:hover { opacity: 0.65; }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }
    .detail-main-img {
      width: 100%;
      aspect-ratio: 3/4;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.09);
    }
    .thumb-list {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      overflow-x: auto;
    }
    .thumb-img {
      width: 70px;
      height: 90px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border 0.2s;
    }
    .thumb-img.active { border-color: var(--client-accent); }
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--client-border);
      border-top-color: var(--client-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    /* Responsive */
    @media (max-width: 1024px) {
      :root { --navbar-h: 64px; }
      .client-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; padding: 0 24px 48px; }
    }
    @media (max-width: 768px) {
      :root { --navbar-h: 60px; }
      .client-header { padding: 32px 16px 24px; gap: 20px; margin-bottom: 24px; }
      .client-volume-info { max-width: 100%; padding: 20px 20px 16px 26px; text-align: left; margin-top: 10vh; }
      .client-volume-name { justify-content: flex-start; font-size: 1.25rem; }
      .client-volume-meta { justify-content: flex-start; }
      .client-controls { max-width: 100%; flex-direction: column; }
      .client-search-wrap { max-width: 100%; width: 100%; }
      .client-sort { width: 100%; justify-content: space-between; }
      .client-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; padding: 0 16px 40px; }
      .client-body { padding: 12px; }
      .client-name { font-size: 0.85rem; }
      .client-price { font-size: 0.9rem; }
      .client-modal { grid-template-columns: 1fr; border-radius: 20px; max-height: 92vh; overflow-y: auto; }
      .client-modal-img-wrap { min-height: 300px; }
      .modal-img-stage { min-height: 300px; }
      .client-modal-right { padding: 20px; }
      .detail-grid { grid-template-columns: 1fr; gap: 24px; }
      .detail-container { padding: 24px 16px 48px; }
      .back-button { margin-bottom: 20px; }
      .detail-main-img { aspect-ratio: 1/1; }
    }
    @media (max-width: 480px) {
      :root { --navbar-h: 56px; }
      .client-header { padding: 24px 12px 20px; }
      .client-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 0 12px 36px; }
      .client-body { padding: 9px; }
      .client-name { font-size: 0.78rem; }
      .client-price { font-size: 0.82rem; }
      .client-cat { font-size: 0.58rem; }
      .client-volume-name { font-size: 1.1rem; }
      .client-pagination-btn { width: 34px; height: 34px; }
    }
  `;
  document.head.appendChild(style);
}

/* ----------------------------------------------------------------------
   QUICK SHOP MODAL
---------------------------------------------------------------------- */
const QuickShopModal = React.memo(({ product, onClose, onNavigateDetail }) => {
  const allImages = useMemo(() => {
    const imgs = [product.mainImage, ...(product.imageGallery || [])].filter(
      Boolean,
    );
    return imgs.map(getImageUrl);
  }, [product.mainImage, product.imageGallery]);

  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const goTo = useCallback(
    (next) => {
      setDir(next > idx ? 1 : -1);
      setIdx(next);
    },
    [idx],
  );

  const prev = useCallback(
    () => goTo(idx > 0 ? idx - 1 : allImages.length - 1),
    [idx, allImages.length, goTo],
  );
  const next = useCallback(
    () => goTo(idx < allImages.length - 1 ? idx + 1 : 0),
    [idx, allImages.length, goTo],
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  if (!product) return null;

  return (
    <div className="client-modal-overlay" onClick={onClose}>
      <motion.div
        className="client-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.93, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 24 }}
        transition={{ duration: 0.32 }}
      >
        <button className="client-modal-close" onClick={onClose}>
          <X size={18} strokeWidth={2.5} color="#fff" />
        </button>

        <div className="client-modal-img-wrap">
          <div className="modal-img-stage">
            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.img
                key={idx}
                src={allImages[idx]}
                alt={product.name}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                draggable={false}
              />
            </AnimatePresence>
            {allImages.length > 1 && (
              <>
                <button
                  className="modal-img-arrow prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                >
                  <ChevronLeft size={18} strokeWidth={2} color="#0f172a" />
                </button>
                <button
                  className="modal-img-arrow next"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                >
                  <ChevronRight size={18} strokeWidth={2} color="#0f172a" />
                </button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="modal-img-dots">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  className={`modal-dot ${i === idx ? "active" : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          )}
          {allImages.length > 1 && (
            <div className="modal-thumb-strip">
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`modal-thumb ${i === idx ? "active" : ""}`}
                  onClick={() => goTo(i)}
                  alt=""
                />
              ))}
            </div>
          )}
        </div>

        <div className="client-modal-right">
          <div className="client-cat">
            <FaTags size={11} /> {product.metaTitle || "Product"}
          </div>
          <h2
            style={{ fontSize: "1.45rem", fontWeight: 700, margin: "0 0 8px" }}
          >
            {product.name}
          </h2>
          <div
            className="client-price"
            style={{ fontSize: "1.25rem", marginBottom: 16 }}
          >
            Rs {product.price?.toLocaleString()}
          </div>
          <p style={{ color: "var(--client-muted)", lineHeight: 1.65 }}>
            {product.description || "No description available."}
          </p>
          <a
            href="https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you"
            target="_blank"
            rel="noreferrer"
            className="client-buy-btn"
            style={{
              display: "inline-flex",
              width: "auto",
              padding: "13px 32px",
              marginTop: 24,
            }}
          >
            <ShoppingBag size={17} /> Shop Now
          </a>
          <button
            onClick={() => {
              onClose();
              onNavigateDetail(product._id);
            }}
            style={{
              marginTop: 12,
              background: "none",
              border: "1.5px solid #e2e8f0",
              padding: "10px 18px",
              borderRadius: 40,
              cursor: "pointer",
              width: "100%",
            }}
          >
            View Full Details →
          </button>
        </div>
      </motion.div>
    </div>
  );
});
QuickShopModal.displayName = "QuickShopModal";

/* ----------------------------------------------------------------------
   PRODUCT CARD
---------------------------------------------------------------------- */
const ProductCard = React.memo(
  ({ product, index, onQuickView, onNavigateDetail, cardRef }) => {
    const hasHover = product.imageGallery && product.imageGallery.length > 0;
    const mainImageUrl = getImageUrl(product.mainImage);
    const hoverImageUrl = hasHover
      ? getImageUrl(product.imageGallery[0])
      : null;

    return (
      <motion.div
        ref={cardRef}
        className={`client-card ${!hasHover ? "no-hover-image" : ""}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        onClick={() => onNavigateDetail(product._id)}
      >
        <div className="client-img-wrap">
          <img
            src={mainImageUrl}
            className="client-img-main"
            alt={product.name}
            loading="lazy"
          />
          {hasHover && (
            <img
              src={hoverImageUrl}
              className="client-img-hover"
              alt="hover"
              loading="lazy"
            />
          )}
          <div
            className="client-quick"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
          >
            <Eye size={13} /> Quick Shop
          </div>
        </div>
        <div className="client-body">
          {product.metaTitle && (
            <div className="client-cat">
              <FaStar size={9} /> {product.metaTitle}
            </div>
          )}
          <div className="client-name">{product.name}</div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span className="client-price">
              Rs {product.price?.toLocaleString()}
            </span>
            <button
              className="client-detail-link"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateDetail(product._id);
              }}
            >
              Details
            </button>
          </div>
        </div>
      </motion.div>
    );
  },
);
ProductCard.displayName = "ProductCard";

/* ----------------------------------------------------------------------
   PRODUCT LISTING (GRID)
---------------------------------------------------------------------- */
const ProductListing = ({ volumeId }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [volume, setVolume] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const cardRefs = useRef([]);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(sortBy && { sortBy }),
      });
      const res = await apiBase.get(
        `/api/client/get-all/products/${volumeId}?${params}`,
      );
      setProducts(res.data.data || []);
      setVolume(res.data.volume);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load collection");
    } finally {
      setLoading(false);
    }
  }, [volumeId, page, debouncedSearch, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy]);

  const ShimmerCard = () => (
    <div className="client-card" style={{ pointerEvents: "none" }}>
      <div className="client-shimmer" style={{ aspectRatio: "3/4" }} />
      <div style={{ padding: 16 }}>
        <div
          className="client-shimmer"
          style={{ height: 10, width: "38%", marginBottom: 8 }}
        />
        <div
          className="client-shimmer"
          style={{ height: 14, width: "68%", marginBottom: 8 }}
        />
        <div className="client-shimmer" style={{ height: 12, width: "28%" }} />
      </div>
    </div>
  );

  const volumeTitle = volume
    ? `Izel Studio - ${volume.name}`
    : "Izel Studio - Collection";
  const volumeDescription =
    volume?.metaDescription ||
    volume?.description ||
    "Discover our exclusive clothing collection.";

  return (
    <>
      <Helmet>
        <title>{volumeTitle}</title>
        <meta name="description" content={volumeDescription} />
        <meta property="og:title" content={volumeTitle} />
        <meta property="og:description" content={volumeDescription} />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="client-header">
        {volume && (
          <div className="client-volume-info">
            <div className="client-volume-name">{volume.name}</div>
            {volume.description && (
              <div className="client-volume-desc">{volume.description}</div>
            )}
            <div className="client-volume-meta">
              {volume.metaTitle && (
                <div className="client-meta-item">
                  <Info size={12} />
                  <span>{volume.metaTitle}</span>
                </div>
              )}
              {volume.tags?.length > 0 && (
                <div className="client-meta-item">
                  <FaTags size={12} />
                  <span>{volume.tags.slice(0, 3).join(", ")}</span>
                </div>
              )}
              {volume.createdAt && (
                <div className="client-meta-item">
                  <Heart size={12} />
                  <span>
                    Added {new Date(volume.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="client-controls">
          <div className="client-search-wrap">
            <Search size={15} className="client-search-icon" />
            <input
              className="client-search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="client-sort">
            <ArrowUpDown size={14} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">Default (Newest)</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="client-grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <ShimmerCard key={i} />)
        ) : products.length === 0 ? (
          <div className="client-empty">✨ No products found</div>
        ) : (
          products.map((p, idx) => (
            <ProductCard
              key={p._id}
              product={p}
              index={idx}
              onQuickView={setSelectedProduct}
              onNavigateDetail={(id) => navigate(`/view/cloth/${id}`)}
              cardRef={(el) => (cardRefs.current[idx] = el)}
            />
          ))
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="client-pagination">
          <button
            className="client-pagination-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            {page} / {totalPages}
          </span>
          <button
            className="client-pagination-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
          <QuickShopModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onNavigateDetail={(id) => navigate(`/view/cloth/${id}`)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ----------------------------------------------------------------------
   PRODUCT DETAIL PAGE
---------------------------------------------------------------------- */
const ProductDetail = ({ clothid }) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const detailRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiBase.get(`/api/client/get/product/${clothid}`);
        const prod = res.data.data;
        setProduct(prod);
        setActiveImage(getImageUrl(prod.mainImage));
      } catch (error) {
        console.error(error);
        toast.error("Product not found");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [clothid, navigate]);

  useEffect(() => {
    if (!loading && product && detailRef.current) {
      gsap.fromTo(
        detailRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
    }
  }, [loading, product]);

  if (loading)
    return (
      <div className="detail-container">
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      </div>
    );
  if (!product) return null;

  const allImages = useMemo(() => {
    const imgs = [product.mainImage, ...(product.imageGallery || [])].filter(
      Boolean,
    );
    return imgs.map(getImageUrl);
  }, [product.mainImage, product.imageGallery]);

  return (
    <div className="detail-container" ref={detailRef}>
      <Helmet>
        <title>{product.metaTitle || product.name}</title>
        <meta
          name="description"
          content={product.metaDescription || product.description || ""}
        />
        {product.mainImage && (
          <meta property="og:image" content={getImageUrl(product.mainImage)} />
        )}
      </Helmet>
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to Collection
      </button>
      <div className="detail-grid">
        <div>
          <img
            src={activeImage}
            alt={product.name}
            className="detail-main-img"
            loading="eager"
          />
          {allImages.length > 1 && (
            <div className="thumb-list">
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`thumb-img ${activeImage === img ? "active" : ""}`}
                  onClick={() => setActiveImage(img)}
                  alt=""
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="client-cat">
            <FaTags size={12} /> {product.metaTitle || "Collection Piece"}
          </div>
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 700,
              margin: "12px 0 10px",
            }}
          >
            {product.name}
          </h1>
          <div
            className="client-price"
            style={{ fontSize: "1.6rem", marginBottom: 20 }}
          >
            Rs {product.price?.toLocaleString()}
          </div>
          <p style={{ lineHeight: 1.7, color: "var(--client-muted)" }}>
            {product.description || "No description available."}
          </p>
          {product.purchasingLink ? (
            <a
              href={product.purchasingLink}
              target="_blank"
              rel="noreferrer"
              className="client-buy-btn"
              style={{
                display: "inline-flex",
                width: "auto",
                padding: "13px 32px",
                marginTop: 24,
              }}
            >
              <ShoppingBag size={17} /> Purchase Now
            </a>
          ) : (
            <button
              disabled
              style={{
                background: "#cbd5e1",
                padding: "13px 32px",
                border: "none",
                borderRadius: 40,
                fontWeight: 600,
                marginTop: 24,
                cursor: "not-allowed",
              }}
            >
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------------
   MAIN ENTRY
---------------------------------------------------------------------- */
const ClientViewClothes = () => {
  const { volumeId, clothId } = useParams();
  return (
    <div className="client-gallery">
      <ToastContainer position="top-right" autoClose={3000} />
      <ClientNavbar />
      <div className="client-main-content">
        {clothId ? (
          <ProductDetail clothid={clothId} />
        ) : volumeId ? (
          <ProductListing volumeId={volumeId} />
        ) : (
          <div className="client-empty">Invalid collection or product</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ClientViewClothes;
