import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import DotText from '../components/DotMatrix/DotText';
import DOT_PRESETS from '../components/DotMatrix/dotPresets';
import styles from './About.module.css';

// Interactive 3D Tilt Card
function TiltFeatureCard({ feature, idx }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      key={feature.num}
      className={styles.featureItem}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, x: -60, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: idx * 0.15, type: "spring", stiffness: 80 }}
    >
      <DotText
        text={feature.num}
        {...DOT_PRESETS.subheading}
        animated={false}
        color="rgba(255,255,255,0.35)"
        style={{ transform: 'translateZ(30px)' }}
      />
      <DotText
        text={feature.text}
        {...DOT_PRESETS.subheading}
        animated={false}
        style={{ transform: 'translateZ(20px)' }}
      />
    </motion.div>
  );
}

export default function About() {
  const features = [
    { num: '01', text: 'PURE LOCAL PLAYBACK' },
    { num: '02', text: 'MATRIX LYRICS ENGINES' },
    { num: '03', text: 'ZERO DISTRACTIONS' },
  ];

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50
      });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  return (
    <div className={styles.page}>
      {/* Live Animated Background */}
      <div className={styles.liveBackground}>
        <motion.div 
          animate={{ x: mousePos.x * -1, y: mousePos.y * -1 }}
          transition={{ type: 'spring', damping: 40 }}
          className={styles.glow1} 
        />
        <motion.div 
          animate={{ x: mousePos.x * 2, y: mousePos.y * 2 }}
          transition={{ type: 'spring', damping: 30 }}
          className={styles.glow2} 
        />
        <motion.div 
          animate={{ x: mousePos.x * -1.5, y: mousePos.y * -1.5 }}
          transition={{ type: 'spring', damping: 50 }}
          className={styles.glow3} 
        />
      </div>

      <div className={styles.container}>
        <section className={styles.heroSection}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2, delayChildren: 0.1 }
              }
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 100, rotateX: 90 },
                visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
              }}
              style={{ perspective: 1000 }}
            >
              <DotText
                text="ABOUT"
                {...DOT_PRESETS.hero}
                animated
                className={styles.heading}
              />
              <div className={styles.divider}></div>
            </motion.div>

            <motion.p 
              className={styles.text}
              variants={{
                hidden: { opacity: 0, x: -50, filter: "blur(10px)" },
                visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
              }}
              style={{ marginTop: '24px' }}
            >
              A HIGH-FIDELITY, IMMERSIVE LOCAL MUSIC PLATFORM.
            </motion.p>
            
            <motion.p 
              className={styles.text}
              variants={{
                hidden: { opacity: 0, x: 50, filter: "blur(10px)" },
                visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
              }}
            >
              ENGINEERED WITH A MONOCHROMATIC, BRUTALIST NOTHING OS DESIGN LANGUAGE.
            </motion.p>
          </motion.div>

          <motion.div 
            className={styles.scrollIndicator}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <div className={styles.mouse}></div>
            SCROLL
          </motion.div>
        </section>

        {/* FEATURES SECTION WITH SCROLL ANIMATION */}
        <section className={styles.featuresSection}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 40 }}
          >
            <DotText
              text="CORE PILLARS"
              {...DOT_PRESETS.heading}
              animated={false}
              pulse
              className={styles.heading}
            />
            <div className={styles.divider} style={{ width: 80, height: 3 }}></div>
          </motion.div>

          <div className={styles.features}>
            {features.map((f, idx) => (
              <TiltFeatureCard key={f.num} feature={f} idx={idx} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ marginTop: 80, display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <DotText
              text="DESIGN PHILOSOPHY"
              {...DOT_PRESETS.heading}
              animated={false}
              className={styles.heading}
            />
            <div className={styles.divider} style={{ width: 80, height: 3 }}></div>
            <p className={styles.text} style={{ fontSize: '1rem', opacity: 0.6 }}>
              EVERY ELEMENT IN EUPHORIA HAS BEEN CRAFTED FROM THE GROUND UP TO OBEY
              A STRICT, MATHEMATICAL BRUTALISM. ZERO RADIUS. PERFECT ALIGNMENT.
              PURE MONOSPACE.
            </p>
            <p className={styles.text} style={{ fontSize: '1rem', opacity: 0.6 }}>
              NO DISTRACTIONS. NO ALGORITHMS. JUST YOU AND YOUR LOCAL AUDIO LIBRARY,
              ACCELERATED BY A KINETIC LYRICS ENGINE AND HARDWARE-ACCELERATED ANIMATIONS.
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
