import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Eye, ChevronLeft, ChevronRight, X, ZoomIn, Heart } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import apiBase from "../../common/api";

gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------------------------
// Helper: convert relative image URL to absolute (use your backend origin)
// ----------------------------------------------------------------------
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseUrl}${url}`;
};

// ----------------------------------------------------------------------
// GLOBAL STYLES (updated with conditional hover classes)
// ----------------------------------------------------------------------
const STYLE_ID = "cf-white-v2";
if (!document.getElementById(STYLE_ID)) {
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = `
    .cf-w {
      --bg:        #FAFAF8;
      --surface:   #FFFFFF;
      --surface2:  #F3F2EE;
      --border:    rgba(0,0,0,0.08);
      --border-hi: rgba(0,0,0,0.22);
      --text:      #111110;
      --muted:     rgba(17,17,16,0.42);
      --ease:      cubic-bezier(0.22, 1, 0.36, 1);
      --accent:    #c41e3a;
    }
    .cf-w *, .cf-w *::before, .cf-w *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .cf-w {
      background: var(--bg);
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      padding: 60px 0 88px;
      overflow: hidden;
      position: relative;
    }

    /* ── HEADER ── */
    .cf-w-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 64px 52px;
      gap: 24px;
      opacity: 0;
      flex-wrap: wrap;
    }
    .cf-w-eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.6rem;
      font-weight: 500;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 14px;
    }
    .cf-w-eyebrow::before {
      content: '';
      display: block;
      width: 28px;
      height: 1px;
      background: var(--muted);
    }
    .cf-w-eyebrow .heart-icon {
      color: var(--accent);
    }
    .cf-w-heading {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2rem, 4.5vw, 3.6rem);
      font-weight: 300;
      line-height: 1.0;
      color: var(--text);
      letter-spacing: -0.01em;
    }
    .cf-w-heading em {
      font-style: italic;
      font-weight: 300;
      color: rgba(17,17,16,0.5);
    }
    .cf-w-header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 16px;
      flex-shrink: 0;
    }
    .cf-w-header-right p {
      font-size: 0.75rem;
      color: var(--muted);
    }

    /* ── GRID LAYOUT ── */
    .cf-w-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
      padding: 0 64px;
    }

    /* ── CARD ── */
    .cf-w-card {
      background: var(--surface);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--border);
      position: relative;
      transition: box-shadow 0.4s var(--ease), border-color 0.3s, transform 0.3s var(--ease);
      cursor: pointer;
      opacity: 0;
      transform: translateY(30px);
    }
    .cf-w-card.animated {
      opacity: 1;
      transform: translateY(0);
    }
    .cf-w-card:hover {
      border-color: rgba(0,0,0,0.14);
      box-shadow: 0 8px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
      transform: translateY(-6px);
    }

    /* image wrap */
    .cf-w-img-wrap {
      position: relative;
      overflow: hidden;
      aspect-ratio: 3/4;
      background: var(--surface2);
    }

    /* main + hover images - only apply hover effects if hover image exists */
    .cf-w-img-main {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity 0.55s var(--ease), transform 0.85s var(--ease);
    }
    .cf-w-img-hover {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0;
      transform: scale(1.05);
      transition: opacity 0.55s var(--ease), transform 0.85s var(--ease);
    }
    
    /* Only apply hover transition when card has hover image */
    .cf-w-card.has-hover:hover .cf-w-img-main {
      opacity: 0;
      transform: scale(1.05);
    }
    .cf-w-card.has-hover:hover .cf-w-img-hover {
      opacity: 1;
      transform: scale(1.0);
    }
    
    /* If no hover image, just scale on hover */
    .cf-w-card.no-hover:hover .cf-w-img-main {
      transform: scale(1.06);
    }
    
    /* Fallback for when there's only one image */
    .cf-w-card:hover .cf-w-img-main:only-child {
      transform: scale(1.06);
    }

    /* favourite badge */
    .cf-w-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      background: rgba(255,255,255,0.88);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 2px;
      font-size: 0.56rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent);
      padding: 5px 11px;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .cf-w-badge svg {
      width: 10px;
      height: 10px;
    }

    /* quick view btn */
    .cf-w-quick {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 15px 16px;
      background: rgba(255,255,255,0.94);
      backdrop-filter: blur(14px);
      border-top: 1px solid rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      font-family: 'Outfit', sans-serif;
      font-size: 0.62rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--text);
      cursor: pointer;
      transform: translateY(100%);
      transition: transform 0.4s var(--ease), background 0.2s;
      z-index: 3;
    }
    .cf-w-card:hover .cf-w-quick {
      transform: translateY(0);
    }
    .cf-w-quick:hover {
      background: rgba(17,17,16,0.07);
    }

    /* body */
    .cf-w-body {
      padding: 18px 18px 20px;
      border-top: 1px solid var(--border);
    }
    .cf-w-cat {
      font-size: 0.58rem;
      font-weight: 400;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .cf-w-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem;
      font-weight: 400;
      line-height: 1.25;
      color: var(--text);
      margin-bottom: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cf-w-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .cf-w-price {
      font-family: 'Outfit', sans-serif;
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--text);
      letter-spacing: 0.04em;
    }
    .cf-w-shop-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.58rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
      background: none;
      border: none;
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      transition: color 0.2s;
      padding: 0;
      text-decoration: none;
    }
    .cf-w-shop-btn:hover {
      color: var(--text);
    }

    /* ── SHIMMER ── */
    .cf-w-shimmer {
      background: linear-gradient(90deg, #F3F2EE 25%, #ECEAE5 50%, #F3F2EE 75%);
      background-size: 200% 100%;
      animation: cf-shim 1.5s infinite;
    }
    @keyframes cf-shim {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .cf-w-skel-card {
      background: #fff;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.07);
    }
    .cf-w-skel-img {
      aspect-ratio: 3/4;
      width: 100%;
    }
    .cf-w-skel-body {
      padding: 18px 18px 20px;
      border-top: 1px solid rgba(0,0,0,0.07);
    }
    .cf-w-error {
      padding: 60px 64px;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      color: rgba(17,17,16,0.35);
      text-transform: uppercase;
      text-align: center;
    }

    /* ── MODAL OVERLAY ── */
    .cf-w-overlay {
      position: fixed;
      inset: 0;
      background: rgba(250,250,248,0.7);
      backdrop-filter: blur(16px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }

    /* ── MODAL ── */
    .cf-w-modal {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 8px;
      width: 100%;
      max-width: 860px;
      max-height: 90vh;
      overflow-y: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      position: relative;
      box-shadow: 0 32px 80px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06);
    }
    @media (max-width: 640px) {
      .cf-w-modal {
        grid-template-columns: 1fr;
      }
    }
    .cf-w-modal::-webkit-scrollbar {
      width: 3px;
    }
    .cf-w-modal::-webkit-scrollbar-track {
      background: #fff;
    }
    .cf-w-modal::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.15);
      border-radius: 3px;
    }

    .cf-w-modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--surface2);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 5;
      transition: background 0.2s, border-color 0.2s;
    }
    .cf-w-modal-close:hover {
      background: var(--text);
      color: #fff;
      border-color: var(--text);
    }

    /* modal left */
    .cf-w-modal-left {
      position: relative;
      overflow: hidden;
      border-radius: 8px 0 0 8px;
    }
    .cf-w-modal-main-img {
      width: 100%;
      aspect-ratio: 3/4;
      object-fit: cover;
      display: block;
    }
    .cf-w-modal-thumbs {
      display: flex;
      gap: 2px;
      padding: 2px;
      background: var(--surface2);
    }
    .cf-w-modal-thumb {
      flex: 1;
      aspect-ratio: 1;
      object-fit: cover;
      cursor: pointer;
      opacity: 0.45;
      border: 2px solid transparent;
      transition: opacity 0.2s, border-color 0.2s;
    }
    .cf-w-modal-thumb.active,
    .cf-w-modal-thumb:hover {
      opacity: 1;
      border-color: rgba(0,0,0,0.35);
    }

    /* modal right */
    .cf-w-modal-right {
      padding: 48px 36px 36px;
      display: flex;
      flex-direction: column;
    }
    .cf-w-modal-cat {
      font-size: 0.6rem;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .cf-w-modal-name {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 400;
      line-height: 1.15;
      color: var(--text);
      margin-bottom: 16px;
    }
    .cf-w-modal-price {
      font-size: 1.05rem;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 24px;
      letter-spacing: 0.04em;
    }
    .cf-w-modal-hr {
      height: 1px;
      background: var(--border);
      margin-bottom: 22px;
    }
    .cf-w-modal-desc {
      font-size: 0.84rem;
      font-weight: 300;
      line-height: 1.8;
      color: var(--muted);
      margin-bottom: 32px;
      flex: 1;
    }
    .cf-w-modal-buy {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 15px;
      border-radius: 3px;
      background: var(--text);
      color: #fff;
      font-family: 'Outfit', sans-serif;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      text-decoration: none;
      border: 1px solid var(--text);
      cursor: pointer;
      transition: opacity 0.2s;
      margin-bottom: 10px;
    }
    .cf-w-modal-buy:hover {
      opacity: 0.8;
    }
    .cf-w-modal-view {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px;
      border-radius: 3px;
      border: 1px solid var(--border-hi);
      background: transparent;
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      font-size: 0.7rem;
      font-weight: 400;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .cf-w-modal-view:hover {
      background: var(--surface2);
    }

    /* ── RESPONSIVE STYLES ── */
    @media (max-width: 1024px) {
      .cf-w-grid {
        gap: 20px;
        padding: 0 32px;
      }
    }

    @media (max-width: 768px) {
      .cf-w {
        padding: 40px 0 60px;
      }
      .cf-w-header {
        padding: 0 20px 32px;
        flex-direction: column;
        align-items: flex-start;
      }
      .cf-w-header-right {
        width: 100%;
        flex-direction: row;
        justify-content: flex-start;
      }
      .cf-w-header-right p {
        font-size: 0.7rem;
      }
      .cf-w-grid {
        padding: 0 20px;
        gap: 16px;
        grid-template-columns: repeat(2, 1fr);
      }
      .cf-w-body {
        padding: 14px 14px 16px;
      }
      .cf-w-name {
        font-size: 1rem;
        margin-bottom: 10px;
      }
      .cf-w-price {
        font-size: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .cf-w-header {
        padding: 0 16px 24px;
      }
      .cf-w-header-right p {
        display: none;
      }
      .cf-w-grid {
        padding: 0 16px;
        gap: 14px;
        grid-template-columns: 1fr;
      }
      .cf-w-card {
        max-width: 100%;
      }
    }
  `;
  document.head.appendChild(tag);
}

// ----------------------------------------------------------------------
// Quick Modal (updated for galleryImage)
// ----------------------------------------------------------------------
const QuickModal = ({ product, onClose, onNavigate }) => {
  const [activeImg, setActiveImg] = useState(null);
  const [allImgs, setAllImgs] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    const main = getImageUrl(product.mainImage);
    const gallery = product.galleryImage ? getImageUrl(product.galleryImage) : null;
    const images = [main, gallery].filter(Boolean);
    setAllImgs(images);
    setActiveImg(main);
  }, [product]);

  useEffect(() => {
    if (!modalRef.current) return;
    const els = modalRef.current.querySelectorAll(".cf-gsap-in");
    gsap.fromTo(
      els,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  if (!activeImg) return null;

  return (
    <motion.div
      className="cf-w-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        className="cf-w-modal"
        initial={{ opacity: 0, scale: 0.96, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="cf-w-modal-close" onClick={onClose}>
          <X size={14} />
        </button>

        <div className="cf-w-modal-left">
          <motion.img
            key={activeImg}
            src={activeImg}
            className="cf-w-modal-main-img"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            alt={product.name}
            onError={(e) => (e.target.src = "https://via.placeholder.com/400x500?text=Image+Not+Found")}
          />
          {allImgs.length > 1 && (
            <div className="cf-w-modal-thumbs">
              {allImgs.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`cf-w-modal-thumb ${activeImg === img ? "active" : ""}`}
                  onClick={() => setActiveImg(img)}
                  alt=""
                  onError={(e) => (e.target.src = "https://via.placeholder.com/100x100?text=No+Image")}
                />
              ))}
            </div>
          )}
        </div>

        <div className="cf-w-modal-right">
          <p className="cf-w-modal-cat cf-gsap-in">{product.metaTitle || "Customer Favourite"}</p>
          <h2 className="cf-w-modal-name cf-gsap-in">{product.name}</h2>
          <p className="cf-w-modal-price cf-gsap-in">Rs {product.price?.toLocaleString()}</p>
          <div className="cf-w-modal-hr cf-gsap-in" />
          <p className="cf-w-modal-desc cf-gsap-in">
            {product.description || "A beautifully crafted piece, loved by our customers."}
          </p>
          <a
            href={product.purchasingLink || "https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you"}
            target="_blank"
            rel="noreferrer"
            className="cf-w-modal-buy cf-gsap-in"
          >
            <ShoppingBag size={13} /> Shop Now
          </a>
          <button
            className="cf-w-modal-view cf-gsap-in"
            onClick={() => { onClose(); onNavigate(product._id); }}
          >
            <ZoomIn size={13} /> Full Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// Product Card (updated with conditional hover effect)
// ----------------------------------------------------------------------
const ProductCard = ({ p, index, onQuickView, onNavigate }) => {
  const cardRef = useRef(null);
  const hasHover = !!p.galleryImage;
  const mainImage = getImageUrl(p.mainImage);
  const hoverImage = hasHover ? getImageUrl(p.galleryImage) : null;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        delay: index * 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
          once: true,
        }
      });
    });
    return () => ctx.revert();
  }, [index]);

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView(p);
  };

  return (
    <div
      ref={cardRef}
      className={`cf-w-card ${hasHover ? "has-hover" : "no-hover"}`}
      style={{ opacity: 0, transform: "translateY(30px)" }}
      onClick={() => onNavigate(p._id)}
    >
      <div className="cf-w-img-wrap">
        <img
          src={mainImage}
          className="cf-w-img-main"
          alt={p.name}
          draggable={false}
          onError={(e) => (e.target.src = "https://via.placeholder.com/400x500?text=No+Image")}
        />
        {hasHover && hoverImage && (
          <img
            src={hoverImage}
            className="cf-w-img-hover"
            alt={p.name}
            draggable={false}
            loading="lazy"
            onError={(e) => {
              // If hover image fails to load, hide it and update classes
              e.target.style.display = "none";
              const card = e.target.closest('.cf-w-card');
              if (card) {
                card.classList.remove('has-hover');
                card.classList.add('no-hover');
              }
            }}
          />
        )}
        <span className="cf-w-badge">
          <Heart size={10} fill="#c41e3a" /> Customer Favourite
        </span>
        <div className="cf-w-quick" onClick={handleQuickView}>
          <Eye size={11} />
          Quick View
        </div>
      </div>
      <div className="cf-w-body">
        <p className="cf-w-cat">{p.metaTitle || "Best Seller"}</p>
        <h3 className="cf-w-name">{p.name}</h3>
        <div className="cf-w-foot">
          <span className="cf-w-price">Rs {p.price?.toLocaleString()}</span>
          <a
            href={p.purchasingLink || "https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you"}
            target="_blank"
            rel="noreferrer"
            className="cf-w-shop-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <ShoppingBag size={10} /> Shop Now
          </a>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const CustomersFavourites = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await apiBase.get("/api/client/customers-favorites/products");
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setProducts(data);
      } catch (err) {
        console.error("CustomersFavourites fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!headerRef.current || loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 85%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [loading]);

  return (
    <section className="cf-w" ref={sectionRef}>
      <div className="cf-w-header" ref={headerRef}>
        <div>
          <p className="cf-w-eyebrow">
            <Heart size={12} className="heart-icon" style={{ display: "inline", marginRight: "8px" }} />
            Handpicked For You
          </p>
          <h2 className="cf-w-heading">Customer's <em>Favourites</em></h2>
        </div>
        <div className="cf-w-header-right">
          <p>Trending picks loved by our community</p>
        </div>
      </div>

      <div className="cf-w-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cf-w-skel-card">
              <div className="cf-w-skel-img cf-w-shimmer" />
              <div className="cf-w-skel-body">
                <div className="cf-w-shimmer" style={{ height: 10, width: "40%", borderRadius: 3, marginBottom: 8 }} />
                <div className="cf-w-shimmer" style={{ height: 18, width: "70%", borderRadius: 3, marginBottom: 14 }} />
                <div className="cf-w-shimmer" style={{ height: 11, width: "28%", borderRadius: 3 }} />
              </div>
            </div>
          ))
        ) : error ? (
          <p className="cf-w-error">Could not load favourites — please try again later.</p>
        ) : products.length === 0 ? (
          <p className="cf-w-error">No favourite products available at the moment.</p>
        ) : (
          products.map((p, i) => (
            <ProductCard
              key={p._id}
              p={p}
              index={i}
              onQuickView={(prod) => setSelectedProduct(prod)}
              onNavigate={(id) => navigate(`/view/cloth/${id}`)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <QuickModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onNavigate={(id) => navigate(`/view/cloth/${id}`)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default CustomersFavourites;