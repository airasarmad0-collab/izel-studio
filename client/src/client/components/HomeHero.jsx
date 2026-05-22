import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import video1 from "../../../public/video_1.mp4";

gsap.registerPlugin(ScrollTrigger);

/* ── Fonts ── */
if (typeof document !== "undefined" && !document.getElementById("__fonts__")) {
  const link = document.createElement("link");
  link.id = "__fonts__";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Tenor+Sans&display=swap";
  document.head.appendChild(link);
}

/* ── Animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: d,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function HomeHero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const curtainRef = useRef(null);

  /* ── BACKGROUND LAYERS ── */
  const bg1 = useRef(null);
  const bg2 = useRef(null);
  const bg3 = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* ── GSAP ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // curtain reveal
      gsap.to(curtainRef.current, {
        scaleX: 0,
        transformOrigin: "right center",
        duration: 1.5,
        ease: "power4.inOut",
      });

      // video reveal
      gsap.fromTo(
        videoRef.current,
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 1.8, ease: "power3.out" }
      );

      // floating glow
      gsap.to(".gold-glow", {
        y: 25,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 🌌 animated background motion
      gsap.to(bg1.current, {
        x: 80,
        y: -60,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(bg2.current, {
        x: -100,
        y: 70,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(bg3.current, {
        x: 60,
        y: 100,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Responsive Styles */}
      <style>{`
        .home-hero-section {
          width: 100%;
          height: 100vh;
          background: #0c0a06;
          overflow: hidden;
          position: relative;
          font-family: 'Cormorant Garamond', serif;
        }

        .home-hero-content {
          width: 100%;
          height: 100vh;
          display: flex;
          position: relative;
          z-index: 2;
        }

        .home-hero-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 6vw;
        }

        .home-hero-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .home-hero-eyebrow {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 12px;
          letter-spacing: 0.35em;
          color: #c69e48;
          text-transform: uppercase;
          margin-top: 10vh;
        }

        .home-hero-title {
          font-size: clamp(60px, 6vw, 120px);
          color: #fff;
          font-weight: 300;
          line-height: 0.95;
          margin-top: 20px;
        }

        .home-hero-description {
          margin-top: 18px;
          font-size: 17px;
          color: rgba(255,255,255,0.72);
          max-width: 480px;
          line-height: 1.8;
        }

        .home-hero-video-wrapper {
          width: 85%;
          height: 70%;
          margin-top: 10vh;
        }

        .home-hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 30px;
          box-shadow: 0 40px 120px rgba(0,0,0,0.6);
        }

        .home-hero-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: rgba(198,158,72,0.18);
          filter: blur(130px);
          border-radius: 50%;
        }

        .home-hero-bg-layer {
          position: absolute;
          border-radius: 50%;
          z-index: 0;
        }

        .home-hero-curtain {
          position: fixed;
          inset: 0;
          background: #0c0a06;
          z-index: 50;
        }

        /* Tablet - Keep side by side layout */
        @media (max-width: 1024px) {
          .home-hero-section {
            height: 80vh;
          }

          .home-hero-content {
            height: 80vh;
            flex-direction: row;
          }

          .home-hero-left {
            flex: 1;
            padding: 0 5vw;
            justify-content: center;
          }

          .home-hero-right {
            flex: 1;
            justify-content: center;
            align-items: center;
          }

          .home-hero-eyebrow {
            font-size: 10px;
            margin-top: 0;
          }

          .home-hero-title {
            font-size: clamp(40px, 5vw, 60px);
            margin-top: 16px;
          }

          .home-hero-description {
            font-size: 14px;
            max-width: 90%;
          }

          .home-hero-video-wrapper {
            width: 80%;
            height: 60%;
            margin-top: 10vh;
          }

          .home-hero-glow {
            width: 300px;
            height: 300px;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .home-hero-section {
            height: auto;
            min-height: 100vh;
          }

          .home-hero-content {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
          }

          .home-hero-left {
            padding: 80px 6vw 30px;
            justify-content: flex-start;
            text-align: center;
            align-items: center;
          }

          .home-hero-eyebrow {
            font-size: 10px;
            letter-spacing: 0.25em;
            margin-top: 25vh;
          }

          .home-hero-title {
            font-size: clamp(36px, 10vw, 56px);
            margin-top: 16px;
          }

          .home-hero-description {
            font-size: 14px;
            max-width: 100%;
            text-align: center;
          }

          .home-hero-right {
            padding: 20px 0 60px;
          }

          .home-hero-video-wrapper {
            width: 92%;
            height: 300px;
            margin-top: 10vh;
          }

          .home-hero-video {
            border-radius: 20px;
          }

          .home-hero-glow {
            width: 250px;
            height: 250px;
          }
        }

        /* Small Mobile */
        @media (max-width: 480px) {
          .home-hero-left {
            padding: 60px 5vw 25px;
            justify-content: flex-start;
          }

          .home-hero-eyebrow {
            margin-top: 20vh;
          }

          .home-hero-title {
            font-size: clamp(32px, 11vw, 42px);
          }

          .home-hero-description {
            font-size: 13px;
            line-height: 1.6;
          }

          .home-hero-video-wrapper {
            width: 95%;
            height: 250px;
            margin-top: 5vh;
          }

          .home-hero-glow {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>

      <section ref={sectionRef} className="home-hero-section">
        {/* ───────── BACKGROUND LAYERS ───────── */}
        <div
          ref={bg1}
          className="home-hero-bg-layer"
          style={{
            width: "500px",
            height: "500px",
            top: "10%",
            left: "10%",
            background: "radial-gradient(circle, rgba(198,158,72,0.25), transparent 60%)",
            filter: "blur(90px)",
          }}
        />

        <div
          ref={bg2}
          className="home-hero-bg-layer"
          style={{
            width: "600px",
            height: "600px",
            bottom: "0%",
            right: "10%",
            background: "radial-gradient(circle, rgba(255,255,255,0.06), transparent 60%)",
            filter: "blur(120px)",
          }}
        />

        <div
          ref={bg3}
          className="home-hero-bg-layer"
          style={{
            width: "400px",
            height: "400px",
            top: "40%",
            right: "30%",
            background: "radial-gradient(circle, rgba(198,158,72,0.12), transparent 60%)",
            filter: "blur(120px)",
          }}
        />

        {/* ───────── CURTAIN ───────── */}
        <div ref={curtainRef} className="home-hero-curtain" />

        {/* ───────── HERO CONTENT ───────── */}
        <div className="home-hero-content">
          {/* LEFT */}
          <motion.div style={{ opacity }} initial="hidden" animate="visible" className="home-hero-left">
            <motion.p variants={fadeUp} custom={0.2} className="home-hero-eyebrow">
              Izel Studio · Eid Luxe Drop 2025
            </motion.p>

            <motion.h1 variants={fadeUp} custom={0.4} className="home-hero-title">
              THE ESSENCE <br />
              OF LUXURY
            </motion.h1>

            <motion.p variants={fadeUp} custom={0.6} className="home-hero-description">
              A luxury collection inspired by golden dunes, soft desert winds,
              and timeless feminine elegance. Each piece is crafted as a moment of
              quiet luxury.
            </motion.p>
          </motion.div>

          {/* RIGHT VIDEO */}
          <div className="home-hero-right">
            {/* GOLD GLOW */}
            <div className="gold-glow home-hero-glow" />

            {/* VIDEO */}
            <motion.div
              ref={videoRef}
              className="home-hero-video-wrapper"
              style={{ opacity: 2, scale: 1 }}
            >
              <video
                src={video1}
                autoPlay
                muted
                loop
                playsInline
                className="home-hero-video"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}