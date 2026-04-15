import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Activity, Thermometer, Droplets, Sun, Wind } from 'lucide-react';

export function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const xSpring = useSpring(0, { stiffness: 100, damping: 20 });
  const ySpring = useSpring(0, { stiffness: 100, damping: 20 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      xSpring.set((e.clientX / window.innerWidth - 0.5) * 20);
      ySpring.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [xSpring, ySpring]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10" />
        <img 
          src="/images/hero-garden.png" 
          alt="Futuristic Vertical Garden" 
          className="w-full h-full object-cover object-center scale-110"
        />
      </motion.div>

      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary/30 rounded-full blur-sm"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-20 flex flex-col items-center text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase">SISTEMAS BIOSMART ACTIVOS</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ x: xSpring, y: ySpring }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6"
        >
          El Futuro <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-secondary">
            Crece en la Ciudad
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 font-medium"
        >
          AgroSmart fusiona agricultura vertical, hidroponía de precisión y redes IoT para erradicar el hambre urbana. Nutrición inteligente, sostenible y conectada.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--primary),0.5)]">
            Explorar Tecnología <ArrowRight size={20} />
          </button>
          <button className="px-8 py-4 rounded-full bg-secondary/10 border border-secondary/20 text-foreground font-semibold text-lg flex items-center justify-center gap-2 hover:bg-secondary/20 transition-all backdrop-blur-sm">
            Ver Impacto
          </button>
        </motion.div>
      </div>

      {/* Floating Dashboard Elements */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="hidden lg:flex absolute left-10 top-1/2 -translate-y-1/2 flex-col gap-4 z-20"
      >
        <div className="glass-panel p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 flex items-center gap-4 hover:bg-background/60 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Thermometer size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Temperatura</p>
            <p className="text-lg font-mono font-bold text-foreground">22.4°C</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 flex items-center gap-4 hover:bg-background/60 transition-colors">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
            <Droplets size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Humedad</p>
            <p className="text-lg font-mono font-bold text-foreground">68%</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col gap-4 z-20"
      >
        <div className="glass-panel p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 flex items-center gap-4 hover:bg-background/60 transition-colors">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Sun size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Luz PAR</p>
            <p className="text-lg font-mono font-bold text-foreground">420 μmol</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 flex items-center gap-4 hover:bg-background/60 transition-colors">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">pH Solución</p>
            <p className="text-lg font-mono font-bold text-foreground">6.2</p>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-xs tracking-widest uppercase">DESCUBRIR</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-[1px] h-10 bg-gradient-to-b from-primary to-transparent"
        />
      </motion.div>
    </section>
  );
}
