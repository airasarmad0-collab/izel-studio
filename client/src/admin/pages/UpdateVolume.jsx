import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useNavigate, useParams } from "react-router-dom";
import apiBase from "../../common/api";
import { toast } from "react-toastify";
import {
  Type,
  FileText,
  AlignLeft,
  Tag,
  Plus,
  Save,
  X,
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import { Helmet } from "react-helmet-async";

const MAX_TAGS = 10;

const UpdateVolume = () => {
  const { volumeId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false); // ✅ FIXED

  const [form, setForm] = useState({
    name: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    tags: [""],
  });

  /* ───────── FETCH VOLUME ───────── */
  useEffect(() => {
    if (!volumeId) return;
    fetchVolume();
  }, [volumeId]);

  const fetchVolume = async () => {
    try {
      setLoading(true);
      setLoaded(false);

      const res = await apiBase.get(
        `/api/admin/get/volume/${volumeId}`
      );

      const v = res.data.data;

      setForm({
        name: v.name || "",
        description: v.description || "",
        metaTitle: v.metaTitle || "",
        metaDescription: v.metaDescription || "",
        tags: v.tags?.length ? v.tags : [""],
      });

      setLoaded(true);
    } catch (err) {
      toast.error("Failed to load volume");
    } finally {
      setLoading(false);
    }
  };

        console.log(form.metaTitle)


  /* ───────── GSAP ENTRY ───────── */
  useEffect(() => {
    if (!loading && loaded) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 }
      );
    }
  }, [loading, loaded]);

  useEffect(() => {
  if (form.metaTitle) {
    document.title = `Izel Studio - ${form.metaTitle}`;
  } else {
    document.title = "Izel Studio - Update Volume";
  }
}, [form.metaTitle]);

  /* ───────── TAGS ───────── */
  const handleTagChange = (value, index) => {
    const updated = [...form.tags];
    updated[index] = value;
    setForm({ ...form, tags: updated });
  };

  const addTag = () => {
    if (form.tags.length >= MAX_TAGS) return;
    setForm({ ...form, tags: [...form.tags, ""] });
  };

  const removeTag = (index) => {
    const updated = form.tags.filter((_, i) => i !== index);
    setForm({ ...form, tags: updated.length ? updated : [""] });
  };

  /* ───────── UPDATE ───────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...form,
        tags: form.tags.filter((t) => t.trim() !== ""),
      };

      const res = await apiBase.put(
        `/api/admin/update/volume/${volumeId}`,
        payload
      );

      toast.success(res.data.message || "Updated successfully!");

      navigate("/admin/dashboard/view/volumes");
    } catch (err) {
      console.log(err?.response?.data);
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />

      {/* ✅ FIXED HELMET */}
   

      <div style={styles.wrapper}>
        <motion.div
          ref={containerRef}
          style={styles.card}
        >
          {/* HEADER */}
          <div style={styles.header}>
            <h2 style={styles.title}>Update Volume</h2>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <Field icon={<Type size={16} />}>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Volume Name"
                style={styles.input}
              />
            </Field>

            <Field icon={<AlignLeft size={16} />}>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description"
                style={styles.input}
              />
            </Field>

            <Field icon={<FileText size={16} />}>
              <input
                value={form.metaTitle}
                onChange={(e) =>
                  setForm({ ...form, metaTitle: e.target.value })
                }
                placeholder="Meta Title"
                style={styles.input}
              />
            </Field>

            <Field icon={<FileText size={16} />}>
              <textarea
                value={form.metaDescription}
                onChange={(e) =>
                  setForm({
                    ...form,
                    metaDescription: e.target.value,
                  })
                }
                placeholder="Meta Description"
                style={styles.input}
              />
            </Field>

            {/* TAGS */}
            <div style={styles.tagBox}>
              <div style={styles.tagHeader}>
                <span>Tags</span>
                <button
                  type="button"
                  onClick={addTag}
                  style={styles.addBtn}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {form.tags.map((tag, i) => (
                <div key={i} style={styles.tagRow}>
                  <Tag size={14} />
                  <input
                    value={tag}
                    onChange={(e) =>
                      handleTagChange(e.target.value, i)
                    }
                    style={styles.input}
                  />
                  <X
                    size={14}
                    onClick={() => removeTag(i)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              style={styles.saveBtn}
            >
              <Save size={16} />
              {loading ? "Updating..." : "Save Changes"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

/* FIELD */
const Field = ({ icon, children }) => (
  <div style={styles.field}>
    {icon}
    {children}
  </div>
);

/* STYLES (unchanged) */
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#0E1526",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 650,
    background: "linear-gradient(135deg,#141c2f,#1b2a44)",
    padding: 25,
    borderRadius: 18,
    color: "#fff",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  header: { marginBottom: 20 },
  title: { margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  field: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#111a2e",
    padding: 10,
    borderRadius: 10,
  },
  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#fff",
  },
  tagBox: { marginTop: 10 },
  tagHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
  tagRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#111a2e",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  saveBtn: {
    marginTop: 15,
    background: "#22c55e",
    color: "#000",
    border: "none",
    padding: 12,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
};

export default UpdateVolume;