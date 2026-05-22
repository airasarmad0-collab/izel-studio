import React, { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ShoppingBag, ArrowRight, Star, Truck, Shield, Clock, Award, Heart, Zap } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import banner_img from '../../../public/banner_img_instead_of_mahira.jpeg'

gsap.registerPlugin(ScrollTrigger)

const HomeBannerTwo = () => {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const contentRef = useRef(null)
  const floatingElementsRef = useRef([])
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(contentRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            once: true
          }
        }
      )

      // Image animation
      gsap.fromTo(imageRef.current,
        { x: 100, opacity: 0, scale: 0.8 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 80%",
            once: true
          }
        }
      )

      // Floating elements animation
      floatingElementsRef.current.forEach((el, index) => {
        gsap.to(el, {
          y: -20,
          duration: 2 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.3
        })
        
        gsap.to(el, {
          rotation: 360,
          duration: 20 + index * 5,
          repeat: -1,
          ease: "none"
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
    { icon: <Truck size={18} />, text: "Free Shipping Worldwide" },
    { icon: <Shield size={18} />, text: "100% Authentic" },
    { icon: <Clock size={18} />, text: "24/7 Customer Support" },
    { icon: <Award size={18} />, text: "Premium Quality" }
  ]

  return (
    <section className="home-banner-two" ref={sectionRef}>
      <style>
        {`
          .home-banner-two {
            position: relative;
            background: linear-gradient(135deg, #FDFBF7 0%, #F5F1EB 100%);
            padding: 60px 0;
            overflow: hidden;
            display: flex;
            align-items: center;
          }

          .banner-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 64px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            align-items: center;
            position: relative;
            z-index: 2;
          }

          /* Content Styles */
          .banner-content {
            position: relative;
          }

          .brand-name {
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: rgba(17, 17, 16, 0.5);
            margin-bottom: 16px;
          }

          .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(0, 0, 0, 0.05);
            padding: 8px 16px;
            border-radius: 40px;
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #111110;
            margin-bottom: 24px;
          }

          .badge .heart {
            color: #c41e3a;
          }

          .banner-title {
            font-family: 'Outfit', sans-serif;
            font-size: clamp(2rem, 4.5vw, 3.8rem);
            font-weight: 400;
            line-height: 1.2;
            color: #111110;
            margin-bottom: 20px;
          }

          .banner-title .izel {
            font-weight: 600;
            background: linear-gradient(135deg, #111110 0%, #555 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            position: relative;
            display: inline-block;
          }

          .banner-title .izel::after {
            content: '™';
            font-size: 0.5em;
            vertical-align: super;
            background: none;
            -webkit-text-fill-color: #c41e3a;
            color: #c41e3a;
          }

          .banner-description {
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            line-height: 1.6;
            color: rgba(17, 17, 16, 0.7);
            margin-bottom: 16px;
            max-width: 90%;
          }

          .studio-mission {
            font-family: 'Outfit', sans-serif;
            font-size: 0.9rem;
            line-height: 1.6;
            color: rgba(17, 17, 16, 0.6);
            margin-bottom: 32px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.5);
            border-left: 3px solid #c41e3a;
            font-style: italic;
          }

          /* Features */
          .features-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }

          .feature-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.8rem;
            color: rgba(17, 17, 16, 0.7);
            padding: 8px 0;
          }

          .feature-item svg {
            color: #c41e3a;
            flex-shrink: 0;
          }

          /* Button Group */
          .button-group {
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
          }

          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 32px;
            background: #111110;
            color: #FFFFFF;
            border: none;
            border-radius: 40px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.8rem;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            gap: 14px;
            background: #c41e3a;
          }

          .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 24px;
            background: transparent;
            color: #111110;
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 40px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.8rem;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
          }

          .btn-secondary:hover {
            background: #111110;
            color: #FFFFFF;
            border-color: #111110;
          }

          /* Image Styles - Wider and Taller */
          .banner-image-wrapper {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }

          .banner-image {
            width: 100%;
            max-width: 550px;
            height: 90vh;
            aspect-ratio: 4 / 5;
            object-fit: cover;
            position: relative;
            z-index: 2;
            border-radius: 30px;
            box-shadow: 0 30px 50px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            display: block;
          }

          .banner-image:hover {
            transform: scale(1.02);
            box-shadow: 0 40px 60px rgba(0, 0, 0, 0.2);
          }

          /* Image decorative border */
          .image-border {
            position: absolute;
            top: -15px;
            left: -15px;
            right: -15px;
            bottom: -15px;
            border: 2px dashed rgba(196, 30, 58, 0.3);
            border-radius: 40px;
            z-index: 1;
            pointer-events: none;
          }

          /* Floating Elements */
          .floating-element {
            position: absolute;
            z-index: 1;
            pointer-events: none;
          }

          .float-1 {
            top: 10%;
            left: 5%;
          }

          .float-2 {
            bottom: 15%;
            right: 8%;
          }

          .float-3 {
            top: 30%;
            right: 15%;
          }

          .float-4 {
            bottom: 25%;
            left: 10%;
          }

          .float-5 {
            top: 50%;
            left: -5%;
          }

          /* Background Decor */
          .bg-decor {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            z-index: 0;
          }

          .circle-1 {
            position: absolute;
            top: -20%;
            right: -10%;
            width: 400px;
            height: 400px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(196,30,58,0.03) 0%, rgba(0,0,0,0) 70%);
          }

          .circle-2 {
            position: absolute;
            bottom: -20%;
            left: -10%;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(196,30,58,0.03) 0%, rgba(0,0,0,0) 70%);
          }

          /* Responsive Design */
          @media (max-width: 1200px) {
            .banner-container {
              gap: 40px;
            }
            .banner-image {
              max-width: 500px;
            }
          }

          @media (max-width: 1024px) {
            .banner-container {
              padding: 0 32px;
              gap: 40px;
            }
            .banner-description {
              max-width: 100%;
            }
            .features-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .banner-image {
              max-width: 450px;
            }
          }

          @media (max-width: 900px) {
            .banner-container {
              grid-template-columns: 1fr;
              gap: 50px;
              text-align: center;
            }
            .banner-content {
              order: 2;
            }
            .banner-image-wrapper {
              order: 1;
            }
            .features-grid {
              justify-content: center;
              text-align: left;
              max-width: 400px;
              margin: 0 auto 32px auto;
            }
            .button-group {
              justify-content: center;
            }
            .banner-description {
              max-width: 100%;
              margin: 0 auto 16px auto;
            }
            .studio-mission {
              text-align: left;
              max-width: 500px;
              margin: 0 auto 32px auto;
            }
            .banner-image {
              max-width: 400px;
            }
            .floating-element {
              display: none;
            }
          }

          @media (max-width: 768px) {
            .home-banner-two {
              padding: 50px 0;
            }
            .banner-container {
              padding: 0 24px;
              gap: 40px;
            }
            .banner-image {
              max-width: 350px;
            }
            .banner-title {
              font-size: 2rem;
            }
            .banner-description {
              font-size: 0.9rem;
            }
            .studio-mission {
              font-size: 0.8rem;
              padding: 12px;
            }
            .features-grid {
              gap: 12px;
            }
            .feature-item {
              font-size: 0.75rem;
            }
            .btn-primary,
            .btn-secondary {
              padding: 10px 24px;
              font-size: 0.7rem;
            }
          }

          @media (max-width: 640px) {
            .banner-container {
              padding: 0 20px;
            }
            .features-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }
            .button-group {
              flex-direction: column;
              width: 100%;
            }
            .btn-primary,
            .btn-secondary {
              width: 100%;
              justify-content: center;
            }
            .banner-image {
              max-width: 280px;
            }
            .image-border {
              top: -10px;
              left: -10px;
              right: -10px;
              bottom: -10px;
            }
          }

          @media (max-width: 480px) {
            .banner-image {
              max-width: 250px;
            }
            .banner-title {
              font-size: 1.8rem;
            }
            .brand-name {
              font-size: 0.6rem;
            }
            .badge {
              font-size: 0.6rem;
              padding: 6px 12px;
            }
          }
        `}
      </style>

      {/* Background Decor */}
      <div className="bg-decor">
        <div className="circle-1" />
        <div className="circle-2" />
      </div>

      {/* Floating Elements */}
      <div 
        className="floating-element float-1"
        ref={el => floatingElementsRef.current[0] = el}
      >
        <Heart size={40} fill="#c41e3a" color="#c41e3a" opacity={0.3} />
      </div>
      <div 
        className="floating-element float-2"
        ref={el => floatingElementsRef.current[1] = el}
      >
        <Star size={25} fill="#FFD700" color="#FFD700" opacity={0.4} />
      </div>
      <div 
        className="floating-element float-3"
        ref={el => floatingElementsRef.current[2] = el}
      >
        <Zap size={30} color="#c41e3a" opacity={0.3} />
      </div>
      <div 
        className="floating-element float-4"
        ref={el => floatingElementsRef.current[3] = el}
      >
        <Heart size={20} fill="#c41e3a" color="#c41e3a" opacity={0.4} />
      </div>
      <div 
        className="floating-element float-5"
        ref={el => floatingElementsRef.current[4] = el}
      >
        <Star size={35} fill="#FFD700" color="#FFD700" opacity={0.3} />
      </div>

      <div className="banner-container">
        {/* Left Content */}
        <motion.div 
          className="banner-content"
          ref={contentRef}
          style={{ y, opacity }}
        >
          <div className="brand-name">IZÉL STUDIO</div>

          <div className="badge">
            <Heart className="heart" size={14} fill="#c41e3a" />
            <span>EST. 2024 • PAKISTAN</span>
          </div>

          <h1 className="banner-title">
            Where <span className="izel">Izél</span><br />
            Meets Elegance
          </h1>

          <p className="banner-description">
            Izél Studio is a premium fashion house redefining contemporary elegance 
            with sustainable practices. Each piece tells a story of craftsmanship, 
            passion, and timeless design.
          </p>

          <div className="studio-mission">
            "Creating fashion that empowers, inspires, and respects our planet — 
            that's the Izél promise."
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {feature.icon}
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>

          
        </motion.div>

        {/* Right Image */}
        <motion.div 
          className="banner-image-wrapper"
          ref={imageRef}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="image-border" />
          <motion.img
            src={banner_img}
            alt="Izél Studio Collection"
            className="banner-image"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>
    </section>
  )
}

export default HomeBannerTwo