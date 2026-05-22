import React, { useState, useRef, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import apiBase from "../../common/api";
import { motion } from "framer-motion";
import gsap from "gsap";
import { createPortal } from "react-dom";
import {
  X,
  PlusCircle,
  Tag,
  FileText,
  Type,
  AlignLeft,
  Plus,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const MAX_TAGS = 9;

const CreateVolume = () => {
  const [open, setOpen] = useState(false);
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    tags: [""],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  useEffect(() => {
    if (open && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.85, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4 }
      );
    }
  }, [open]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription || undefined,
        tags: form.tags.filter((t) => t.trim() !== ""),
      };

      const res = await apiBase.post("/api/admin/create/volume", payload);

      toast.success(res.data.message || "Volume created!", {
        style: { background: "#fff", color: "#000" },
      });

      setForm({
        name: "",
        description: "",
        metaTitle: "",
        metaDescription: "",
        tags: [""],
      });

      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong!", {
        style: { background: "#fff", color: "#000" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Izel Studio - Admin | Create Volume</title>
      </Helmet>

      <AdminNavbar />

      <div style={{ background: "#0E1526", minHeight: "100vh" }}>
        <div style={{ padding: "20px" }}>
          <button onClick={() => setOpen(true)} style={styles.openBtn}>
            <PlusCircle size={18} />
            Create Volume
          </button>
        </div>

        {open &&
          createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.overlay}
              onClick={() => setOpen(false)}
            >
              <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                style={styles.modal}
              >
                {/* HEADER */}
                <div style={styles.header}>
                  <h2 style={{ color: "#000" }}>Create Volume</h2>
                  <X
                    size={18}
                    onClick={() => setOpen(false)}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                {/* INFO SECTION */}
                <div style={styles.infoBox}>
                  <Info size={16} />
                  <div>
                    <b>How to create a Volume</b>
                    <p style={{ margin: 0, fontSize: 12 }}>
                      Fill in basic details, add SEO metadata, and use tags to
                      categorize your volume properly.
                    </p>

                    <ul style={{ marginTop: 6, paddingLeft: 16, fontSize: 12 }}>
                      <li>Keep name clear and unique</li>
                      <li>Use SEO-friendly meta title</li>
                      <li>Add relevant tags (max {MAX_TAGS})</li>
                      <li>Write short but meaningful descriptions</li>
                    </ul>
                  </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} style={styles.form}>
                  <Input
                    icon={<Type size={16} />}
                    value={form.name}
                    placeholder="Name"
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />

                  <Textarea
                    icon={<AlignLeft size={16} />}
                    value={form.description}
                    placeholder="Description"
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />

                  <Input
                    icon={<FileText size={16} />}
                    value={form.metaTitle}
                    placeholder="Meta Title"
                    onChange={(e) =>
                      setForm({ ...form, metaTitle: e.target.value })
                    }
                  />

                  <Textarea
                    icon={<AlignLeft size={16} />}
                    value={form.metaDescription}
                    placeholder="Meta Description"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        metaDescription: e.target.value,
                      })
                    }
                  />

                  {/* TAGS */}
                  <div>
                    <div style={styles.tagHeader}>
                      <span style={{ color: "#000" }}>
                        Tags ({form.tags.length}/{MAX_TAGS})
                      </span>

                      <button
                        type="button"
                        onClick={addTag}
                        disabled={form.tags.length >= MAX_TAGS}
                        style={{
                          ...styles.addBtn,
                          opacity: form.tags.length >= MAX_TAGS ? 0.5 : 1,
                          display: "flex",
                          justifyItems: "center",
                          alignItems: "center"
                        }}
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>

                    {form.tags.map((tag, i) => (
                      <div key={i} style={styles.field}>
                        <Tag size={16} />
                        <input
                          value={tag}
                          placeholder={`Tag ${i + 1}`}
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

                  <button style={styles.submitBtn}>
                    {loading ? "Creating..." : "Create Volume"}
                  </button>
                </form>
              </div>
            </motion.div>,
            document.body
          )}
      </div>
    </>
  );
};

/* INPUT */
const Input = ({ icon, ...props }) => (
  <div style={styles.field}>
    {icon}
    <input {...props} style={styles.input} />
  </div>
);

/* TEXTAREA */
const Textarea = ({ icon, ...props }) => (
  <div style={styles.field}>
    {icon}
    <textarea {...props} style={styles.input} />
  </div>
);

const styles = {
 openBtn: {
  display: "flex",
  alignItems: "center", // vertical center
  justifyContent: "center", // horizontal center
  gap: 8,
  padding: "10px 15px",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
},

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
  },

  modal: {
    width: "520px",
    height: "80vh",
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  form: {
    flex: 1,
    overflowY: "auto",
    paddingRight: "5px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  field: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#000",
  },

  tagHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },

 addBtn: {
  display: "flex",
  gap: 5,
  background: "#000",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",

  alignItems: "center",     // vertical center
  justifyContent: "center",  // horizontal center
},
  submitBtn: {
  width: "100%",
  padding: "12px",
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",

  display: "flex",
  alignItems: "center", // vertical center
  justifyContent: "center", // horizontal center
  gap: 8,
},

  infoBox: {
    display: "flex",
    gap: 10,
    padding: 10,
    background: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 12,
    color: "#000",
  },
};

export default CreateVolume;