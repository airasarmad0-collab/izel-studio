import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import {
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


const AdminLogin = () => {
  const navigate = useNavigate()

  const logoRef = useRef(null)
  const formRef = useRef(null)
  const cardRef = useRef(null)

  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  /* ── CHECK IF ALREADY LOGGED IN ── */
  useEffect(() => {
    const token = localStorage.getItem('adminToken')

    if (token) {
      navigate('/admin/dashboard')
    }
  }, [navigate])

  /* ── INTRO ANIMATION ── */
  useEffect(() => {
    const tl = gsap.timeline()

    tl.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 40,
        scale: 0.96,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: 'power3.out',
      }
    )

    tl.fromTo(
      logoRef.current,
      {
        scale: 0.4,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
      },
      '-=0.3'
    )

    tl.fromTo(
      formRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
      },
      '-=0.2'
    )
  }, [])

  /* ── INPUT CHANGE ── */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  /* ── LOGIN ── */
  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      const { data } = await apiBase.post(
        '/api/admin/auth/login',
        form
      )

      if (data?.success) {
        toast.success(
          data.message || 'Login successful!'
        )

        if (data?.token) {
          localStorage.setItem(
            'adminToken',
            data.token
          )
        }

        // ✅ save admin data
        if (data?.data) {
          localStorage.setItem(
            'admin',
            JSON.stringify(data.data)
          )
        }

        localStorage.setItem(
          'isAdminLoggedIn',
          'true'
        )

        // 🎬 exit animation + redirect
        gsap.to(cardRef.current, {
          opacity: 0,
          scale: 0.95,
          y: -20,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: () =>
            navigate('/admin/dashboard'),
        })
      } else {
        toast.error(
          data.message || 'Login failed'
        )
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          'Server error'
      )
    }

    setLoading(false)
  }

  return (
    <div style={styles.wrapper}>
      <Helmet>
              <title>Izel Studio - Admin Login</title>
            </Helmet>
      <motion.div
        ref={cardRef}
        style={styles.card}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* LOGO */}
        <img
          ref={logoRef}
          src={logo}
          alt="logo"
          style={styles.logo}
        />

        {/* FORM */}
        <div
          ref={formRef}
          style={styles.formBox}
        >
          <h2 style={styles.title}>
            Admin Login
          </h2>

          <p style={styles.subtitle}>
            Login to continue
          </p>

          {/* EMAIL */}
          <div style={styles.inputBox}>
            <Mail size={18} />

            <input
              name="email"
              type="email"
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
              type={
                showPass
                  ? 'text'
                  : 'password'
              }
              placeholder="Password"
              onChange={handleChange}
              style={styles.input}
            />

            <div
              onClick={() =>
                setShowPass(!showPass)
              }
              style={{
                cursor: 'pointer',
              }}
            >
              {showPass ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ── STYLES ── */
const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background:
      'linear-gradient(135deg,#f7f7f7,#ffffff)',
  },

  card: {
    width: 380,
    padding: 32,
    background: '#fff',
    borderRadius: 20,
    border: '1px solid #ececec',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },

  logo: {
    width: 120,
    height: 120,
    margin: '0 auto 14px',
    display: 'block',
    objectFit: 'contain',
    filter: 'brightness(0)',
  },

  formBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 4,
    color: '#111',
  },

  subtitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 12,
  },

  inputBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid #ddd',
    borderRadius: 12,
    padding: '12px 14px',
    background: '#fff',
    transition: '0.2s ease',
  },

  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    background: 'transparent',
  },

  button: {
    marginTop: 8,
    padding: 13,
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: '0.2s ease',
  },
}

export default AdminLogin