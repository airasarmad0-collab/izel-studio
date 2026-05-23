import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import apiBase from "../../common/api";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { Plus, X } from "lucide-react";
import { useParams } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const MAX_TAGS = 10;
const MAX_GALLERY = 9;

const CreateCloth = () => {
  const { volumeId } = useParams();
  const modalRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    mainImage: null, // will store File object
    imageGallery: [], // array of File objects
    purchasingLink: "",
    type: "unstitched",
    metaTitle: "",
    metaDescription: "",
    tags: [""],
  });

  useEffect(() => {
    if (!volumeId) toast.error("Volume ID missing!");
  }, [volumeId]);

  useEffect(() => {
    if (open && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.85, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4 },
      );
    }
  }, [open]);

  // ================= TAGS =================
  const handleTagChange = (val, i) => {
    const updated = [...form.tags];
    updated[i] = val;
    setForm({ ...form, tags: updated });
  };

  const addTag = () => {
    if (form.tags.length >= MAX_TAGS) return;
    setForm({ ...form, tags: [...form.tags, ""] });
  };

  const removeTag = (i) => {
    const updated = form.tags.filter((_, idx) => idx !== i);
    setForm({ ...form, tags: updated.length ? updated : [""] });
  };

  // ================= IMAGES (RAW FILES, NO BASE64) =================
  const handleMainImage = (file) => {
    setForm({ ...form, mainImage: file });
  };

  const handleGalleryChange = (file, i) => {
    const updated = [...form.imageGallery];
    updated[i] = file;
    setForm({ ...form, imageGallery: updated });
  };

  const addGallery = () => {
    if (form.imageGallery.length >= MAX_GALLERY) return;
    setForm({ ...form, imageGallery: [...form.imageGallery, null] });
  };

  const removeGallery = (i) => {
    const updated = form.imageGallery.filter((_, idx) => idx !== i);
    setForm({ ...form, imageGallery: updated });
  };

  // ================= SUBMIT WITH FormData =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!volumeId) return toast.error("Volume ID missing!");

    // validation
    if (!form.name || !form.price || !form.metaTitle || !form.mainImage) {
      toast.error(
        "Please fill required fields (name, price, image, metaTitle)",
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("metaTitle", form.metaTitle);
    formData.append("metaDescription", form.metaDescription);
    formData.append("type", form.type);
    formData.append("purchasingLink", form.purchasingLink);

    // tags as comma-separated string (backend expects a string)
    const tagsString = form.tags.filter((t) => t.trim()).join(",");
    formData.append("tags", tagsString);

    // main image file
    formData.append("mainImage", form.mainImage);

    // gallery files (multiple with same field name)
    form.imageGallery.forEach((file) => {
      if (file) formData.append("imageGallery", file);
    });

    try {
      setLoading(true);
      const res = await apiBase.post(
        `/api/admin/create/product/${volumeId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );
      toast.success(res.data.message || "Product created!");

      // close modal and reset form
      setOpen(false);
      setForm({
        name: "",
        description: "",
        price: "",
        mainImage: null,
        imageGallery: [],
        purchasingLink: "",
        type: "unstitched",
        metaTitle: "",
        metaDescription: "",
        tags: [""],
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= STYLES (unchanged, responsive) =================
  const buttonBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    cursor: "pointer",
  };

  const styles = {
    openBtn: {
      padding: "1vw 1.5vw",
      background: "#fff",
      color: "#000",
      borderRadius: 8,
      border: "none",
      margin: "5vh 5vh",
    },
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: 10,
    },
    modal: {
      width: "100%",
      maxWidth: 600,
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      maxHeight: "90vh",
      overflowY: "auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    input: {
      width: "100%",
      padding: 10,
      borderRadius: 8,
      border: "1px solid #ddd",
    },
    textarea: {
      width: "100%",
      padding: 10,
      minHeight: 80,
      borderRadius: 8,
      border: "1px solid #ddd",
    },
    box: {
      padding: 10,
      background: "#f5f5f5",
      borderRadius: 8,
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    tagRow: {
      display: "flex",
      gap: 8,
      marginTop: 8,
    },
    galleryItem: {
      display: "flex",
      justifyContent: "space-between",
      gap: 8,
      padding: 10,
      background: "#f5f5f5",
      borderRadius: 8,
      marginTop: 6,
    },
    addBtn: {
      background: "#000",
      color: "#fff",
      border: "none",
      padding: "6px 10px",
      borderRadius: 6,
    },
    removeBtn: {
      background: "#ffeded",
      border: "1px solid #ffcccc",
      color: "red",
      padding: 6,
      borderRadius: 6,
    },
    submitBtn: {
      padding: "10px",
      background: "#000",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      marginTop: 10,
    },
  };

  return (
    <>
      <Helmet>
        <title>Izel Studio - Admin Create Product</title>
      </Helmet>
      <AdminNavbar />

      <div
        style={{
          backgroundColor: "#0E1526",
          minHeight: "80vh",
          padding: "5vh 0",
        }}
      >
        {/* OPEN BUTTON */}
        <button
          onClick={() => setOpen(true)}
          style={{
            ...styles.openBtn,
            ...buttonBase,
          }}
        >
          <Plus size={16} /> Create Product
        </button>

        {/* MODAL */}
        <AnimatePresence>
          {open && (
            <div style={styles.overlay} onClick={() => setOpen(false)}>
              <motion.div
                ref={modalRef}
                style={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                {/* HEADER */}
                <div style={styles.header}>
                  <h3>Create Product</h3>
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      border: "none",
                      background: "transparent",
                      ...buttonBase,
                    }}
                  >
                    <X />
                  </button>
                </div>

                <form style={styles.form} onSubmit={handleSubmit}>
                  <input
                    placeholder="Product Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={styles.input}
                    required
                  />

                  <textarea
                    placeholder="Product Description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    style={styles.textarea}
                  />

                  <input
                    type="number"
                    placeholder="Price *"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    style={styles.input}
                    required
                  />

                  {/* MAIN IMAGE (file) */}
                  <div style={styles.box}>
                    <b>Main Image *</b>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMainImage(e.target.files[0])}
                      required
                    />
                  </div>

                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={styles.input}
                  >
                    <option value="unstitched">Unstitched</option>
                    <option value="stitched">Stitched</option>
                  </select>

                  {/* TAGS */}
                  <div>
                    <div style={styles.row}>
                      <b>Tags</b>
                      <button
                        type="button"
                        onClick={addTag}
                        style={{ ...styles.addBtn, ...buttonBase }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>

                    {form.tags.map((t, i) => (
                      <div key={i} style={styles.tagRow}>
                        <input
                          placeholder="Enter tag"
                          value={t}
                          onChange={(e) => handleTagChange(e.target.value, i)}
                          style={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => removeTag(i)}
                          style={{ ...styles.removeBtn, ...buttonBase }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* GALLERY IMAGES (multiple files) */}
                  <div>
                    <div style={styles.row}>
                      <b>Gallery Images</b>
                      <button
                        type="button"
                        onClick={addGallery}
                        style={{ ...styles.addBtn, ...buttonBase }}
                      >
                        <Plus size={14} /> Add Image
                      </button>
                    </div>

                    {form.imageGallery.map((img, i) => (
                      <div key={i} style={styles.galleryItem}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleGalleryChange(e.target.files[0], i)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeGallery(i)}
                          style={{ ...styles.removeBtn, ...buttonBase }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* META */}
                  <input
                    placeholder="Meta Title *"
                    value={form.metaTitle}
                    onChange={(e) =>
                      setForm({ ...form, metaTitle: e.target.value })
                    }
                    style={styles.input}
                    required
                  />

                  <textarea
                    placeholder="Meta Description"
                    value={form.metaDescription}
                    onChange={(e) =>
                      setForm({ ...form, metaDescription: e.target.value })
                    }
                    style={styles.textarea}
                  />

                  <input
                    placeholder="Purchase Link (WhatsApp)"
                    value={form.purchasingLink}
                    onChange={(e) =>
                      setForm({ ...form, purchasingLink: e.target.value })
                    }
                    style={styles.input}
                  />

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    style={{ ...styles.submitBtn, ...buttonBase }}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Product"}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default CreateCloth;
