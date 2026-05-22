import React, { useState, useEffect } from 'react'
import { 
  Heart, 
  ChevronRight,
  ArrowUp
} from 'lucide-react'
import { 
  FaFacebookF, 
  FaInstagram, 
  FaYoutube,
  FaWhatsapp,
  FaCcVisa, 
  FaCcMastercard, 
  FaPaypal
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import logo from "../../../public/logo.png"
import apiBase from "../../common/api"

const Footer = () => {
  const [volumes, setVolumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Fetch volumes from API
  useEffect(() => {
    const fetchVolumes = async () => {
      try {
        setLoading(true)
        const res = await apiBase.get("/api/client/get-all/volumes")
        if (res.data?.success) {
          setVolumes(res.data.data || [])
        }
      } catch (err) {
        console.error("Error fetching volumes:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchVolumes()
  }, [])

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const socialLinks = [
    { 
      icon: <FaFacebookF size={18} />, 
      url: "https://www.facebook.com/izelstudio", 
      label: "Facebook"
    },
    { 
      icon: <FaInstagram size={18} />, 
      url: "https://www.instagram.com/izelstudio", 
      label: "Instagram"
    },
    { 
      icon: <FaWhatsapp size={18} />, 
      url: "https://wa.me/923001561562", 
      label: "WhatsApp"
    },
    { 
      icon: <FaYoutube size={18} />, 
      url: "https://www.youtube.com/@izelstudio", 
      label: "YouTube"
    }
  ]

  // Combine Home + Volumes in quick links
  const quickLinks = [
    { name: "Home", path: "/" },
    ...volumes.map(volume => ({ 
      name: volume.name, 
      path: `/view/volume/${volume._id}` 
    }))
  ]

  return (
    <footer className="izel-footer">
      <style>
        {`
          .izel-footer {
            background: linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #111110 100%);
            color: #FFFFFF;
            font-family: 'Outfit', sans-serif;
            position: relative;
            overflow: hidden;
          }

          /* Premium Background Pattern */
          .izel-footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              repeating-linear-gradient(45deg, rgba(196, 30, 58, 0.02) 0px, rgba(196, 30, 58, 0.02) 2px, transparent 2px, transparent 8px);
            pointer-events: none;
          }

          .izel-footer::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: 0;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(196, 30, 58, 0.08) 0%, transparent 70%);
            pointer-events: none;
          }

          .footer-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 60px 64px 30px;
            position: relative;
            z-index: 2;
          }

          /* Footer Grid - 3 columns */
          .footer-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr 1fr;
            gap: 50px;
            margin-bottom: 50px;
          }

          /* Logo Section */
          .footer-logo-section {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .footer-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          .footer-logo:hover {
            transform: translateX(5px);
          }

          .footer-logo-img {
            width: 55px;
            height: 55px;
            object-fit: contain;
            filter: brightness(0) invert(1);
            transition: all 0.4s ease;
          }

          .footer-logo:hover .footer-logo-img {
            transform: rotate(5deg) scale(1.05);
          }

          .footer-logo-text {
            font-size: 1.4rem;
            font-weight: 500;
            letter-spacing: 0.05em;
            background: linear-gradient(135deg, #fff 0%, #c41e3a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .footer-description {
            font-size: 0.85rem;
            line-height: 1.7;
            color: rgba(255,255,255,0.6);
            transition: all 0.3s ease;
          }

          .footer-description:hover {
            color: rgba(255,255,255,0.9);
            transform: translateX(3px);
          }

          /* Social Links */
          .social-links {
            display: flex;
            gap: 15px;
            margin-top: 10px;
            flex-wrap: wrap;
          }

          .social-link {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
            text-decoration: none;
            position: relative;
            overflow: hidden;
          }

          .social-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
          }

          .social-link:hover::before {
            left: 100%;
          }

          .social-link:hover {
            transform: translateY(-6px) scale(1.08);
          }

          .social-link[data-social="facebook"]:hover {
            background: #1877f2;
            box-shadow: 0 8px 20px rgba(24, 119, 242, 0.4);
          }

          .social-link[data-social="instagram"]:hover {
            background: linear-gradient(45deg, #f09433, #d62976, #962fbf);
            box-shadow: 0 8px 20px rgba(214, 41, 118, 0.4);
          }

          .social-link[data-social="whatsapp"]:hover {
            background: #25D366;
            box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
          }

          .social-link[data-social="youtube"]:hover {
            background: #FF0000;
            box-shadow: 0 8px 20px rgba(255, 0, 0, 0.4);
          }

          /* Footer Links Section */
          .footer-section h4 {
            font-size: 1.1rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 28px;
            color: #FFFFFF;
            position: relative;
            display: inline-block;
          }

          .footer-section h4::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #c41e3a, #c41e3a, transparent);
            transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          .footer-section:hover h4::after {
            width: 100%;
          }

          .footer-links {
            list-style: none;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .footer-links li {
            width: 100%;
          }

          .footer-links a {
            color: rgba(255,255,255,0.6);
            text-decoration: none;
            font-size: 0.85rem;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: inline-flex;
            align-items: center;
            gap: 8px;
            position: relative;
            padding: 5px 0;
          }

          .footer-links a::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 1px;
            background: #c41e3a;
            transition: width 0.3s ease;
          }

          .footer-links a:hover {
            color: #c41e3a;
            transform: translateX(10px);
          }

          .footer-links a:hover::before {
            width: 100%;
          }

          .footer-links a svg {
            width: 14px;
            height: 14px;
            opacity: 0;
            transform: translateX(-5px);
            transition: all 0.3s ease;
          }

          .footer-links a:hover svg {
            opacity: 1;
            transform: translateX(0);
          }

          /* Quick Links Grid for Volumes */
          .quick-links-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px 15px;
          }

          /* Bottom Bar */
          .footer-bottom {
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
          }

          .copyright {
            font-size: 0.75rem;
            color: rgba(255,255,255,0.5);
            transition: all 0.3s ease;
          }

          .copyright:hover {
            color: rgba(255,255,255,0.8);
            transform: translateX(3px);
          }

          .copyright .heart {
            color: #c41e3a;
            display: inline-block;
            transition: transform 0.3s ease;
          }

          .copyright:hover .heart {
            transform: scale(1.2);
          }

          .payment-methods {
            display: flex;
            gap: 15px;
          }

          .payment-icon {
            font-size: 1.5rem;
            color: rgba(255,255,255,0.4);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
          }

          .payment-icon:hover {
            color: #FFFFFF;
            transform: translateY(-4px) scale(1.1);
          }

          /* Scroll to Top Button */
          .scroll-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #c41e3a;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(196, 30, 58, 0.4);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            opacity: 0;
            visibility: hidden;
          }

          .scroll-top.show {
            opacity: 1;
            visibility: visible;
          }

          .scroll-top:hover {
            transform: translateY(-5px) scale(1.1);
            box-shadow: 0 8px 25px rgba(196, 30, 58, 0.6);
          }

          /* Responsive */
          @media (max-width: 1024px) {
            .footer-container {
              padding: 50px 32px 30px;
            }
            .footer-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 40px;
            }
          }

          @media (max-width: 768px) {
            .footer-container {
              padding: 40px 24px 30px;
            }
            .footer-grid {
              grid-template-columns: 1fr;
              gap: 40px;
              text-align: center;
            }
            .footer-section h4::after {
              left: 50%;
              transform: translateX(-50%);
            }
            .footer-section h4 {
              display: block;
              text-align: center;
            }
            .footer-links {
              text-align: center;
            }
            .footer-links a {
              justify-content: center;
            }
            .footer-links a:hover {
              transform: translateX(0);
            }
            .social-links {
              justify-content: center;
            }
            .footer-logo {
              justify-content: center;
            }
            .footer-description {
              text-align: center;
            }
            .footer-description:hover {
              transform: translateX(0);
            }
            .footer-bottom {
              flex-direction: column;
              text-align: center;
            }
            .scroll-top {
              bottom: 20px;
              right: 20px;
              width: 45px;
              height: 45px;
            }
            .quick-links-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }
          }

          @media (max-width: 640px) {
            .footer-container {
              padding: 40px 20px 30px;
            }
          }
        `}
      </style>

      <div className="footer-container">
        {/* Footer Grid */}
        <div className="footer-grid">
          {/* Logo & Social Links Section */}
          <div className="footer-logo-section">
            <div className="footer-logo">
              <img src={logo} alt="Izél Studio" className="footer-logo-img" />
              <div className="footer-logo-text">
                Izél <span>Studio</span>
              </div>
            </div>
            <p className="footer-description">
              Premium fashion house redefining contemporary elegance with sustainable practices. 
              Each piece tells a story of craftsmanship and timeless design.
            </p>
            
            {/* Social Media Links - Facebook, Instagram, WhatsApp, YouTube */}
            <div className="social-links">
              <a
                href="https://www.facebook.com/izelstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                data-social="facebook"
              >
                <FaFacebookF size={18} fill='white' />
              </a>
              <a
                href="https://www.instagram.com/izelstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                data-social="instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://wa.me/923001561562"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                data-social="whatsapp"
              >
                <FaWhatsapp size={18} />
              </a>
              <a
                href="https://www.youtube.com/@izelstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                data-social="youtube"
              >
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links - Home + Volumes */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            {loading ? (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Loading collections...</div>
            ) : (
              <ul className="footer-links quick-links-grid">
                <li>
                  <Link to="/">
                    <ChevronRight size={14} />
                    Home
                  </Link>
                </li>
                {volumes.map((volume, index) => (
                  <li key={volume._id}>
                    <Link to={`/view/volume/${volume._id}`}>
                      <ChevronRight size={14} />
                      {volume.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Empty third column for balance */}
          <div className="footer-section">
            <h4>&nbsp;</h4>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} Izél Studio. All rights reserved. Made with{' '}
            <span className="heart">
              <Heart size={12} fill="#c41e3a" />
            </span>{' '}
            in Pakistan
          </div>
          <div className="payment-methods">
            <FaCcVisa className="payment-icon" />
            <FaCcMastercard className="payment-icon" />
            <FaPaypal className="payment-icon" />
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        className={`scroll-top ${showScrollTop ? 'show' : ''}`}
        onClick={scrollToTop}
      >
        <ArrowUp size={22} />
      </button>
    </footer>
  )
}

export default Footer