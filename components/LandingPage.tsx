'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Box, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { 
  Smartphone, 
  Zap, 
  Code, 
  Download, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  Github,
  Twitter,
  BookOpen,
  Sparkles,
  Brain,
  Wand2
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "AI-Powered Generation",
    description: "Generate complete React Native apps from natural language prompts using advanced AI",
    color: "from-yellow-400 to-orange-500"
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Native Features", 
    description: "Full support for camera, GPS, notifications, storage, and other native device capabilities",
    color: "from-blue-400 to-blue-600"
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "Real-time Preview",
    description: "Live code preview with syntax highlighting and project structure visualization", 
    color: "from-green-400 to-emerald-500"
  },
  {
    icon: <Download className="w-8 h-8" />,
    title: "EAS Build Integration",
    description: "One-click builds for Android and iOS using Expo Application Services",
    color: "from-purple-400 to-purple-600"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Project Management", 
    description: "Save, version, and share your projects with advanced workspace management",
    color: "from-pink-400 to-rose-500"
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "Everything Free",
    description: "Access all features, unlimited projects, and full functionality - completely free forever",
    color: "from-cyan-400 to-blue-500"
  }
]

const stats = [
  { value: "100%", label: "Free Forever" },
  { value: "∞", label: "Projects" },
  { value: "24/7", label: "AI Available" },
  { value: "0$", label: "Cost" }
]

// Low-poly Laptop 3D Model
function LaptopModel({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const laptopRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (laptopRef.current) {
      laptopRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })
  
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <group ref={laptopRef} position={position} rotation={rotation}>
        {/* Laptop Base */}
        <RoundedBox args={[3, 0.2, 2]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        
        {/* Laptop Screen */}
        <RoundedBox args={[2.8, 1.8, 0.1]} radius={0.05} smoothness={4} position={[0, 1.2, -0.9]} rotation={[-0.1, 0, 0]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
        </RoundedBox>
        
        {/* Screen Display */}
        <Box args={[2.6, 1.6, 0.01]} position={[0, 1.2, -0.85]} rotation={[-0.1, 0, 0]}>
          <meshStandardMaterial color="#000000" emissive="#1a4d4d" emissiveIntensity={0.3} />
        </Box>
        
        {/* Code Lines on Screen */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Box 
            key={i} 
            args={[2.2 - i * 0.1, 0.05, 0.005]} 
            position={[-0.2, 1.6 - i * 0.15, -0.84]} 
            rotation={[-0.1, 0, 0]}
          >
            <meshStandardMaterial 
              color={i % 3 === 0 ? "#00ff00" : i % 3 === 1 ? "#0088ff" : "#ffaa00"}
              emissive={i % 3 === 0 ? "#004400" : i % 3 === 1 ? "#002244" : "#442200"}
              emissiveIntensity={0.4}
            />
          </Box>
        ))}
        
        {/* Keyboard */}
        <Box args={[2.6, 0.05, 1.6]} position={[0, 0.12, 0.2]}>
          <meshStandardMaterial color="#333333" />
        </Box>
        
        {/* Trackpad */}
        <RoundedBox args={[0.8, 0.01, 0.5]} radius={0.05} smoothness={4} position={[0, 0.13, 0.6]}>
          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
        </RoundedBox>
      </group>
    </Float>
  )
}

// Low-poly Smartphone 3D Model
function SmartphoneModel({ position, rotation, color = "#1a1a1a" }: { position: [number, number, number], rotation: [number, number, number], color?: string }) {
  const phoneRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.05
    }
  })
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={phoneRef} position={position} rotation={rotation}>
        {/* Phone Body */}
        <RoundedBox args={[0.8, 1.6, 0.08]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </RoundedBox>
        
        {/* Screen */}
        <RoundedBox args={[0.7, 1.4, 0.005]} radius={0.05} smoothness={4} position={[0, 0, 0.045]}>
          <meshStandardMaterial color="#000000" emissive="#001122" emissiveIntensity={0.3} />
        </RoundedBox>
        
        {/* App Icons Grid */}
        {Array.from({ length: 12 }).map((_, i) => {
          const row = Math.floor(i / 3)
          const col = i % 3
          return (
            <RoundedBox 
              key={i}
              args={[0.12, 0.12, 0.002]} 
              radius={0.02} 
              smoothness={4}
              position={[-0.15 + col * 0.15, 0.3 - row * 0.15, 0.048]}
            >
              <meshStandardMaterial 
                color={`hsl(${i * 30}, 70%, 60%)`} 
                emissive={`hsl(${i * 30}, 70%, 30%)`} 
                emissiveIntensity={0.4}
              />
            </RoundedBox>
          )
        })}
        
        {/* Home Indicator */}
        <RoundedBox args={[0.3, 0.02, 0.001]} radius={0.01} smoothness={4} position={[0, -0.65, 0.046]}>
          <meshStandardMaterial color="#666666" />
        </RoundedBox>
      </group>
    </Float>
  )
}

// Low-poly Code Editor 3D Model
function CodeEditorModel({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const editorRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (editorRef.current) {
      editorRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })
  
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={editorRef} position={position} rotation={rotation}>
        {/* Editor Window */}
        <RoundedBox args={[2, 1.5, 0.1]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#1e1e1e" metalness={0.1} roughness={0.8} />
        </RoundedBox>
        
        {/* Title Bar */}
        <Box args={[2, 0.2, 0.01]} position={[0, 0.65, 0.051]}>
          <meshStandardMaterial color="#333333" />
        </Box>
        
        {/* Window Controls */}
        {[0, 1, 2].map((i) => (
          <Sphere key={i} args={[0.03]} position={[-0.8 + i * 0.08, 0.65, 0.06]}>
            <meshStandardMaterial 
              color={i === 0 ? "#ff5f57" : i === 1 ? "#ffbd2e" : "#28ca42"} 
              emissive={i === 0 ? "#aa3333" : i === 1 ? "#aa7700" : "#1a7a1a"}
              emissiveIntensity={0.3}
            />
          </Sphere>
        ))}
        
        {/* Code Lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <Box 
            key={i}
            args={[1.6 - Math.random() * 0.4, 0.03, 0.005]} 
            position={[-0.2 + Math.random() * 0.1, 0.4 - i * 0.1, 0.052]}
          >
            <meshStandardMaterial 
              color={i % 4 === 0 ? "#569cd6" : i % 4 === 1 ? "#9cdcfe" : i % 4 === 2 ? "#ce9178" : "#dcdcaa"}
              emissive={i % 4 === 0 ? "#2a4d6b" : i % 4 === 1 ? "#4d6e7f" : i % 4 === 2 ? "#67483c" : "#6e6e55"}
              emissiveIntensity={0.2}
            />
          </Box>
        ))}
        
        {/* Cursor */}
        <Box args={[0.02, 0.08, 0.008]} position={[0.3, 0.1, 0.054]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </Box>
      </group>
    </Float>
  )
}

// Enhanced AI Brain Core with Neural Network
function AIBrainCore() {
  const brainRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })
  
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.3}>
      <group ref={brainRef}>
        {/* Central Brain Core */}
        <Sphere args={[1.2, 32, 32]}>
          <MeshDistortMaterial
            color="#8B5CF6"
            emissive="#4C1D95"
            emissiveIntensity={0.4}
            distort={0.2}
            speed={3}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
        
        {/* Neural Network Nodes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const radius = 2.5
          return (
            <Float key={i} speed={1 + i * 0.1} rotationIntensity={0.5}>
              <Sphere 
                args={[0.15, 16, 16]}
                position={[
                  Math.cos(angle) * radius, 
                  Math.sin(angle) * radius * 0.3, 
                  Math.sin(angle + Math.PI / 2) * radius * 0.4
                ]}
              >
                <meshStandardMaterial 
                  color="#EC4899" 
                  emissive="#EC4899" 
                  emissiveIntensity={0.6}
                  metalness={0.9}
                  roughness={0.1}
                />
              </Sphere>
            </Float>
          )
        })}
        
        {/* Data Connections */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <Box 
              key={i}
              args={[0.02, 2, 0.02]} 
              position={[
                Math.cos(angle) * 1.8, 
                0, 
                Math.sin(angle) * 1.8
              ]}
              rotation={[0, angle, 0]}
            >
              <meshStandardMaterial 
                color="#00ffff" 
                emissive="#007777" 
                emissiveIntensity={0.8}
                transparent
                opacity={0.7}
              />
            </Box>
          )
        })}
      </group>
    </Float>
  )
}

// Floating Development Icons
function DevIcon({ position, icon, color }: { position: [number, number, number], icon: string, color: string }) {
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={0.8}>
      <group position={position}>
        <RoundedBox args={[0.6, 0.6, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </RoundedBox>
        
        {/* Icon representation with simple geometry */}
        {icon === 'react' && (
          <>
            <Sphere args={[0.1]} position={[0, 0, 0.06]}>
              <meshStandardMaterial color="#61dafb" emissive="#61dafb" emissiveIntensity={0.5} />
            </Sphere>
            {Array.from({ length: 3 }).map((_, i) => (
              <Box key={i} args={[0.3, 0.02, 0.02]} position={[0, 0, 0.06]} rotation={[0, 0, (i * Math.PI) / 3]}>
                <meshStandardMaterial color="#61dafb" transparent opacity={0.8} />
              </Box>
            ))}
          </>
        )}
        
        {icon === 'code' && (
          <>
            <Box args={[0.02, 0.2, 0.02]} position={[-0.1, 0, 0.06]} rotation={[0, 0, 0.3]}>
              <meshStandardMaterial color="#ffffff" />
            </Box>
            <Box args={[0.02, 0.2, 0.02]} position={[0.1, 0, 0.06]} rotation={[0, 0, -0.3]}>
              <meshStandardMaterial color="#ffffff" />
            </Box>
          </>
        )}
        
        {icon === 'mobile' && (
          <RoundedBox args={[0.15, 0.25, 0.02]} radius={0.02} smoothness={4} position={[0, 0, 0.06]}>
            <meshStandardMaterial color="#ffffff" />
          </RoundedBox>
        )}
      </group>
    </Float>
  )
}

// Fallback 2D Scene if 3D fails
function Fallback2DScene() {
  return (
    <div className="w-full h-96 relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-white/10">
      {/* Background with moving particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Central AI Brain */}
      <motion.div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
          <Brain className="w-10 h-10 text-white" />
        </div>
      </motion.div>
      
      {/* Floating Phones */}
      {[
        { x: -120, y: -80, rotation: -15 },
        { x: 120, y: -80, rotation: 15 },
        { x: -90, y: 100, rotation: -10 },
        { x: 90, y: 100, rotation: 10 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{
            marginLeft: pos.x,
            marginTop: pos.y,
            rotate: pos.rotation,
          }}
          animate={{
            y: [0, -10, 0],
            rotate: [pos.rotation, pos.rotation + 5, pos.rotation],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-12 h-20 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg border border-gray-600 shadow-xl">
            <div className="m-1 h-16 bg-gradient-to-b from-blue-500 to-purple-600 rounded-md opacity-80"></div>
          </div>
        </motion.div>
      ))}
      
      {/* Code Snippets */}
      {[
        { text: "<App />", x: -80, y: -120, color: "text-green-400" },
        { text: "useState()", x: 80, y: -120, color: "text-blue-400" },
        { text: "export", x: -100, y: 140, color: "text-yellow-400" },
        { text: "import", x: 100, y: 140, color: "text-red-400" },
      ].map((snippet, i) => (
        <motion.div
          key={i}
          className={`absolute left-1/2 top-1/2 ${snippet.color} font-mono text-sm font-bold`}
          style={{
            marginLeft: snippet.x,
            marginTop: snippet.y,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {snippet.text}
        </motion.div>
      ))}
    </div>
  )
}

// Error Boundary for 3D Scene
function Scene3DErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('3D Scene Error:', error)
      setHasError(true)
    }
    
    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])
  
  if (hasError) {
    return <Fallback2DScene />
  }
  
  return <>{children}</>
}

// Main 3D Scene Component with Low-Poly Models
function AppBuildingScene3D() {
  const [isMounted, setIsMounted] = useState(false)
  const [use3D, setUse3D] = useState(true)
  
  useEffect(() => {
    setIsMounted(true)
    
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setUse3D(false)
      }
    } catch (e) {
      setUse3D(false)
    }
  }, [])
  
  if (!isMounted) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-white/10 animate-pulse">
        <div className="text-center text-white/70">
          <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-pulse" />
          <p className="text-lg">Initializing 3D Scene...</p>
        </div>
      </div>
    )
  }
  
  if (!use3D) {
    return <Fallback2DScene />
  }
  
  return (
    <Scene3DErrorBoundary>
      <div className="w-full h-96">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 50 }}
          shadows
          style={{ background: 'transparent' }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          dpr={[1, 2]}
          onCreated={(state) => {
            state.gl.setClearColor('#000000', 0)
          }}
          onError={(error) => {
            console.error('Canvas Error:', error)
            setUse3D(false)
          }}
        >
          <Suspense fallback={null}>
            {/* Optimized Lighting */}
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4F46E5" />
            <directionalLight position={[5, 5, 5]} intensity={0.6} />
            
            {/* Development Scene Models */}
            <LaptopModel position={[-4, 1, 0]} rotation={[0, 0.3, 0]} />
            <LaptopModel position={[4, -1, -1]} rotation={[0, -0.5, 0]} />
            
            <SmartphoneModel position={[-2, -2, 2]} rotation={[0.1, 0.5, 0]} color="#1a1a1a" />
            <SmartphoneModel position={[3, 2, 1]} rotation={[-0.1, -0.3, 0]} color="#2a2a2a" />
            <SmartphoneModel position={[-3, 2.5, -0.5]} rotation={[0.2, 0.8, 0]} color="#333333" />
            
            <CodeEditorModel position={[2, -3, 0.5]} rotation={[0.1, -0.2, 0]} />
            <CodeEditorModel position={[-1, 3.5, -1]} rotation={[-0.1, 0.4, 0]} />
            
            {/* AI Core in Center */}
            <AIBrainCore />
            
            {/* Development Icons */}
            <DevIcon position={[-5, 0, 2]} icon="react" color="#61dafb" />
            <DevIcon position={[5, 0, 1]} icon="code" color="#007acc" />
            <DevIcon position={[0, 4, -2]} icon="mobile" color="#4CAF50" />
            <DevIcon position={[-2, -4, 1]} icon="react" color="#FF6B6B" />
            <DevIcon position={[4, 3, -1]} icon="code" color="#FFD93D" />
            
            {/* Floating Particles */}
            {Array.from({ length: 15 }).map((_, i) => (
              <Float key={i} speed={0.5 + i * 0.1} rotationIntensity={0.2} floatIntensity={0.8}>
                <Sphere 
                  args={[0.05, 8, 8]}
                  position={[
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 10
                  ]}
                >
                  <meshStandardMaterial 
                    color={`hsl(${200 + i * 10}, 70%, 60%)`}
                    emissive={`hsl(${200 + i * 10}, 70%, 30%)`}
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.8}
                  />
                </Sphere>
              </Float>
            ))}
            
            {/* Interactive Controls */}
            <OrbitControls 
              enablePan={false} 
              enableZoom={true} 
              maxDistance={20} 
              minDistance={8}
              autoRotate
              autoRotateSpeed={0.3}
              enableDamping
              dampingFactor={0.05}
            />
          </Suspense>
        </Canvas>
      </div>
    </Scene3DErrorBoundary>
  )
}

// Smooth 3D Card Component 
const Smooth3DCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15
    setMousePosition({ x, y })
  }

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, type: "spring", stiffness: 100 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMousePosition({ x: 0, y: 0 })
      }}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? mousePosition.y * 0.3 : 0,
          rotateY: isHovered ? mousePosition.x * 0.3 : 0,
          scale: isHovered ? 1.02 : 1,
          z: isHovered ? 20 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  
  // Better UX Scroll Animations - Gentle reveals instead of fixed sections
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  
  // Smooth spring animations
  const smoothHeroY = useSpring(heroY, { stiffness: 100, damping: 30 })
  const smoothHeroOpacity = useSpring(heroOpacity, { stiffness: 100, damping: 30 })

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Fixed Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Prism
                </h1>
                <p className="text-xs text-purple-300">AI-Powered App Builder</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/docs" className="text-white/80 hover:text-white transition-colors">
                Docs
              </Link>
              <Link href="/pricing" className="text-white/80 hover:text-white transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/sign-in" className="text-white/80 hover:text-white transition-colors">
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/sign-up"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-2 rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
                >
                  Try Free Now
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Natural Scroll */}
      <motion.section 
        className="relative z-10 min-h-screen flex items-center justify-center pt-20"
        style={{ 
          y: smoothHeroY, 
          opacity: smoothHeroOpacity
        }}
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3"
              >
                <Wand2 className="w-4 h-4 text-purple-400" />
                <span className="text-white/90 text-sm font-medium">Completely Free • No Limits • No Credit Card</span>
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </motion.div>

              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Build Apps with
                </span>
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Crystal Clarity
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-xl text-white/70 leading-relaxed max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                Transform your ideas into production-ready React Native Expo apps using the power of AI. 
                Clear, simple, and precise - <span className="text-purple-400 font-semibold">Prism</span> makes it possible.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/builder"
                    className="group bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-2xl hover:shadow-purple-500/50 flex items-center space-x-3"
                  >
                    <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Start Building Free</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/docs"
                    className="group border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all backdrop-blur-sm hover:backdrop-blur-md flex items-center space-x-3"
                  >
                    <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>View Docs</span>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex flex-wrap gap-6 text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">100% Free Forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">No Installation Required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Export-Ready Code</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - 3D Scene */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 backdrop-blur-sm">
                <AppBuildingScene3D />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
              
              {/* Floating Stats */}
              <motion.div 
                className="absolute -bottom-8 -left-8 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 }}
              >
                <div className="text-3xl font-bold text-white">∞</div>
                <div className="text-sm text-white/70">Free Projects</div>
              </motion.div>
              
              <motion.div 
                className="absolute -top-8 -right-8 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.2 }}
              >
                <div className="text-3xl font-bold text-green-400">24/7</div>
                <div className="text-sm text-white/70">AI Available</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section - Progressive Reveal */}
      <motion.section 
        className="relative z-10 py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Smooth3DCard key={index} delay={index * 0.1}>
                <div className="text-center p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-3xl">
                  <motion.div 
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-white/70 font-medium">{stat.label}</div>
                </div>
              </Smooth3DCard>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section - Progressive Reveal */}
      <motion.section 
        className="relative z-10 py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Crystal Clear Features
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Every tool you need to transform ideas into production-ready apps, 
              polished to perfection with the clarity of a prism.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Smooth3DCard key={index} delay={index * 0.1}>
                <div className={`relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 overflow-hidden group hover:scale-105 transition-transform duration-300`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </Smooth3DCard>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section - Final Call to Action */}
      <motion.section 
        className="relative z-10 py-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-6">
          <Smooth3DCard>
            <div className="relative text-center p-16 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
              >
                <motion.div 
                  className="inline-flex items-center space-x-3 mb-8"
                  whileHover={{ scale: 1.1 }}
                >
                  <Wand2 className="w-8 h-8 text-purple-400" />
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                  <Brain className="w-8 h-8 text-pink-400" />
                </motion.div>
                
                <h2 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Ready to Transform
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Ideas into Apps?
                  </span>
                </h2>
                
                <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
                  Join thousands of developers using Prism to build the next generation of mobile apps. 
                  Start creating with crystal clarity today.
                </p>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/builder"
                    className="group inline-flex items-center space-x-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all shadow-2xl hover:shadow-purple-500/50"
                  >
                    <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <span>Create Your First App</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <motion.p 
                  className="text-white/50 text-sm mt-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  Free forever • No credit card required • Start building in seconds
                </motion.p>
              </motion.div>
            </div>
          </Smooth3DCard>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 py-16 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3 mb-8 md:mb-0"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Prism
                </h3>
                <p className="text-xs text-purple-300">AI-Powered App Builder</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-8">
              <Link href="/docs" className="text-white/70 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/support" className="text-white/70 hover:text-white transition-colors">
                Support
              </Link>
              <div className="flex items-center space-x-4">
                <motion.a 
                  href="https://github.com" 
                  className="text-white/70 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Github className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="https://twitter.com" 
                  className="text-white/70 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/50">
            <p>&copy; 2024 Prism. All rights reserved. Built with crystal clarity.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
