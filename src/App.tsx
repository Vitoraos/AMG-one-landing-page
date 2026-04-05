import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ChevronDown, 
  Zap, 
  Gauge, 
  Timer, 
  Wind, 
  Cpu, 
  ArrowRight,
  Menu,
  X,
  Instagram,
  Twitter,
  Youtube,
  Box,
  Layers,
  Activity
} from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  ScrollControls, 
  Scroll, 
  useScroll, 
  Float, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  PerspectiveCamera, 
  Environment, 
  Text,
  ContactShadows,
  PresentationControls,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { cn } from './lib/utils';

gsap.registerPlugin(ScrollTrigger);

// --- 3D Components ---

const Particles = ({ count = 5000 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50;
      p[i * 3 + 1] = (Math.random() - 0.5) * 50;
      p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#00a19c" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

const FloatingHUD = () => {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const r1 = scroll.range(0, 1/4);
    const r2 = scroll.range(1/4, 1/2);
    const r3 = scroll.range(1/2, 3/4);
    
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.mouse.x * 0.2, 0.1);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.mouse.y * 0.2, 0.1);
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[-2, 1, -5]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#00a19c" emissive="#00a19c" emissiveIntensity={2} />
        </mesh>
      </Float>
      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[3, -2, -8]}>
          <torusGeometry args={[1, 0.02, 16, 100]} />
          <meshStandardMaterial color="#00a19c" emissive="#00a19c" emissiveIntensity={5} transparent opacity={0.3} />
        </mesh>
      </Float>
    </group>
  );
};

const Scene = () => {
  const scroll = useScroll();
  const gridRef = useRef<THREE.GridHelper>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const offset = scroll.offset;
    if (gridRef.current) {
      gridRef.current.position.z = (offset * 50) % 10;
    }
    if (groupRef.current) {
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, -offset * 20, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.mouse.x * 0.5, 0.1);
    }
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 5, 30]} />
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-10, -10, -10]} color="#00a19c" intensity={3} />
      
      <Particles />
      <FloatingHUD />
      
      <group ref={groupRef}>
        <gridHelper ref={gridRef} args={[100, 50, "#00a19c", "#1a1a1a"]} position={[0, -2, 0]} rotation={[0, 0, 0]} />
        
        {/* Abstract 3D "Car" representation */}
        <Float speed={5} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={[0, 0, -2]}>
            <capsuleGeometry args={[0.5, 2, 4, 32]} />
            <MeshDistortMaterial 
              color="#1a1a1a" 
              speed={2} 
              distort={0.3} 
              metalness={1} 
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.4, -2]}>
            <boxGeometry args={[1.2, 0.2, 3]} />
            <meshStandardMaterial color="#00a19c" emissive="#00a19c" emissiveIntensity={0.5} />
          </mesh>
        </Float>
      </group>
      
      <Environment preset="night" />
      <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={20} blur={2} far={4.5} />
    </>
  );
};

// --- UI Components ---

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(followerRef.current, { x: e.clientX - 10, y: e.clientY - 10, duration: 0.3 });
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor hidden md:block" />
      <div ref={followerRef} className="custom-cursor-follower hidden md:block" />
    </>
  );
};

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[100] bg-amg-black flex flex-col items-center justify-center"
    >
      <div className="bg-noise absolute inset-0 pointer-events-none" />
      <div className="relative mb-12">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-48 h-48 border-2 border-dashed border-petronas-green/20 rounded-full flex items-center justify-center"
        >
          <div className="w-40 h-40 border border-petronas-green/40 rounded-full" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black italic tracking-tighter">AMG</span>
        </div>
      </div>
      
      <div className="w-64 h-[2px] bg-white/5 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-petronas-green"
          initial={{ x: '-100%' }}
          animate={{ x: `${progress - 100}%` }}
        />
      </div>
      <div className="mt-4 font-mono text-[10px] tracking-[0.5em] text-amg-silver uppercase">
        Initializing Hyper-Drive: {progress}%
      </div>
    </motion.div>
  );
};

const HUDOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-petronas-green/30" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-petronas-green/30" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-petronas-green/30" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-petronas-green/30" />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[1px] bg-petronas-green/10 z-0"
      />

      {/* Side Gauges */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-1 h-8 bg-white/10 relative">
            <motion.div 
              animate={{ height: ['20%', '80%', '40%'] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              className="absolute bottom-0 w-full bg-petronas-green/40"
            />
          </div>
        ))}
      </div>
      
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-right font-mono text-[10px] text-amg-silver tracking-widest space-y-2">
        <div className="flex items-center justify-end gap-2">
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-2 h-2 bg-petronas-green rounded-full" />
          <p>LIVE_TELEMETRY</p>
        </div>
        <p>SYS_STABLE: 100%</p>
        <p>AERO_ACTIVE: TRUE</p>
        <p>DRS_READY: OK</p>
        <p>TEMP: 98°C</p>
        <div className="pt-4 border-t border-white/10">
          <p className="text-petronas-green">LAT: 48.9183° N</p>
          <p className="text-petronas-green">LON: 9.3242° E</p>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4 md:px-12 md:py-6 flex justify-between items-center",
      isScrolled ? "bg-amg-black/80 backdrop-blur-xl border-b border-white/5 py-3 md:py-4" : "bg-transparent"
    )}>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black italic tracking-tighter">AMG</span>
        <div className="h-6 w-[1px] bg-white/20 mx-2" />
        <span className="text-xs tracking-widest text-amg-silver hidden sm:block">ONE</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase font-medium">
        {['The Car', 'Performance', 'Aerodynamics', 'Gallery'].map((item) => (
          <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-petronas-green transition-colors">
            {item}
          </a>
        ))}
      </div>
      <button className="px-6 py-2 border border-white/20 hover:border-petronas-green hover:text-petronas-green transition-all text-xs tracking-widest uppercase font-bold">
        Inquire
      </button>
    </nav>
  );
};

const SectionHeading = ({ subtitle, title, align = "left" }: { subtitle: string, title: string, align?: "left" | "center" }) => (
  <div className={cn("space-y-4 mb-16", align === "center" ? "text-center" : "text-left")}>
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4"
    >
      <div className="h-[1px] w-12 bg-petronas-green" />
      <span className="text-petronas-green font-mono text-xs tracking-[0.5em] uppercase">{subtitle}</span>
    </motion.div>
    <h2 className="text-4xl md:text-7xl font-black uppercase italic leading-none tracking-tighter">{title}</h2>
  </div>
);

const SpecCard = ({ icon: Icon, label, value, unit, delay }: any) => {
  const [count, setCount] = useState(0);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const end = parseFloat(value.replace(/,/g, ''));
        const duration = 2000;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start * 10) / 10);
          }
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="bg-carbon/30 backdrop-blur-md border border-white/5 p-8 md:p-12 relative group overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-petronas-green/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      <Icon className="text-petronas-green mb-6 opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
      <p className="text-amg-silver text-[10px] tracking-[0.4em] uppercase mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl md:text-6xl font-black italic">{count.toLocaleString()}</span>
        <span className="text-amg-silver font-bold text-xs uppercase">{unit}</span>
      </div>
    </motion.div>
  );
};

const Footer = () => (
  <footer className="bg-amg-black pt-24 pb-12 px-6 md:px-24 border-t border-white/5 relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black italic tracking-tighter">AMG</span>
          <div className="h-8 w-[1px] bg-white/20 mx-2" />
          <span className="text-sm tracking-widest text-amg-silver">ONE</span>
        </div>
        <p className="text-amg-silver text-sm leading-relaxed max-w-xs">The ultimate expression of Mercedes-AMG performance. A masterpiece of engineering that brings Formula 1 technology to the road.</p>
        <div className="flex gap-4">
          <Instagram size={18} className="text-amg-silver hover:text-petronas-green cursor-pointer transition-colors" />
          <Twitter size={18} className="text-amg-silver hover:text-petronas-green cursor-pointer transition-colors" />
          <Youtube size={18} className="text-amg-silver hover:text-petronas-green cursor-pointer transition-colors" />
        </div>
      </div>
      <div>
        <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-8">Navigation</h4>
        <ul className="space-y-4 text-amg-silver text-xs tracking-widest">
          <li><a href="#the-car" className="hover:text-white transition-colors">The Car</a></li>
          <li><a href="#performance" className="hover:text-white transition-colors">Performance</a></li>
          <li><a href="#aerodynamics" className="hover:text-white transition-colors">Aerodynamics</a></li>
          <li><a href="#gallery" className="hover:text-white transition-colors">Gallery</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-8">Legal</h4>
        <ul className="space-y-4 text-amg-silver text-xs tracking-widest">
          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Cookie Settings</a></li>
        </ul>
      </div>
      <div className="space-y-8">
        <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-8">Stay Updated</h4>
        <div className="relative">
          <input type="email" placeholder="Email Address" className="w-full bg-transparent border-b border-white/20 py-3 px-0 text-xs focus:outline-none focus:border-petronas-green transition-colors" />
          <button className="absolute right-0 bottom-3 text-petronas-green hover:translate-x-1 transition-transform"><ArrowRight size={18} /></button>
        </div>
        <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-petronas-green transition-colors">Build Your ONE</button>
      </div>
    </div>
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-[10px] tracking-[0.3em] text-amg-silver uppercase font-medium">
      <p>© 2026 Mercedes-AMG GmbH. All Rights Reserved.</p>
      <p>Affalterbach, Germany</p>
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative bg-amg-black min-h-screen">
      <CustomCursor />
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <>
          <Navbar />
          <HUDOverlay />
          
          <div className="fixed inset-0 z-0">
            <Canvas shadows dpr={[1, 2]}>
              <Suspense fallback={null}>
                <ScrollControls pages={6} damping={0.2}>
                  <Scene />
                  
                  <Scroll html>
                    {/* Hero Section */}
                    <section className="h-screen w-screen flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 z-0">
                        <img 
                          src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070" 
                          alt="AMG ONE Hero" 
                          className="w-full h-full object-cover brightness-[0.3]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-amg-black via-transparent to-transparent" />
                      </div>
                      <div className="relative z-10 text-center">
                        <motion.h1 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="text-6xl md:text-[12vw] font-black leading-none tracking-tighter uppercase italic"
                        >
                          F1 <span className="text-petronas-green text-glow">FOR</span> THE <br/> STREET
                        </motion.h1>
                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1, duration: 0.8 }}
                          className="text-amg-silver tracking-[0.5em] uppercase text-xs md:text-sm mt-8 font-medium"
                        >
                          The Mercedes-AMG ONE Hypercar
                        </motion.p>
                      </div>
                    </section>

                    {/* Story Section */}
                    <section id="the-car" className="min-h-screen w-screen py-24 md:py-48 px-6 md:px-24 flex items-center">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center max-w-7xl mx-auto">
                        <div className="relative">
                          <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="relative z-10"
                          >
                            <img 
                              src="https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2070" 
                              alt="AMG ONE Engineering" 
                              className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700 rounded-sm"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute -bottom-8 -right-8 bg-petronas-green p-8 text-black font-black italic text-4xl">1.6L V6</div>
                          </motion.div>
                          <div className="absolute -top-12 -left-12 w-64 h-64 border border-white/5 rounded-full" />
                        </div>
                        <div className="space-y-8">
                          <SectionHeading subtitle="The Powertrain" title="Formula 1 Technology, Road Legal." />
                          <p className="text-amg-silver text-lg leading-relaxed font-light">
                            The heart of the Mercedes-AMG ONE is a 1.6-liter V6 turbo hybrid engine with four electric motors. It's the same unit used in the Mercedes-AMG Petronas Formula One cars, adapted for the road with a redline of 11,000 rpm.
                          </p>
                          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                            <div className="space-y-2">
                              <Activity className="text-petronas-green" size={20} />
                              <h4 className="text-white font-bold text-sm uppercase italic">Hybrid Drive</h4>
                              <p className="text-amg-silver text-xs">Four electric motors providing instant torque and AWD.</p>
                            </div>
                            <div className="space-y-2">
                              <Layers className="text-petronas-green" size={20} />
                              <h4 className="text-white font-bold text-sm uppercase italic">E-Turbo</h4>
                              <p className="text-amg-silver text-xs">Eliminating turbo lag via electric exhaust gas turbocharging.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Performance Section */}
                    <section id="performance" className="min-h-screen w-screen py-24 md:py-48 px-6 md:px-24 bg-amg-black/50 backdrop-blur-sm">
                      <div className="max-w-7xl mx-auto">
                        <SectionHeading subtitle="Performance" title="Unrivaled Metrics." align="center" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <SpecCard icon={Zap} label="Horsepower" value="1063" unit="HP" delay={0.1} />
                          <SpecCard icon={Gauge} label="Top Speed" value="352" unit="KM/H" delay={0.2} />
                          <SpecCard icon={Timer} label="0-100 KM/H" value="2.9" unit="SEC" delay={0.3} />
                          <SpecCard icon={Cpu} label="Redline" value="11000" unit="RPM" delay={0.4} />
                        </div>
                      </div>
                    </section>

                    {/* Aero Section */}
                    <section id="aerodynamics" className="min-h-screen w-screen py-24 md:py-48 px-6 md:px-24 flex items-center">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center max-w-7xl mx-auto">
                        <div className="order-2 lg:order-1 space-y-8">
                          <SectionHeading subtitle="Aerodynamics" title="Sculpted for Speed." />
                          <p className="text-amg-silver text-lg leading-relaxed font-light">
                            Active aerodynamics redefine the relationship between car and air. The AMG ONE features a multi-stage active rear wing and active flaps on the front diffuser, providing extreme downforce in "Track" mode.
                          </p>
                          <div className="flex flex-col gap-4">
                            {['Active Rear Wing', 'Front Diffuser Flaps', 'Wheel Arch Louvres'].map((item, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border-l-2 border-petronas-green">
                                <Wind className="text-petronas-green" size={16} />
                                <span className="text-xs tracking-widest uppercase font-bold">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="order-1 lg:order-2 relative">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="relative z-10"
                          >
                            <img 
                              src="https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=2070" 
                              alt="AMG ONE Aero" 
                              className="w-full aspect-video object-cover rounded-sm shadow-2xl"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 border border-petronas-green/20 -m-4 pointer-events-none" />
                          </motion.div>
                        </div>
                      </div>
                    </section>

                    {/* Gallery Section */}
                    <section id="gallery" className="py-24 px-6 md:px-24">
                      <div className="max-w-7xl mx-auto">
                        <SectionHeading subtitle="Visuals" title="The Masterpiece." align="center" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[
                            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000",
                            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000",
                            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000",
                            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000",
                            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000",
                            "https://images.unsplash.com/photo-1525609004556-c46c7d6cf048?q=80&w=1000"
                          ].map((src, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="relative group overflow-hidden aspect-[4/3]"
                            >
                              <img 
                                src={src} 
                                alt={`AMG ONE Gallery ${i}`} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-petronas-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Box className="text-white" size={32} />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <Footer />
                  </Scroll>
                </ScrollControls>
              </Suspense>
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
}
