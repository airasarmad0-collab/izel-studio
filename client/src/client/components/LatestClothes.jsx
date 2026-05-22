import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  ZoomIn,
} from "lucide-react";
import apiBase from "../../common/api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
// GLOBAL STYLES (with reduced modal size on both desktop and mobile)
// ----------------------------------------------------------------------
const STYLE_ID = "lc-white-v2";
if (!document.getElementById(STYLE_ID)) {
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = `
    .lc-w {
      --bg:        #FAFAF8;
      --surface:   #FFFFFF;
      --surface2:  #F3F2EE;
      --border:    rgba(0,0,0,0.08);
      --border-hi: rgba(0,0,0,0.22);
      --text:      #111110;
      --muted:     rgba(17,17,16,0.42);
      --ease:      cubic-bezier(0.22, 1, 0.36, 1);
    }
    .lc-w *, .lc-w *::before, .lc-w *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .lc-w {
      background: var(--bg);
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      padding: 60px 0 88px;
      overflow: hidden;
      position: relative;
    }

    /* ── HEADER ── */
    .lc-w-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 64px 52px;
      gap: 24px;
      opacity: 0;
      flex-wrap: wrap;
    }
    .lc-w-eyebrow {
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
    .lc-w-eyebrow::before {
      content: '';
      display: block;
      width: 28px;
      height: 1px;
      background: var(--muted);
    }
    .lc-w-heading {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2rem, 4.5vw, 3.6rem);
      font-weight: 300;
      line-height: 1.0;
      color: var(--text);
      letter-spacing: -0.01em;
    }
    .lc-w-heading em { font-style: italic; font-weight: 300; color: rgba(17,17,16,0.5); }
    .lc-w-header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 16px;
      flex-shrink: 0;
    }
    .lc-w-header-right p {
      font-size: 0.75rem;
      color: var(--muted);
    }
    .lc-w-nav {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .lc-w-nav-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid var(--border-hi);
      background: var(--surface);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.22s ease;
      z-index: 10;
      position: relative;
    }
    .lc-w-nav-btn:hover {
      background: var(--text);
      color: var(--bg);
      transform: scale(1.05);
    }
    .lc-w-nav-btn:active {
      transform: scale(0.95);
    }
    .lc-w-nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }
    .lc-w-nav-btn:disabled:hover {
      background: transparent;
      color: var(--text);
      transform: none;
    }
    .lc-w-view-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      padding-bottom: 1px;
      transition: color 0.2s, border-color 0.2s;
    }
    .lc-w-view-link:hover {
      color: var(--text);
      border-color: var(--border-hi);
    }

    /* ── TRACK ── */
    .lc-w-track-outer {
      padding: 0 64px;
      overflow: hidden;
      position: relative;
    }
    .lc-w-track {
      display: flex;
      gap: 18px;
      user-select: none;
      cursor: grab;
      will-change: transform;
    }
    .lc-w-track:active {
      cursor: grabbing;
    }

    /* ── CARD ── */
    .lc-w-card {
      flex-shrink: 0;
      width: calc((100vw - 128px - 36px) / 3.28);
      min-width: 260px;
      max-width: 340px;
      background: var(--surface);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--border);
      position: relative;
      transition: box-shadow 0.4s var(--ease), border-color 0.3s, opacity 0.35s;
      cursor: pointer;
    }
    .lc-w-card.is-active {
      border-color: rgba(0,0,0,0.14);
      box-shadow: 0 8px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
    }
    .lc-w-card.is-peek {
      opacity: 0.42;
    }

    /* image wrap */
    .lc-w-img-wrap {
      position: relative;
      overflow: hidden;
      aspect-ratio: 3/4;
      background: var(--surface2);
    }

    /* main + hover images - only apply hover effects if hover image exists */
    .lc-w-img-main {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity 0.55s var(--ease), transform 0.85s var(--ease);
    }
    .lc-w-img-hover {
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
    /* Only apply hover transition when card is active AND has hover image */
    .lc-w-card.is-active.has-hover:hover .lc-w-img-main {
      opacity: 0;
      transform: scale(1.05);
    }
    .lc-w-card.is-active.has-hover:hover .lc-w-img-hover {
      opacity: 1;
      transform: scale(1.0);
    }
    /* If no hover image, just scale on hover */
    .lc-w-card.is-active.no-hover:hover .lc-w-img-main {
      transform: scale(1.06);
    }
    .lc-w-card.is-active:hover .lc-w-img-main:only-child {
      transform: scale(1.06);
    }

    /* category tag */
    .lc-w-tag {
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
      color: rgba(17,17,16,0.65);
      padding: 5px 11px;
      z-index: 2;
    }

    /* quick view btn */
    .lc-w-quick {
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
    .lc-w-card.is-active:hover .lc-w-quick {
      transform: translateY(0);
    }
    .lc-w-quick:hover {
      background: rgba(17,17,16,0.07);
    }

    /* body */
    .lc-w-body {
      padding: 18px 18px 20px;
      border-top: 1px solid var(--border);
    }
    .lc-w-cat {
      font-size: 0.58rem;
      font-weight: 400;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .lc-w-name {
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
    .lc-w-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .lc-w-price {
      font-family: 'Outfit', sans-serif;
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--text);
      letter-spacing: 0.04em;
    }
    .lc-w-shop-btn {
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
    .lc-w-shop-btn:hover {
      color: var(--text);
    }

    /* ── SHIMMER ── */
    .lc-w-shimmer {
      background: linear-gradient(90deg, #F3F2EE 25%, #ECEAE5 50%, #F3F2EE 75%);
      background-size: 200% 100%;
      animation: lc-shim 1.5s infinite;
    }
    @keyframes lc-shim {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .lc-w-skel-card {
      flex-shrink: 0;
      width: calc((100vw - 128px - 36px) / 3.28);
      min-width: 260px;
      max-width: 340px;
      background: #fff;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.07);
    }
    .lc-w-skel-img {
      aspect-ratio: 3/4;
      width: 100%;
    }
    .lc-w-skel-body {
      padding: 18px 18px 20px;
      border-top: 1px solid rgba(0,0,0,0.07);
    }
    .lc-w-error {
      padding: 60px 64px;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      color: rgba(17,17,16,0.35);
      text-transform: uppercase;
      text-align: center;
    }

    /* ── DOTS ── */
    .lc-w-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding-top: 44px;
    }
    .lc-w-dot {
      height: 2px;
      background: rgba(17,17,16,0.18);
      transition: width 0.38s var(--ease), background 0.35s;
      cursor: pointer;
      border-radius: 2px;
    }
    .lc-w-dot.active {
      background: rgba(17,17,16,0.75);
    }

    /* ── MODAL OVERLAY ── */
    .lc-w-overlay {
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

    /* ── MODAL - REDUCED SIZE FOR BOTH DESKTOP AND MOBILE ── */
    .lc-w-modal {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 12px;
      width: 100%;
      max-width: 680px;
      max-height: 85vh;
      overflow-y: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      position: relative;
      box-shadow: 0 32px 80px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06);
    }

    /* Desktop modal content adjustments */
    .lc-w-modal-left {
      position: relative;
      overflow: hidden;
      border-radius: 12px 0 0 12px;
      background: var(--surface2);
    }
    .lc-w-modal-main-img {
      width: 100%;
      aspect-ratio: 1/1;
      object-fit: cover;
      display: block;
    }
    .lc-w-modal-thumbs {
      display: flex;
      gap: 4px;
      padding: 8px;
      background: #fff;
      border-top: 1px solid var(--border);
    }
    .lc-w-modal-thumb {
      width: 50px;
      height: 50px;
      object-fit: cover;
      cursor: pointer;
      opacity: 0.55;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: opacity 0.2s, border-color 0.2s;
    }
    .lc-w-modal-thumb.active,
    .lc-w-modal-thumb:hover {
      opacity: 1;
      border-color: rgba(0,0,0,0.35);
    }

    .lc-w-modal-right {
      padding: 28px 28px 32px;
      display: flex;
      flex-direction: column;
    }
    .lc-w-modal-cat {
      font-size: 0.55rem;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 10px;
    }
    .lc-w-modal-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 400;
      line-height: 1.2;
      color: var(--text);
      margin-bottom: 10px;
    }
    .lc-w-modal-price {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 16px;
      letter-spacing: 0.04em;
    }
    .lc-w-modal-hr {
      height: 1px;
      background: var(--border);
      margin-bottom: 18px;
    }
    .lc-w-modal-desc {
      font-size: 0.78rem;
      font-weight: 300;
      line-height: 1.6;
      color: var(--muted);
      margin-bottom: 24px;
      flex: 1;
    }
    .lc-w-modal-buy {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 6px;
      background: var(--text);
      color: #fff;
      font-family: 'Outfit', sans-serif;
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      text-decoration: none;
      border: 1px solid var(--text);
      cursor: pointer;
      transition: opacity 0.2s;
      margin-bottom: 8px;
    }
    .lc-w-modal-buy:hover {
      opacity: 0.8;
    }
    .lc-w-modal-view {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 16px;
      border-radius: 6px;
      border: 1px solid var(--border-hi);
      background: transparent;
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      font-size: 0.65rem;
      font-weight: 400;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .lc-w-modal-view:hover {
      background: var(--surface2);
    }

    .lc-w-modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.95);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: background 0.2s, border-color 0.2s;
    }
    .lc-w-modal-close:hover {
      background: var(--text);
      color: #fff;
      border-color: var(--text);
    }

    /* ── MODAL MOBILE STYLES (even smaller) ── */
    @media (max-width: 640px) {
      .lc-w-overlay {
        padding: 12px;
        align-items: flex-end;
      }
      .lc-w-modal {
        max-width: 100%;
        max-height: 80vh;
        border-radius: 16px 16px 0 0;
        grid-template-columns: 1fr;
      }
      .lc-w-modal-left {
        border-radius: 16px 16px 0 0;
        overflow: hidden;
      }
      .lc-w-modal-main-img {
        aspect-ratio: 1/1;
        max-height: 40vh;
        object-fit: contain;
        background: #fafaf8;
      }
      .lc-w-modal-right {
        padding: 20px 18px 24px;
      }
      .lc-w-modal-name {
        font-size: 1.2rem;
        margin-bottom: 6px;
      }
      .lc-w-modal-price {
        font-size: 0.85rem;
        margin-bottom: 12px;
      }
      .lc-w-modal-desc {
        font-size: 0.72rem;
        margin-bottom: 18px;
        line-height: 1.5;
      }
      .lc-w-modal-buy,
      .lc-w-modal-view {
        padding: 10px 14px;
        font-size: 0.6rem;
      }
      .lc-w-modal-thumbs {
        display: flex;
        gap: 6px;
        padding: 8px;
        overflow-x: auto;
      }
      .lc-w-modal-thumb {
        width: 45px;
        height: 45px;
        flex-shrink: 0;
        border-radius: 6px;
      }
      .lc-w-modal-cat {
        font-size: 0.5rem;
        margin-bottom: 6px;
      }
      .lc-w-modal-hr {
        margin-bottom: 14px;
      }
    }

    @media (max-width: 480px) {
      .lc-w-modal-right {
        padding: 16px 14px 20px;
      }
      .lc-w-modal-name {
        font-size: 1.1rem;
      }
      .lc-w-modal-price {
        font-size: 0.8rem;
      }
      .lc-w-modal-desc {
        font-size: 0.68rem;
        margin-bottom: 14px;
      }
      .lc-w-modal-buy,
      .lc-w-modal-view {
        padding: 9px 12px;
        font-size: 0.55rem;
      }
      .lc-w-modal-thumb {
        width: 40px;
        height: 40px;
      }
    }

    .lc-w-modal::-webkit-scrollbar {
      width: 3px;
    }
    .lc-w-modal::-webkit-scrollbar-track {
      background: #fff;
    }
    .lc-w-modal::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.15);
      border-radius: 3px;
    }

    /* ── RESPONSIVE STYLES FOR MAIN COMPONENT ── */
    @media (max-width: 1024px) {
      .lc-w-header {
        padding: 0 32px 40px;
      }
      .lc-w-track-outer {
        padding: 0 32px;
      }
      .lc-w-card,
      .lc-w-skel-card {
        width: calc((100vw - 64px - 36px) / 2.5);
        min-width: 240px;
      }
    }

    @media (max-width: 768px) {
      .lc-w {
        padding: 40px 0 60px;
      }
      .lc-w-header {
        padding: 0 20px 32px;
        flex-direction: column;
        align-items: flex-start;
      }
      .lc-w-header-right {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .lc-w-header-right p {
        font-size: 0.7rem;
      }
      .lc-w-nav {
        gap: 8px;
      }
      .lc-w-nav-btn {
        width: 40px;
        height: 40px;
      }
      .lc-w-nav-btn svg {
        width: 18px;
        height: 18px;
      }
      .lc-w-track-outer {
        padding: 0 20px;
      }
      .lc-w-card,
      .lc-w-skel-card {
        width: calc(100vw - 40px - 18px);
        min-width: 260px;
        max-width: 320px;
      }
      .lc-w-track {
        gap: 14px;
      }
      .lc-w-dots {
        padding-top: 32px;
      }
      .lc-w-dot {
        height: 2px;
      }
      .lc-w-dot.active {
        width: 28px !important;
      }
    }

    @media (max-width: 480px) {
      .lc-w-header {
        padding: 0 16px 24px;
      }
      .lc-w-header-right p {
        display: none;
      }
      .lc-w-nav-btn {
        width: 38px;
        height: 38px;
        background: var(--surface);
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      .lc-w-track-outer {
        padding: 0 16px;
      }
      .lc-w-card,
      .lc-w-skel-card {
        width: calc(100vw - 32px - 14px);
        min-width: 240px;
      }
      .lc-w-body {
        padding: 14px 14px 16px;
      }
      .lc-w-name {
        font-size: 1rem;
        margin-bottom: 10px;
      }
      .lc-w-price {
        font-size: 0.75rem;
      }
      .lc-w-dots {
        padding-top: 24px;
        gap: 4px;
      }
      .lc-w-dot {
        height: 2px;
      }
      .lc-w-dot.active {
        width: 24px !important;
      }
    }
  `;
  document.head.appendChild(tag);
}

// ----------------------------------------------------------------------
// Quick Modal
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
    const els = modalRef.current.querySelectorAll(".lc-gsap-in");
    gsap.fromTo(
      els,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  if (!activeImg) return null;

  return (
    <motion.div
      className="lc-w-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        className="lc-w-modal"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lc-w-modal-close" onClick={onClose}>
          <X size={14} />
        </button>

        <div className="lc-w-modal-left">
          <motion.img
            key={activeImg}
            src={activeImg}
            className="lc-w-modal-main-img"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            alt={product.name}
            onError={(e) => (e.target.src = "https://via.placeholder.com/400x500?text=Image+Not+Found")}
          />
          {allImgs.length > 1 && (
            <div className="lc-w-modal-thumbs">
              {allImgs.map((img, i) => (
                <img
                  key={`${product._id}-thumb-${i}`}
                  src={img}
                  className={`lc-w-modal-thumb ${activeImg === img ? "active" : ""}`}
                  onClick={() => setActiveImg(img)}
                  alt=""
                  onError={(e) => (e.target.src = "https://via.placeholder.com/100x100?text=No+Image")}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lc-w-modal-right">
          <p className="lc-w-modal-cat lc-gsap-in">{product.metaTitle || "Collection"}</p>
          <h2 className="lc-w-modal-name lc-gsap-in">{product.name}</h2>
          <p className="lc-w-modal-price lc-gsap-in">Rs {product.price?.toLocaleString()}</p>
          <div className="lc-w-modal-hr lc-gsap-in" />
          <p className="lc-w-modal-desc lc-gsap-in">
            {product.description || "A beautifully crafted piece, designed with precision and care."}
          </p>
          <a
            href={product.purchasingLink || "https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you"}
            target="_blank"
            rel="noreferrer"
            className="lc-w-modal-buy lc-gsap-in"
          >
            <ShoppingBag size={12} /> Shop Now
          </a>
          <button
            className="lc-w-modal-view lc-gsap-in"
            onClick={() => {
              onClose();
              onNavigate(product._id);
            }}
          >
            <ZoomIn size={12} /> Full Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// Product Card
// ----------------------------------------------------------------------
const ProductCard = ({ p, index, isActive, isPeek, onQuickView, onNavigate, onPeekClick }) => {
  const cardRef = useRef(null);
  const hasHover = !!p.galleryImage;
  const mainImage = getImageUrl(p.mainImage);
  const hoverImage = hasHover ? getImageUrl(p.galleryImage) : null;

  const handleClick = () => {
    if (isPeek) {
      onPeekClick();
      return;
    }
    if (isActive) onNavigate(p._id);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView(p);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`lc-w-card ${isActive ? "is-active" : ""} ${isPeek ? "is-peek" : ""} ${hasHover ? "has-hover" : "no-hover"}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: isPeek ? 0.42 : 1, y: 0 }}
      transition={{ duration: 0.65, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isActive ? { y: -4 } : {}}
      onClick={handleClick}
    >
      <div className="lc-w-img-wrap">
        <img
          src={mainImage}
          className="lc-w-img-main"
          alt={p.name}
          draggable={false}
          onError={(e) => (e.target.src = "https://via.placeholder.com/400x500?text=No+Image")}
        />
        {hasHover && hoverImage && (
          <img
            src={hoverImage}
            className="lc-w-img-hover"
            alt={p.name}
            draggable={false}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              const card = e.target.closest('.lc-w-card');
              if (card) {
                card.classList.remove('has-hover');
                card.classList.add('no-hover');
              }
            }}
          />
        )}
        {p.metaTitle && <span className="lc-w-tag">{p.metaTitle}</span>}
        {isActive && (
          <div className="lc-w-quick" onClick={handleQuickView}>
            <Eye size={11} />
            Quick View
          </div>
        )}
      </div>
      <div className="lc-w-body">
        <p className="lc-w-cat">{p.metaTitle || "Collection"}</p>
        <h3 className="lc-w-name">{p.name}</h3>
        <div className="lc-w-foot">
          <span className="lc-w-price">Rs {p.price?.toLocaleString()}</span>
          <a
            href={p.purchasingLink || "https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you"}
            target="_blank"
            rel="noreferrer"
            className="lc-w-shop-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <ShoppingBag size={10} /> Shop Now
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const LatestClothes = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const VISIBLE = useRef(3);

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 768) VISIBLE.current = 1;
      else if (window.innerWidth < 1024) VISIBLE.current = 2;
      else VISIBLE.current = 3;
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await apiBase.get("/api/client/latest/products?limit=9");
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setProducts(data);
      } catch (err) {
        console.error("LatestClothes fetch error:", err);
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
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: headerRef.current, start: "top 85%", once: true } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [loading]);

  const maxIdx = Math.max(0, products.length - VISIBLE.current);
  const scrollTo = useCallback(
    (idx) => {
      const clamped = Math.max(0, Math.min(idx, maxIdx));
      setActiveIdx(clamped);
      if (!trackRef.current || !trackRef.current.children[0]) return;
      const card = trackRef.current.children[0];
      const w = card.getBoundingClientRect().width + 18;
      gsap.to(trackRef.current, { x: -(clamped * w), duration: 0.65, ease: "power3.out" });
    },
    [maxIdx]
  );

  useEffect(() => {
    if (products.length) scrollTo(0);
  }, [products, scrollTo]);

  const dragStart = (e) => {
    setDragging(false);
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    const current = gsap.getProperty(trackRef.current, "x");
    startScroll.current = typeof current === "number" ? current : 0;
    gsap.killTweensOf(trackRef.current);
  };
  const dragMove = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const d = startX.current - x;
    if (Math.abs(d) > 5) setDragging(true);
    gsap.set(trackRef.current, { x: startScroll.current - d });
  };
  const dragEnd = (e) => {
    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const d = startX.current - x;
    if (Math.abs(d) > 55) scrollTo(d > 0 ? activeIdx + 1 : activeIdx - 1);
    else scrollTo(activeIdx);
    setTimeout(() => setDragging(false), 60);
  };

  const dotCount = maxIdx + 1;

  return (
    <section className="lc-w" ref={sectionRef}>
      <div className="lc-w-header" ref={headerRef}>
        <div>
          <p className="lc-w-eyebrow">New Arrivals</p>
          <h2 className="lc-w-heading">Latest <em>Collection</em></h2>
        </div>
        <div className="lc-w-header-right">
          <p>Discover our newest arrivals</p>
          <div className="lc-w-nav">
            <button className="lc-w-nav-btn" onClick={() => scrollTo(activeIdx - 1)} disabled={activeIdx === 0}>
              <ChevronLeft size={18} />
            </button>
            <button className="lc-w-nav-btn" onClick={() => scrollTo(activeIdx + 1)} disabled={activeIdx >= maxIdx}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="lc-w-track-outer">
        {loading ? (
          <div className="lc-w-track" style={{ pointerEvents: "none" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="lc-w-skel-card">
                <div className="lc-w-skel-img lc-w-shimmer" />
                <div className="lc-w-skel-body">
                  <div className="lc-w-shimmer" style={{ height: 10, width: "40%", borderRadius: 3, marginBottom: 8 }} />
                  <div className="lc-w-shimmer" style={{ height: 18, width: "70%", borderRadius: 3, marginBottom: 14 }} />
                  <div className="lc-w-shimmer" style={{ height: 11, width: "28%", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="lc-w-error">Could not load products — please try again later.</p>
        ) : products.length === 0 ? (
          <p className="lc-w-error">No products found.</p>
        ) : (
          <div
            ref={trackRef}
            className="lc-w-track"
            onMouseDown={dragStart}
            onMouseMove={(e) => e.buttons === 1 && dragMove(e)}
            onMouseUp={dragEnd}
            onMouseLeave={(e) => e.buttons === 1 && dragEnd(e)}
            onTouchStart={dragStart}
            onTouchMove={dragMove}
            onTouchEnd={dragEnd}
          >
            {products.map((p, i) => {
              const isActive = i >= activeIdx && i < activeIdx + VISIBLE.current;
              const isPeek = i === activeIdx + VISIBLE.current;
              return (
                <ProductCard
                  key={p._id || `product-${i}`}
                  p={p}
                  index={i}
                  isActive={isActive}
                  isPeek={isPeek}
                  onQuickView={(prod) => !dragging && setSelectedProduct(prod)}
                  onNavigate={(id) => navigate(`/view/cloth/${id}`)}
                  onPeekClick={() => scrollTo(i - VISIBLE.current + 1)}
                />
              );
            })}
          </div>
        )}
      </div>

      {!loading && !error && dotCount > 1 && (
        <div className="lc-w-dots">
          {Array.from({ length: dotCount }).map((_, i) => (
            <div
              key={`dot-${i}`}
              className={`lc-w-dot ${i === activeIdx ? "active" : ""}`}
              style={{ width: i === activeIdx ? 32 : 14 }}
              onClick={() => scrollTo(i)}
            />
          ))}
        </div>
      )}

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

export default LatestClothes;