import React, { useEffect, useRef, useState, useMemo } from "react";
import logo from "../../../public/logo.png";
import apiBase from "../../common/api";

import { Menu, X, Home } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { FaSquareInstagram } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";

/* ─────────────────────────────────────────────
   MARQUEE KEYFRAMES  (injected once, safely)
───────────────────────────────────────────── */
if (typeof document !== "undefined") {
  const id = "__izel_marquee__";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes izelMarquee {
        0%   { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
      }
      .izel-marquee-inner {
        display: inline-block;
        white-space: nowrap;
        animation: izelMarquee 18s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }
}

/* ─────────────────────────────────────────────
   SOCIAL ICONS
───────────────────────────────────────────── */
const SocialLinks = ({ style = {} }) => (
  <div style={{ display: "flex", gap: "18px", alignItems: "center", ...style }}>
    <a href="https://www.facebook.com/share/1Eh4ZHHBWi" target="_blank" rel="noreferrer" style={socialIconStyle} aria-label="Facebook">
      <FaFacebook size={18} />
    </a>
    <a href="https://www.instagram.com/izelstudi.o?igsh=MWJyYjYyMGduYXg4Mg==" target="_blank" rel="noreferrer" style={socialIconStyle} aria-label="Instagram">
      <FaSquareInstagram size={18} />
    </a>
    <a href="https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you" target="_blank" rel="noreferrer" style={socialIconStyle} aria-label="WhatsApp">
      <IoLogoWhatsapp size={18} />
    </a>
    <a href="https://youtube.com/@breezafashion6958?si=PeM4bVX1ls_4hsx8" target="_blank" rel="noreferrer" style={socialIconStyle} aria-label="WhatsApp">
      <FaYoutube   size={18} />
    </a>
  </div>
);

const socialIconStyle = {
  color: "#1a1a1a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  
  transition: "opacity 0.2s",
};

/* ─────────────────────────────────────────────
   FRAMER VARIANTS
───────────────────────────────────────────── */
const drawerVariants = {
  closed: { x: "-100%", opacity: 0 },
  open: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 340, damping: 36 },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.28, ease: "easeInOut" },
  },
};

const drawerItemVariants = {
  closed: { opacity: 0, x: -16 },
  open: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.06 + i * 0.04, duration: 0.3, ease: "easeOut" },
  }),
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const ClientNavbar = () => {
  const megaRef = useRef(null);
  const timeoutRef = useRef(null);

  const [volumes, setVolumes] = useState([]);
  const [megaOpen, setMegaOpen] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const perPage = 10;

  /* ── Responsive detection ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Fetch volumes ── */
  useEffect(() => {
    const fetchVolumes = async () => {
      try {
        const res = await apiBase.get("/api/client/get-all/volumes");
        setVolumes(res?.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch volumes:", err);
      }
    };
    fetchVolumes();
  }, []);

  /* ── Lock scroll ── */
  useEffect(() => {
    document.body.style.overflow = openMobile || megaOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openMobile, megaOpen]);

  /* ── Desktop mega GSAP ── */
  const openMega = () => {
    clearTimeout(timeoutRef.current);
    setMegaOpen(true);
  };

  const closeMega = () => {
    timeoutRef.current = setTimeout(() => setMegaOpen(false), 200);
  };

  useEffect(() => {
    if (!megaRef.current) return;
    gsap.to(megaRef.current, {
      height: megaOpen ? "auto" : 0,
      paddingTop: megaOpen ? 24 : 0,
      paddingBottom: megaOpen ? 32 : 0,
      opacity: megaOpen ? 1 : 0,
      duration: 0.45,
      ease: "power3.inOut",
    });
    if (megaOpen) {
      gsap.fromTo(
        megaRef.current.querySelectorAll(".mega-vol-card"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, stagger: 0.04, delay: 0.15, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [megaOpen]);

  /* ── Filtered / paginated ── */
  const filtered = useMemo(
    () => volumes.filter((v) => v.name.toLowerCase().includes(search.toLowerCase())),
    [volumes, search]
  );

  const pages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  /* ── Reset page on search ── */
  useEffect(() => setPage(1), [search]);

  /* ───────────────────── RENDER ───────────────────── */
  return (
    <div style={{ position: "fixed", top: 0, width: "100%", zIndex: 999 }}>

      {/* ── TOP MARQUEE ── */}
      <div style={topBarStyle}>
        <div className="izel-marquee-inner">
          {Array(3).fill(null).map((_, i) => (
            <span key={i} style={{ marginRight: "80px" }}>
              ✦ Izel Studio — Luxury Fashion &nbsp;•&nbsp; Modern Design &nbsp;•&nbsp; Premium Ecommerce Experience
            </span>
          ))}
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav style={navStyle}>

        {/* LEFT — Volume names (desktop) / Hamburger (mobile) */}
        <div style={leftStyle}>
          {isMobile ? (
            <button style={hamburgerStyle} onClick={() => setOpenMobile(true)} aria-label="Open menu">
              <Menu size={26} strokeWidth={1.6} />
            </button>
          ) : (
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "nowrap", overflow: "hidden" }}>
              <Link to="/" style={navLinkStyle}>
                <Home size={15} strokeWidth={1.8} />
                <span>Home</span>
              </Link>
              <div
                style={{ ...navLinkStyle, position: "relative" }}
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <span>Volumes</span>
                <span style={{ fontSize: "10px", marginTop: "1px", opacity: 0.6 }}>▾</span>
              </div>
            </div>
          )}
        </div>

        {/* CENTER — Logo */}
        <div style={centerStyle}>
          <Link to="/">
            <img src={logo} alt="Izel Studio" style={logoStyle} />
          </Link>
        </div>

        {/* RIGHT — Social icons */}
        <div style={rightStyle}>
          <SocialLinks />
        </div>

      </nav>

      {/* ── DESKTOP MEGA MENU ── */}
      {!isMobile && (
        <div
          ref={megaRef}
          style={megaWrapStyle}
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
        >
          <input
            style={searchStyle}
            placeholder="Search volumes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div style={gridStyle}>
            {paginated.map((v) => (
              <Link
                key={v._id}
                to={`/view/volume/${v._id}`}
                className="mega-vol-card"
                style={cardStyle}
                onClick={() => setMegaOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#2a2a2a";
                  e.currentTarget.style.borderColor = "#555";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.borderColor = "#2e2e2e";
                }}
              >
                {v.name}
              </Link>
            ))}
          </div>

          {pages > 1 && (
            <div style={paginationStyle}>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    ...pageBtn,
                    background: page === i + 1 ? "#fff" : "transparent",
                    color: page === i + 1 ? "#000" : "#aaa",
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE DRAWER (Framer Motion) ── */}
      <AnimatePresence>
        {openMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={backdropStyle}
              onClick={() => setOpenMobile(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="exit"
              style={drawerStyle}
            >
              {/* Header */}
              <div style={drawerHeaderStyle}>
                <img src={logo} alt="Izel Studio" style={{ height: "52px" }} />
                <button style={hamburgerStyle} onClick={() => setOpenMobile(false)} aria-label="Close menu">
                  <X size={24} strokeWidth={1.6} />
                </button>
              </div>

              {/* Home */}
              <motion.div custom={0} variants={drawerItemVariants} initial="closed" animate="open">
                <Link
                  to="/"
                  style={drawerLinkStyle}
                  onClick={() => setOpenMobile(false)}
                >
                  <Home size={16} strokeWidth={1.6} />
                  <span>Home</span>
                </Link>
              </motion.div>

              {/* Volume links */}
              {volumes.map((v, i) => (
                <motion.div key={v._id} custom={i + 1} variants={drawerItemVariants} initial="closed" animate="open">
                  <Link
                    to={`/view/volume/${v._id}`}
                    style={drawerLinkStyle}
                    onClick={() => setOpenMobile(false)}
                  >
                    {v.name}
                  </Link>
                </motion.div>
              ))}

              {/* Social — bottom of drawer */}
              <motion.div
                custom={volumes.length + 2}
                variants={drawerItemVariants}
                initial="closed"
                animate="open"
                style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid #eee" }}
              >
                <p style={{ fontSize: "11px", color: "#999", marginBottom: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Follow Us
                </p>
                <SocialLinks />
              </motion.div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ClientNavbar;

/* ─────────────────────────────────────────────
   STATIC STYLES
───────────────────────────────────────────── */

const topBarStyle = {
  background: "#111",
  color: "#e8e8e8",
  fontSize: "12px",
  letterSpacing: "0.06em",
  padding: "7px 0",
  overflow: "hidden",
  whiteSpace: "nowrap",
};

const navStyle = {
  height: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 32px",
  background: "#fff",
  borderBottom: "1px solid #e8e8e8",
  position: "relative",
  zIndex: 1000,
};

const leftStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
};

const centerStyle = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
};

const logoStyle = {
  height: "12vh",
  marginTop: "2vh",
  objectFit: "contain",
  display: "block",
};

const rightStyle = {
  flex: 1,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
};

const navLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "13px",
  fontWeight: 500,
  color: "#1a1a1a",
  textDecoration: "none",
  letterSpacing: "0.03em",
  padding: "6px 10px",
  borderRadius: "4px",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "background 0.18s",
};

const hamburgerStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: "4px",
  color: "#1a1a1a",
};

/* ── Mega ── */
const megaWrapStyle = {
  position: "fixed",
  top: "109px", // topBar(34) + nav(80) - 5 overlap
  left: 0,
  width: "100vw",
  background: "#0d0d0d",
  color: "#fff",
  overflow: "hidden",
  padding: "0 48px",
  height: 0,
  opacity: 0,
  zIndex: 998,
  boxSizing: "border-box",
};

const searchStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "10px",
  marginTop: "18px",
};

const cardStyle = {
  background: "#1a1a1a",
  border: "1px solid #2e2e2e",
  padding: "12px 14px",
  borderRadius: "7px",
  textAlign: "center",
  cursor: "pointer",
  textDecoration: "none",
  color: "#e0e0e0",
  fontSize: "13px",
  fontWeight: 500,
  transition: "background 0.2s, border-color 0.2s",
  display: "block",
  letterSpacing: "0.02em",
};

const paginationStyle = {
  display: "flex",
  gap: "8px",
  justifyContent: "center",
  marginTop: "20px",
};

const pageBtn = {
  border: "1px solid #444",
  borderRadius: "4px",
  padding: "4px 12px",
  cursor: "pointer",
  fontSize: "13px",
  transition: "all 0.18s",
};

/* ── Mobile Drawer ── */
const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 10000,
  backdropFilter: "blur(3px)",
};

const drawerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "min(320px, 85vw)",
  height: "100vh",
  background: "#fff",
  zIndex: 10001,
  display: "flex",
  flexDirection: "column",
  padding: "20px 24px 32px",
  overflowY: "auto",
  boxShadow: "4px 0 32px rgba(0,0,0,0.12)",
};

const drawerHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "28px",
};

const drawerLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "13px 0",
  borderBottom: "1px solid #e8e8e8",
  fontSize: "15px",
  color: "#1a1a1a",
  textDecoration: "none",
  fontWeight: 450,
  letterSpacing: "0.02em",
};