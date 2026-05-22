import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Box,
  User,
  Mail,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  Bell,
  Plus,
  Eye,
  Activity,
  CheckCircle,
  Info,
} from "lucide-react";
import apiBase from "../../common/api";

const WholeContantDashbaord = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 640;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, adminRes] = await Promise.all([
          apiBase.get("/api/admin/app/stats"),
          apiBase.get("/api/admin/details"),
        ]);

        setStats(statsRes.data.data);
        setAdmin(adminRes.data.data);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
      );

      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 20, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.6,
        },
      );
    }
  }, [loading]);

  const cardData = [
    {
      title: "Products",
      value: stats?.productCount || 0,
      icon: <Package />,
    },
    {
      title: "Volumes",
      value: stats?.volumeCount || 0,
      icon: <Box />,
    },
    {
      title: "Admin",
      value: admin?.name || "---",
      icon: <User />,
    },
    {
      title: "Email",
      value: admin?.email || "---",
      icon: <Mail />,
    },
  ];

  return (
    <div style={styles.wrapper}>
      <div ref={containerRef} style={styles.inner}>
        {/* ───── BANNER ───── */}
        <motion.div style={styles.banner}>
          <div>
            <h2>Welcome 👋 {admin?.name || "Admin"}</h2>

            <p>Manage your ecommerce system smoothly.</p>

            <div style={styles.bannerBtns}>
              <button
                onClick={() => navigate("/admin/dashboard/create/volume")}
                style={styles.btnPrimary}
              >
                <Plus size={14} /> Create Volume
              </button>

              <button
                onClick={() => navigate("/admin/dashboard")}
                style={styles.btnSecondary}
              >
                <Eye size={14} /> View Dashboard
              </button>
            </div>
          </div>

          {!isMobile && <Sparkles size={30} />}
        </motion.div>

        {/* ───── STATS ───── */}
        <div style={styles.grid}>
          {cardData.map((item, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              style={styles.card}
            >
              <div style={styles.cardTop}>
                <div style={styles.iconBox}>{item.icon}</div>
                <TrendingUp size={14} />
              </div>

              <h2 style={styles.value}>{item.value}</h2>
              <p style={styles.label}>{item.title}</p>
            </div>
          ))}
        </div>

        {/* ───── INSIGHTS ───── */}
        <div style={styles.row}>
          <div style={styles.bigCard}>
            <Zap />
            <h3>Performance Boost</h3>
            <p>Backend optimized and running smoothly.</p>
          </div>

          <div style={styles.bigCard2}>
            <Shield />
            <h3>Security Status</h3>
            <p>JWT auth active & protected routes enabled.</p>
          </div>
        </div>

        {/* ───── NEW: RECENT ACTIVITY ───── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Activity size={16} /> Recent Activity
          </h3>

          <div style={styles.list}>
            <div style={styles.item}>
              <CheckCircle size={14} /> New product added
            </div>
            <div style={styles.item}>
              <CheckCircle size={14} /> Volume created
            </div>
            <div style={styles.item}>
              <CheckCircle size={14} /> Admin login successful
            </div>
          </div>
        </div>

        {/* ───── NEW: SYSTEM STATUS ───── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Info size={16} /> System Status
          </h3>

          <p style={styles.smallText}>
            All systems operational. API latency is stable and database is
            synced.
          </p>
        </div>

        {/* ───── NEW: QUICK TIP ───── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>💡 Quick Tip</h3>

          <p style={styles.smallText}>
            Keep adding volumes regularly to improve product organization and
            SEO performance.
          </p>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

/* ───── STYLES ───── */
const styles = {
  wrapper: {
    minHeight: "100vh",
    padding: 16,
    background:
      "radial-gradient(circle at top, #0b1220 0%, #0f172a 60%, #111827 100%)",
  },

  inner: {
    maxWidth: 1200,
    margin: "0 auto",
  },

  banner: {
    background: "linear-gradient(135deg,#6366f1,#3b82f6,#06b6d4)",
    padding: 16,
    borderRadius: 14,
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  bannerBtns: {
    display: "flex",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },

  btnPrimary: {
    background: "#111",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 8,
    border: "none",
    display: "flex",
    gap: 6,
    alignItems: "center",
  },

  btnSecondary: {
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 8,
    border: "none",
    display: "flex",
    gap: 6,
    alignItems: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 12,
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 12,
    color: "#fff",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  value: {
    marginTop:"clamp(14px, 2vw, 22px)",
    fontSize: 18,
    fontWeight: 700,
  },

  label: {
    fontSize: 12,
    opacity: 0.7,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 14,
  },

  bigCard: {
    background: "linear-gradient(135deg,#6366f1,#3b82f6)",
    padding: 14,
    borderRadius: 12,
    color: "#fff",
  },

  bigCard2: {
    background: "linear-gradient(135deg,#10b981,#14b8a6)",
    padding: 14,
    borderRadius: 12,
    color: "#fff",
  },

  section: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },

  sectionTitle: {
    fontSize: "clamp(14px, 2vw, 22px)",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  item: {
    fontSize: 12,
    opacity: 0.9,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  smallText: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 1.4,
  },
};

export default WholeContantDashbaord;
