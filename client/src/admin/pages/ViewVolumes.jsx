import React, { useEffect, useState, useRef } from "react";
import apiBase from "../../common/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Search, Trash2, Edit3, Eye, Layers, Loader, PlusCircle } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import { Helmet } from "react-helmet-async";

const ViewVolumes = () => {
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const cardRefs = useRef([]);

  useEffect(() => {
    fetchVolumes();
  }, [page, search]);

  useEffect(() => {
    if (volumes.length > 0) {
      gsap.fromTo(
        cardRefs.current,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
        }
      );
    }
  }, [volumes]);

  const fetchVolumes = async () => {
    try {
      setLoading(true);

      const res = await apiBase.get(
        `/api/admin/get-all/volumes?page=${page}&search=${search}`
      );

      setVolumes(res.data.data || []);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch volumes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this volume?")) return;

    try {
      await apiBase.delete(`/api/admin/delete/volume/${id}`);
      toast.success("Volume deleted successfully");
      fetchVolumes();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Izel Studio - Admin View All Volumes</title>
      </Helmet>

      <AdminNavbar />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            <Layers size={20} /> Volumes
          </h2>

          <div style={styles.searchBox}>
            <Search size={16} />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search volumes..."
              style={styles.input}
            />
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div style={styles.center}>
            <Loader className="animate-spin" />
          </div>
        ) : volumes.length === 0 ? (
          <div style={styles.center}>No volumes found</div>
        ) : (
          <div style={styles.grid}>
            {volumes.map((v, index) => (
              <div
                key={v._id}
                ref={(el) => (cardRefs.current[index] = el)}
                style={styles.card}
                onMouseEnter={(e) =>
                  gsap.to(e.currentTarget, {
                    scale: 1.03,
                    y: -5,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
                    duration: 0.3,
                  })
                }
                onMouseLeave={(e) =>
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    y: 0,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                    duration: 0.3,
                  })
                }
              >
                <h3 style={styles.titleCard}>{v.name}</h3>

                <p style={styles.desc}>
                  {v.description?.slice(0, 80) || "No description"}
                </p>

                <div style={styles.tags}>
                  {v.tags?.slice(0, 3).map((t, i) => (
                    <span key={i} style={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* ACTIONS */}
                <div style={styles.actions}>
                  {/* VIEW CLOTHES (UPDATED) */}
                  <button
                    onClick={() =>
                      navigate(`/admin/dashboard/view/clothes/${v._id}`)
                    }
                    style={styles.viewBtn}
                  >
                    <Eye size={14} /> Clothes
                  </button>

                  {/* CREATE CLOTH (NEW BUTTON) */}
                  <button
                    onClick={() =>
                      navigate(`/admin/dashboard/create/cloth/${v._id}`)
                    }
                    style={styles.createBtn}
                  >
                    <PlusCircle size={14} /> Create Cloth
                  </button>

                  {/* EDIT */}
                  <button
                    onClick={() =>
                      navigate(`/admin/dashboard/update/volume/${v._id}`)
                    }
                    style={styles.editBtn}
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(v._id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div style={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={styles.pageBtn}
          >
            Prev
          </button>

          <span style={{ color: "#fff" }}>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={styles.pageBtn}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

/* STYLES */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#0E1526",
    padding: 20,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },

  title: {
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1a2233",
    padding: "8px 12px",
    borderRadius: 8,
    color: "#fff",
  },

  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#fff",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 15,
  },

  card: {
    background: "linear-gradient(135deg, #141c2f, #1b2a44)",
    padding: 16,
    borderRadius: 14,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  titleCard: {
    margin: 0,
  },

  desc: {
    fontSize: 12,
    color: "#bbb",
  },

  tags: {
    display: "flex",
    gap: 5,
    flexWrap: "wrap",
  },

  tag: {
    fontSize: 10,
    background: "#222b3d",
    padding: "3px 6px",
    borderRadius: 5,
  },

  actions: {
    display: "flex",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap",
  },

  viewBtn: {
    background: "#2d6cdf",
    border: "none",
    color: "#fff",
    padding: "5px 8px",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  createBtn: {
    background: "#22c55e",
    border: "none",
    color: "#000",
    padding: "5px 8px",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  editBtn: {
    background: "#f5a623",
    border: "none",
    color: "#000",
    padding: "5px 8px",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  deleteBtn: {
    background: "#e74c3c",
    border: "none",
    color: "#fff",
    padding: "5px 8px",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  pagination: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  pageBtn: {
    background: "#1a2233",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },

  center: {
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
  },
};

export default ViewVolumes;