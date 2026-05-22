import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowDown, Heart, ShoppingBag, Sparkles } from 'lucide-react'
import { FaFacebookF, FaWhatsapp, FaInstagram, FaYoutube } from 'react-icons/fa'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import video from '../../../public/video_2.mp4'

gsap.registerPlugin(ScrollTrigger)

const HomeBanner = () => {
  const bannerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const buttonRef = useRef(null)
  const scrollHintRef = useRef(null)
  const socialLinksRef = useRef(null)
  const floatingElementsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" }
      })

      if (titleRef.current) {
        const titleChars = titleRef.current.querySelectorAll('.char')
        tl.fromTo(titleChars,
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.03, duration: 0.8 },
          0.2
        )
      }

      tl.fromTo(subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0.8
      )

      tl.fromTo(buttonRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1)" },
        1.1
      )

      const socialLinks = socialLinksRef.current?.querySelectorAll('.social-link')
      if (socialLinks) {
        gsap.fromTo(socialLinks,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.08, duration: 0.5, delay: 1.3 }
        )
      }

      floatingElementsRef.current.forEach((el, index) => {
        if (el) {
          gsap.to(el, {
            y: -15,
            duration: 2 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          })
        }
      })

      gsap.to(scrollHintRef.current, {
        y: 10,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: 1.5
      })
    }, bannerRef)

    return () => ctx.revert()
  }, [])

  const splitText = (text) => {
    return text.split('').map((char, index) => (
      <span key={index} className="char" style={{ display: 'inline-block' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  const socialLinks = [
    { icon: <FaFacebookF size={18} />, url: "https://www.facebook.com/share/1Eh4ZHHBWi", label: "Facebook" },
    { icon: <FaWhatsapp size={18} />, url: "https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you", label: "WhatsApp" },
    { icon: <FaInstagram size={18} />, url: "https://www.instagram.com/izelstudi.o?igsh=MWJyYjYyMGduYXg4Mg==", label: "Instagram" },
    { icon: <FaYoutube size={18} />, url: "https://youtube.com/@breezafashion6958?si=PeM4bVX1ls_4hsx8", label: "YouTube" }
  ]

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }
  }

  return (
    <div ref={bannerRef} className="home-banner-wrapper">
      <style>
        {`
          .home-banner-wrapper {
            position: relative;
            width: 100%;
            height: 100vh;
            min-height: 600px;
            overflow: hidden;
            background: #0a0a0a;
          }

          /* Video Container */
          .video-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.5 !important;
          }

          /* Lighter Overlay for better visibility */
          .banner-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              135deg,
              rgba(0, 0, 0, 0.3) 0%,
              rgba(0, 0, 0, 0.2) 50%,
              rgba(0, 0, 0, 0.3) 100%
            );
            z-index: 1;
          }

          /* Content Container */
          .banner-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            text-align: center;
            padding: 0 24px;
            color: #fff;
          }

          /* Main Title */
          .banner-title {
            font-family: 'Outfit', sans-serif;
            font-size: clamp(2.5rem, 7vw, 5rem);
            font-weight: 600;
            letter-spacing: -0.02em;
            margin-bottom: 20px;
            color: #fff;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
          }

          .banner-title .char {
            display: inline-block;
            opacity: 0;
          }

          /* Subtitle */
          .banner-subtitle {
            font-family: 'Outfit', sans-serif;
            font-size: clamp(0.9rem, 2vw, 1.2rem);
            font-weight: 400;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 40px;
            color: rgba(255, 255, 255, 0.9);
            max-width: 600px;
            line-height: 1.6;
          }

          /* Button Group */
          .button-group {
            display: flex;
            gap: 20px;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
          }

          /* Primary CTA Button */
          .banner-button-primary {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 32px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.85rem;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #000;
            background: #fff;
            border: none;
            border-radius: 40px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
          }

          .banner-button-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            gap: 15px;
          }

          /* Secondary CTA Button */
          .banner-button-secondary {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 32px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.85rem;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #fff;
            background: transparent;
            border: 1.5px solid rgba(255, 255, 255, 0.5);
            border-radius: 40px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            backdrop-filter: blur(10px);
          }

          .banner-button-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #fff;
            transform: translateY(-2px);
          }

          /* Social Links Container */
          .social-links-container {
            position: absolute;
            left: 30px;
            bottom: 30px;
            z-index: 2;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .social-link {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            opacity: 0;
          }

          .social-link:hover {
            background: #fff;
            color: #000;
            transform: translateY(-3px);
          }

          /* Scroll Hint */
          .scroll-hint {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.3s;
          }

          .scroll-hint:hover {
            opacity: 1;
          }

          .scroll-text {
            font-family: 'Outfit', sans-serif;
            font-size: 0.7rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #fff;
            font-weight: 300;
          }

          .scroll-arrow {
            width: 20px;
            height: 20px;
            color: #fff;
          }

          /* Floating Decorative Elements */
          .floating-element {
            position: absolute;
            z-index: 1;
            opacity: 0.3;
            color: #fff;
          }

          .floating-1 {
            top: 20%;
            left: 10%;
          }

          .floating-2 {
            bottom: 25%;
            right: 10%;
          }

          .floating-3 {
            top: 50%;
            right: 15%;
          }

          .floating-4 {
            bottom: 35%;
            left: 12%;
          }

          /* Right side collection link */
          .collection-link {
            position: absolute;
            right: 30px;
            bottom: 30px;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            color: #fff;
            text-decoration: none;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 10px 20px;
            border-radius: 40px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .collection-link:hover {
            background: #fff;
            color: #000;
            transform: translateX(-5px);
          }

          /* Responsive */
          @media (max-width: 768px) {
            .button-group {
              flex-direction: column;
              width: 100%;
              max-width: 280px;
            }

            .banner-button-primary,
            .banner-button-secondary {
              width: 100%;
              justify-content: center;
            }

            .social-links-container {
              left: 15px;
              bottom: 15px;
              gap: 8px;
            }

            .social-link {
              width: 35px;
              height: 35px;
            }

            .collection-link {
              right: 15px;
              bottom: 15px;
              padding: 8px 16px;
              font-size: 0.7rem;
            }

            .scroll-hint {
              bottom: 15px;
            }

            .floating-element {
              display: none;
            }
          }
        `}
      </style>

      {/* Video Background */}
      <div className="video-container">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={video} type="video/mp4" />
        </video>
      </div>

      {/* Light Overlay */}
      <div className="banner-overlay" />

      {/* Floating Decorative Elements */}
      <div 
        className="floating-element floating-1"
        ref={el => floatingElementsRef.current[0] = el}
      >
        <Sparkles size={30} />
      </div>
      <div 
        className="floating-element floating-2"
        ref={el => floatingElementsRef.current[1] = el}
      >
        <Heart size={25} />
      </div>
      <div 
        className="floating-element floating-3"
        ref={el => floatingElementsRef.current[2] = el}
      >
        <Sparkles size={20} />
      </div>
      <div 
        className="floating-element floating-4"
        ref={el => floatingElementsRef.current[3] = el}
      >
        <Heart size={28} />
      </div>

      {/* Content */}
      <div className="banner-content">
        <h1 ref={titleRef} className="banner-title">
          {splitText('ELEVATE YOUR STYLE')}
        </h1>
        
        <motion.p 
          ref={subtitleRef}
          className="banner-subtitle"
        >
          Discover the perfect blend of elegance and comfort
        </motion.p>

        <div className="button-group">
          <motion.button
            ref={buttonRef}
            className="banner-button-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollToSection('shop-section')}
          >
            <ShoppingBag size={16} /> Shop Collection
          </motion.button>

          <motion.button
            className="banner-button-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            onClick={() => scrollToSection('latest-collection')}
          >
            <ChevronRight size={16} /> Explore Now
          </motion.button>
        </div>
      </div>

      {/* Social Links */}
      <div ref={socialLinksRef} className="social-links-container">
        {socialLinks.map((social, index) => (
          <motion.a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {social.icon}
          </motion.a>
        ))}
      </div>

      {/* Collection Link - Right Side */}
      <motion.a
        href="#"
        className="collection-link"
        whileHover={{ x: -5 }}
        onClick={(e) => {
          e.preventDefault()
          scrollToSection('latest-collection')
        }}
      >
        View Full Collection <ArrowDown size={14} />
      </motion.a>

      {/* Scroll Hint */}
      <div 
        ref={scrollHintRef}
        className="scroll-hint"
        onClick={() => scrollToSection('latest-collection')}
      >
        <span className="scroll-text">Scroll</span>
        <ArrowDown className="scroll-arrow" />
      </div>
    </div>
  )
}

export default HomeBanner