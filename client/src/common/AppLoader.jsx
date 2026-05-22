import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import logo from "../../public/logo.png";

const COLS = 10;

const AppLoader = ({ children }) => {
  const [done, setDone] = useState(false);

  const loaderRef = useRef(null);
  const sceneRef = useRef(null);
  const logoImgRef = useRef(null);
  const wordmarkRef = useRef(null);
  const fillRef = useRef(null);
  const pctRef = useRef(null);
  const panelRefs = useRef([]);

  useEffect(() => {
  if (done) {
    document.title = document.title; 
  }
}, [done]);

  useEffect(() => {
    if (!loaderRef.current) {
      setDone(true);
      return;
    }

    const H = window.innerHeight;

    // stairs start below
    panelRefs.current.forEach((p) => {
      if (p) p.style.transform = `translateY(${H}px)`;
    });

    const ctx = gsap.context(() => {
      gsap.set(sceneRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.92,
      });

      gsap.set(logoImgRef.current, {
        scale: 0.9,
        opacity: 1,
      });

      gsap.set(wordmarkRef.current, {
        opacity: 0,
        y: 10,
        letterSpacing: "0.5em",
      });

      gsap.set(fillRef.current, { width: "0%" });

      const tl = gsap.timeline();

      /* ── 1. CLEAN FASHION REVEAL ── */
      tl.to(sceneRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
      });

      /* wordmark fade */
      tl.to(
        wordmarkRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
        },
        "<0.1",
      );

      /* logo subtle zoom-in (luxury feel) */
      tl.to(
        logoImgRef.current,
        {
          scale: 1.08,
          duration: 0.4,
          ease: "power2.out",
        },
        "<",
      );

      /* ── 2. MINIMAL STORE LOADING BAR ── */
      const counter = { v: 0 };

      tl.to(
        fillRef.current,
        {
          width: "100%",
          duration: 0.9,
          ease: "power1.inOut",
        },
        "<",
      );

      tl.to(
        counter,
        {
          v: 100,
          duration: 0.9,
          onUpdate: () => {
            if (pctRef.current) {
              pctRef.current.textContent = `${Math.round(counter.v)}%`;
            }
          },
        },
        "<",
      );

      /* ── 3. EDITORIAL FADE SHIFT (NOT LEFT-RIGHT DRIFT) ── */

      // soft upward lift (like runway camera rise)
      tl.to(sceneRef.current, {
        y: -12,
        scale: 1.03,
        duration: 0.6,
        ease: "power2.inOut",
      });

      // gentle push-in (luxury zoom)
      tl.to(sceneRef.current, {
        scale: 1.12,
        duration: 0.6,
        ease: "power2.inOut",
      });

      // final settle (center lock)
      tl.to(sceneRef.current, {
        y: -6,
        scale: 1.05,
        duration: 0.4,
        ease: "power2.out",
      });

      /* ── 4. EXIT (clean fashion fade) ── */
      tl.to(wordmarkRef.current, {
        opacity: 0,
        letterSpacing: "0.8em",
        duration: 0.25,
      });

      tl.to(
        sceneRef.current,
        {
          opacity: 0,
          scale: 1.15,
          duration: 0.5,
          ease: "power2.in",
        },
        "<",
      );

      /* ── 5. STAIR CURTAIN WIPE (UNCHANGED EFFECT) ── */
      const reversed = [...panelRefs.current].reverse();

      reversed.forEach((panel, idx) => {
        if (!panel) return;

        tl.to(
          panel,
          {
            y: 0,
            duration: 0.55,
            ease: "expo.inOut",
          },
          idx === 0 ? ">" : "-=0.48",
        );
      });

      tl.call(() => {
        requestAnimationFrame(() => {
          setDone(true);
        });
      });
    }, loaderRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {!done && (
        <div
          ref={loaderRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* STAIRS */}
          {Array.from({ length: COLS }).map((_, i) => (
            <div
              key={i}
              ref={(el) => (panelRefs.current[i] = el)}
              style={{
                position: "absolute",
                top: 0,
                left: `${(i / COLS) * 100}%`,
                width: `${100 / COLS + 0.3}%`,
                height: "100%",
                backgroundColor: "#0f0f0f",
                zIndex: 2,
                willChange: "transform",
              }}
            />
          ))}

          {/* CENTER BRAND */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <div
              ref={sceneRef}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                opacity: 0,
                willChange: "transform, opacity",
              }}
            >
              <img
                ref={logoImgRef}
                src={logo}
                alt=""
                style={{
                  width: 184,
                  height: 84,
                  objectFit: "contain",
                  filter: "brightness(0)",
                }}
              />

              <div
                ref={wordmarkRef}
                style={{
                  fontFamily: "'Helvetica Neue', Arial",
                  fontSize: 10,
                  letterSpacing: "0.5em",
                  textTransform: "uppercase",
                  color: "#111",
                  opacity: 0,
                }}
              >
                Brand
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              width: 170,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              zIndex: 1,
            }}
          >
            <span
              ref={pctRef}
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                color: "#aaa",
              }}
            >
              0%
            </span>

            <div style={{ width: "100%", height: 1, background: "#e5e5e5" }}>
              <div
                ref={fillRef}
                style={{
                  height: "100%",
                  width: "0%",
                  background: "#111",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default AppLoader;
