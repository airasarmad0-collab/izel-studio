import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import {
  Menu,
  X,
  LayoutDashboard,
  Globe,
  PlusCircle,
  LayoutGrid,
  LogOut,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import logo from '../../../public/logo.png'
import apiBase from '../../common/api'

const AdminNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navRef = useRef(null)
  const menuItemsRef = useRef([])

  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  /* ── NAVBAR ENTRY ── */
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      {
        opacity: 0,
        y: -35,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
      }
    )
  }, [])

  /* ── MENU STAGGER ── */
  useEffect(() => {
    if (sidebarOpen) {
      gsap.fromTo(
        menuItemsRef.current,
        {
          opacity: 0,
          x: -30,
        },
        {
          opacity: 1,
          x: 0,
          stagger: 0.08,
          duration: 0.45,
          ease: 'power3.out',
        }
      )
    }
  }, [sidebarOpen])

  /* ── LOGOUT ── */
  const handleLogout = async () => {
    try {
      const { data } =
        await apiBase.post(
          '/api/admin/auth/logout'
        )

      if (data?.success) {
        localStorage.removeItem(
          'adminToken'
        )
        localStorage.removeItem('admin')
        localStorage.removeItem(
          'isAdminLoggedIn'
        )

        toast.success(
          data.message ||
            'Logged out successfully'
        )

        navigate('/admin/login')
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          'Logout failed'
      )
    }
  }

  const navItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: 'View Site',
      path: '/',
      icon: <Globe size={20} />,
    },
    {
      title: 'Create Volume',
      path:
        '/admin/dashboard/create/volume',
      icon: <PlusCircle size={20} />,
    },
    {
      title: 'View Volumes',
      path:
        '/admin/dashboard/view/volumes',
      icon: <LayoutGrid size={20} />,
    },
  ]

  return (
    <>
      {/* NAVBAR */}
      <nav
        ref={navRef}
        style={styles.navbar}
      >
        {/* LEFT MENU */}
        <button
          onClick={() =>
            setSidebarOpen(true)
          }
          style={styles.menuButton}
        >
          <Menu size={24} />
        </button>

        {/* CENTER LOGO */}
        <motion.img
          whileHover={{
            scale: 1.04,
          }}
          transition={{
            duration: 0.2,
          }}
          src={logo}
          alt="logo"
          style={styles.logo}
          onClick={() =>
            navigate('/admin/dashboard')
          }
        />

        {/* RIGHT LOGOUT */}
        <motion.button
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.98,
          }}
          style={styles.logoutButton}
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span className="logout-text">
            Logout
          </span>
        </motion.button>
      </nav>

      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.overlay}
              onClick={() =>
                setSidebarOpen(false)
              }
            />

            {/* SIDEBAR PANEL */}
            <motion.div
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{
                type: 'spring',
                damping: 24,
                stiffness: 220,
              }}
              style={styles.sidebar}
            >
              {/* TOP */}
              <div style={styles.top}>
                <img
                  src={logo}
                  alt="logo"
                  style={styles.sidebarLogo}
                />

                <button
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  style={styles.closeBtn}
                >
                  <X size={22} />
                </button>
              </div>

              {/* MENU ITEMS */}
              <div style={styles.links}>
                {navItems.map(
                  (item, index) => (
                    <motion.button
                      key={item.path}
                      ref={(el) =>
                        (menuItemsRef.current[
                          index
                        ] = el)
                      }
                      whileHover={{
                        x: 6,
                      }}
                      onClick={() => {
                        navigate(item.path)
                        setSidebarOpen(
                          false
                        )
                      }}
                      style={{
                        ...styles.link,
                        ...(location.pathname ===
                        item.path
                          ? styles.activeLink
                          : {}),
                      }}
                    >
                      {item.icon}
                      {item.title}
                    </motion.button>
                  )
                )}

                {/* LOGOUT */}
                <motion.button
                  whileHover={{
                    x: 6,
                  }}
                  onClick={handleLogout}
                  style={{
                    ...styles.link,
                    marginTop: 18,
                    color: '#ef4444',
                  }}
                >
                  <LogOut size={20} />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

const styles = {
  navbar: {
    position: 'sticky',
    top: 20,
    zIndex: 999,
    width: '95%',
    maxWidth: '1400px',
    height: 78,
    margin: '20px auto',
    padding: '0 20px',
    borderRadius: 24,
    background:
      'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter:
      'blur(18px)',
    border:
      '1px solid rgba(0,0,0,0.06)',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuButton: {
    border: 'none',
    background: '#f7f7f7',
    width: 48,
    height: 48,
    borderRadius: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 95,
    objectFit: 'contain',
    filter: 'brightness(0)',
    cursor: 'pointer',
  },

  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: 'none',
    padding: '12px 18px',
    borderRadius: 14,
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background:
      'rgba(0,0,0,0.28)',
    backdropFilter: 'blur(6px)',
    zIndex: 1000,
  },

  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 340,
    maxWidth: '88%',
    height: '100vh',
    background:
      'rgba(255,255,255,0.94)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter:
      'blur(22px)',
    borderRight:
      '1px solid rgba(0,0,0,0.08)',
    padding: 24,
    zIndex: 1001,
    boxShadow:
      '0 30px 80px rgba(0,0,0,0.12)',
  },

  top: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },

  sidebarLogo: {
    width: 90,
    objectFit: 'contain',
    filter: 'brightness(0)',
  },

  closeBtn: {
    border: 'none',
    background: '#f5f5f5',
    width: 46,
    height: 46,
    borderRadius: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    border: 'none',
    background: '#f8f8f8',
    padding: '16px 18px',
    borderRadius: 18,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
  },

  activeLink: {
    background: '#111',
    color: '#fff',
  },
}

export default AdminNavbar