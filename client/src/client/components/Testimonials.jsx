import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(3)
  const sectionRef = useRef(null)
  const headerRef = useRef(null)

  // Testimonials data with Pakistani names (9 total)
  const testimonials = [
    {
      id: 1,
      name: "Ayesha Khan",
      role: "Fashion Designer",
      location: "Karachi",
      rating: 5,
      text: "Absolutely love the quality! The fabric is premium and fits perfectly. Best clothing brand in Pakistan!",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
      date: "March 2024"
    },
    {
      id: 2,
      name: "Hamza Ali",
      role: "Style Consultant",
      location: "Lahore",
      rating: 5,
      text: "Exceptional craftsmanship and attention to detail. The latest collection is amazing. Highly recommended!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
      date: "February 2024"
    },
    {
      id: 3,
      name: "Fatima Rizvi",
      role: "Fashion Influencer",
      location: "Islamabad",
      rating: 5,
      text: "This brand has transformed my wardrobe. The pieces are versatile and incredibly comfortable.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
      date: "March 2024"
    },
    {
      id: 4,
      name: "Bilal Ahmed",
      role: "Creative Director",
      location: "Rawalpindi",
      rating: 4,
      text: "Great collection with unique designs. The quality is outstanding for the price.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
      date: "January 2024"
    },
    {
      id: 5,
      name: "Sana Tariq",
      role: "Fashion Stylist",
      location: "Multan",
      rating: 5,
      text: "Impressed by the attention to detail and quality. The pieces are elegant and perfect for any occasion.",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop",
      date: "February 2024"
    },
    {
      id: 6,
      name: "Usman Chaudhry",
      role: "Retail Buyer",
      location: "Faisalabad",
      rating: 5,
      text: "One of the best clothing brands I've discovered. The fit is perfect and customer service is excellent!",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
      date: "March 2024"
    },
    {
      id: 7,
      name: "Zara Malik",
      role: "Lifestyle Blogger",
      location: "Peshawar",
      rating: 5,
      text: "The attention to detail is unmatched. Every piece feels luxurious and looks stunning. Highly satisfied!",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&fit=crop",
      date: "January 2024"
    },
    {
      id: 8,
      name: "Omar Farooq",
      role: "Fashion Editor",
      location: "Quetta",
      rating: 4,
      text: "Beautiful designs and excellent craftsmanship. The fabric choices are thoughtful and comfortable.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
      date: "February 2024"
    },
    {
      id: 9,
      name: "Hira Naeem",
      role: "Sustainable Fashion Advocate",
      location: "Gujranwala",
      rating: 5,
      text: "Finally a brand that combines style with sustainability! Love their commitment to ethical fashion.",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop",
      date: "March 2024"
    }
  ]

  // Update itemsPerPage based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2)
      } else {
        setItemsPerPage(3)
      }
    }
    
    updateItemsPerPage()
    window.addEventListener('resize', updateItemsPerPage)
    return () => window.removeEventListener('resize', updateItemsPerPage)
  }, [])

  const totalPages = Math.ceil(testimonials.length / itemsPerPage)
  const currentTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  )

  const nextSlide = () => {
    if (currentIndex < totalPages - 1) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToPage = (pageIndex) => {
    setDirection(pageIndex > currentIndex ? 1 : -1)
    setCurrentIndex(pageIndex)
  }

  useEffect(() => {
    if (!headerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 85%", once: true },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="testimonials-wrapper" ref={sectionRef}>
      <style>
        {`
          .testimonials-wrapper {
            background: #FAFAF8;
            padding: 60px 0 80px;
            position: relative;
            overflow: hidden;
          }

          .testimonials-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 64px;
          }

          /* Header Styles */
          .testimonials-header {
            text-align: center;
            margin-bottom: 50px;
            opacity: 0;
          }

          .testimonials-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 0.6rem;
            font-weight: 500;
            letter-spacing: 0.26em;
            text-transform: uppercase;
            color: rgba(17,17,16,0.5);
            margin-bottom: 12px;
          }

          .testimonials-eyebrow::before,
          .testimonials-eyebrow::after {
            content: '';
            display: block;
            width: 30px;
            height: 1px;
            background: rgba(17,17,16,0.2);
          }

          .testimonials-title {
            font-family: 'Outfit', sans-serif;
            font-size: clamp(1.8rem, 3.5vw, 2.5rem);
            font-weight: 400;
            line-height: 1.2;
            color: #111110;
            margin-bottom: 12px;
            letter-spacing: -0.01em;
          }

          .testimonials-title em {
            font-style: italic;
            font-weight: 300;
            color: rgba(17,17,16,0.5);
          }

          .testimonials-subtitle {
            font-family: 'Outfit', sans-serif;
            font-size: 0.85rem;
            font-weight: 300;
            color: rgba(17,17,16,0.6);
            max-width: 500px;
            margin: 0 auto;
            line-height: 1.5;
          }

          /* Carousel Container */
          .carousel-container {
            position: relative;
            display: flex;
            align-items: center;
            gap: 16px;
          }

          /* Testimonials Grid */
          .testimonials-grid {
            flex: 1;
            min-height: 380px;
          }

          .grid-container {
            display: grid;
            gap: 24px;
            width: 100%;
          }

          /* Desktop: 3 columns */
          @media (min-width: 1024px) {
            .grid-container {
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
            }
          }

          /* Tablet: 2 columns */
          @media (min-width: 640px) and (max-width: 1023px) {
            .grid-container {
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
          }

          /* Mobile: 1 column */
          @media (max-width: 639px) {
            .grid-container {
              grid-template-columns: 1fr;
              gap: 16px;
            }
          }

          /* Testimonial Card */
          .testimonial-card {
            background: #FFFFFF;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.06);
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
          }

          .testimonial-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          }

          /* Profile Section */
          .profile-section {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .profile-image {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #FAFAF8;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .profile-info {
            flex: 1;
          }

          .profile-name {
            font-family: 'Outfit', sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            color: #111110;
            margin-bottom: 2px;
          }

          .profile-role {
            font-size: 0.65rem;
            font-weight: 400;
            color: rgba(17,17,16,0.6);
            margin-bottom: 2px;
          }

          .profile-location {
            font-size: 0.6rem;
            font-weight: 300;
            color: rgba(17,17,16,0.5);
          }

          /* Rating Stars */
          .rating {
            display: flex;
            gap: 3px;
            margin-bottom: 12px;
          }

          .star {
            width: 14px;
            height: 14px;
            color: #FFD700;
            fill: #FFD700;
          }

          /* Quote Icon */
          .quote-icon {
            color: rgba(17,17,16,0.06);
            margin-bottom: 10px;
          }
          .quote-icon svg {
            width: 20px;
            height: 20px;
          }

          /* Testimonial Text */
          .testimonial-text {
            font-family: 'Outfit', sans-serif;
            font-size: 0.82rem;
            line-height: 1.5;
            color: rgba(17,17,16,0.75);
            margin-bottom: 16px;
            flex: 1;
            font-style: italic;
          }

          /* Date */
          .testimonial-date {
            font-size: 0.6rem;
            color: rgba(17,17,16,0.4);
            letter-spacing: 0.05em;
          }

          /* Navigation Buttons */
          .nav-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: #FFFFFF;
            color: #111110;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
          }

          .nav-btn:hover:not(:disabled) {
            background: #111110;
            color: #FFFFFF;
            transform: scale(1.05);
            border-color: #111110;
          }

          .nav-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }

          /* Dots */
          .dots-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 40px;
          }

          .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(17,17,16,0.2);
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .dot.active {
            width: 24px;
            border-radius: 3px;
            background: #111110;
          }

          .dot:hover {
            background: rgba(17,17,16,0.5);
          }

          /* Responsive Padding */
          @media (max-width: 1024px) {
            .testimonials-container {
              padding: 0 32px;
            }
          }

          @media (max-width: 768px) {
            .testimonials-wrapper {
              padding: 50px 0 60px;
            }
            .testimonials-container {
              padding: 0 20px;
            }
            .carousel-container {
              gap: 12px;
            }
            .nav-btn {
              width: 38px;
              height: 38px;
            }
            .nav-btn svg {
              width: 18px;
              height: 18px;
            }
          }

          @media (max-width: 640px) {
            .testimonials-container {
              padding: 0 16px;
            }
            .carousel-container {
              gap: 8px;
            }
            .testimonial-card {
              padding: 16px;
            }
            .profile-image {
              width: 45px;
              height: 45px;
            }
            .profile-name {
              font-size: 0.9rem;
            }
            .testimonial-text {
              font-size: 0.8rem;
            }
            .nav-btn {
              width: 34px;
              height: 34px;
            }
          }
        `}
      </style>

      <div className="testimonials-container">
        {/* Header */}
        <div className="testimonials-header" ref={headerRef}>
          <div className="testimonials-eyebrow">
            <span>TESTIMONIALS</span>
          </div>
          <h2 className="testimonials-title">
            What Our <em>Customers Say</em>
          </h2>
          <p className="testimonials-subtitle">
            Real stories from happy customers across Pakistan
          </p>
        </div>

        {/* Carousel */}
        <div className="carousel-container">
          <button 
            className="nav-btn" 
            onClick={prevSlide} 
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="testimonials-grid">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ duration: 0.3 }}
                className="grid-container"
              >
                {currentTestimonials.map((testimonial, idx) => (
                  <motion.div
                    key={testimonial.id}
                    className="testimonial-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                  >
                    <div className="profile-section">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="profile-image"
                        loading="lazy"
                      />
                      <div className="profile-info">
                        <h3 className="profile-name">{testimonial.name}</h3>
                        <p className="profile-role">{testimonial.role}</p>
                        <p className="profile-location">{testimonial.location}</p>
                      </div>
                    </div>

                    <div className="rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="star" fill="#FFD700" />
                      ))}
                    </div>

                    <div className="quote-icon">
                      <Quote />
                    </div>

                    <p className="testimonial-text">"{testimonial.text}"</p>

                    <div className="testimonial-date">
                      {testimonial.date}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <button 
            className="nav-btn" 
            onClick={nextSlide} 
            disabled={currentIndex === totalPages - 1}
            aria-label="Next"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Dots */}
        <div className="dots-container">
          {[...Array(totalPages)].map((_, idx) => (
            <div
              key={idx}
              className={`dot ${currentIndex === idx ? 'active' : ''}`}
              onClick={() => goToPage(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials