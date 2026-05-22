import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import logo from '../../../public/logo.png'
import apiBase from '../../common/api'
import { Helmet } from "react-helmet-async";

const AdminSignUp = () => {
  const navigate = useNavigate()

  const logoRef = useRef(null)
  const formRef = useRef(null)
  const cardRef = useRef(null)
  const hasChecked = useRef(false)

  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  /* ── CHECK ADMIN LIMIT ── */
  useEffect(() => {
    const checkAdmins = async () => {
      if (hasChecked.current) return
      hasChecked.current = true

      try {
        const { data } = await apiBase.get('/api/admin/auth/count')

        if (data.count >= 3) {
          toast.error(data.message || "Admin limit reached")

          // 🚀 instant redirect (no animation delay)
          navigate('/')
          return
        }

      } catch (err) {
        toast.error(err?.response?.data?.message || "Server error")
      }
    }

    checkAdmins()
  }, [navigate])

  /* ── INTRO ANIMATION ── */
  useEffect(() => {
    const tl = gsap.timeline()

    tl.fromTo(
      logoRef.current,
      { scale: 0.4, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }
    )

    tl.fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.2'
    )
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await apiBase.post('/api/admin/auth/signup', form)

      console.log("Signup response:", data)

      if (data?.success) {

        toast.success(data.message || "Account created successfully!")

        if (data?.token) {
          localStorage.setItem("adminToken", data.token)
        }

        if (data?.data) {
          localStorage.setItem("admin", JSON.stringify(data.data))
        }

        localStorage.setItem("isAdminLoggedIn", "true")

        gsap.to(cardRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => navigate("/admin/dashboard")
        })

      } else {
        toast.error(data.message || "Signup failed")
      }

    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error")
    }

    setLoading(false)
  }

  return (
    <div style={styles.wrapper}>
      <Helmet>
              <title>Izel Studio - Admin Signup</title>
            </Helmet>

      <motion.div ref={cardRef} style={styles.card}>

        {/* LOGO */}
        <img
          ref={logoRef}
          src={logo}
          alt="logo"
          style={styles.logo}
        />

        {/* FORM */}
        <div ref={formRef} style={styles.formBox}>

          <h2 style={styles.title}>Admin Signup</h2>

          {/* NAME */}
          <div style={styles.inputBox}>
            <User size={18} />
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* EMAIL */}
          <div style={styles.inputBox}>
            <Mail size={18} />
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* PASSWORD */}
          <div style={styles.inputBox}>
            <Lock size={18} />

            <input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              style={styles.input}
            />

            <div onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>

        </div>

      </motion.div>
    </div>
  )
}

/* ── STYLES (UNCHANGED) ── */
const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },

  card: {
    width: 380,
    padding: 30,
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #eee",
    textAlign: "center",
  },

  logo: {
    width: 120,
    height: 120,
    margin: "0 auto 10px",
    display: "block",
    objectFit: "contain",
    filter: "brightness(0)",
  },

  formBox: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 500,
  },

  inputBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px",
    background: "#fff",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 14,
  },

  button: {
    marginTop: 10,
    padding: 10,
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
}

export default AdminSignUp