import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

// 3D Model Component
function Model(props) {
  const [error, setError] = useState(false)

  // Use Suspense and ErrorBoundary pattern for 3D model loading
  try {
    // Instead of trying to load an external model that doesn't exist,
    // we'll create a simple 3D object directly
    return (
      <group {...props}>
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#4f46e5" />
        </mesh>
        <mesh position={[-2, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[2, 0, 0]}>
          <torusGeometry args={[0.8, 0.2, 16, 32]} />
          <meshStandardMaterial color="#06b6d4" />
        </mesh>
      </group>
    )
  } catch (err) {
    setError(true)
    return null
  }
}

// Fallback component if 3D model fails to load
function ModelFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-80 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-70 animate-pulse animation-delay-4000"></div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelError, setModelError] = useState(false)

  // Particles background
  const particlesRef = useRef(null)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Create particles
    const newParticles = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 1,
        speed: Math.random() * 0.3 + 0.1,
      })
    }
    setParticles(newParticles)

    // Animate particles
    const animateParticles = () => {
      if (particlesRef.current) {
        setParticles((prevParticles) =>
          prevParticles.map((particle) => ({
            ...particle,
            y: particle.y - particle.speed > 0 ? particle.y - particle.speed : 100,
          })),
        )
      }
      requestAnimationFrame(animateParticles)
    }

    const animationId = requestAnimationFrame(animateParticles)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <section
      id="home"
      className="relative min-h-screen pt-20 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Particles Background */}
      <div ref={particlesRef} className="absolute inset-0 z-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-blue-500 opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          ></div>
        ))}
      </div>

      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 z-0"></div>

      <div className="container mx-auto px-4 z-10 flex flex-col lg:flex-row items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Power Your Business with Fusion ERP
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">Smart. Scalable. Seamless.</p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link to="register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-8"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg">
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* 3D Model */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full lg:w-1/2 h-[400px] md:h-[500px]"
        >
          <div className="w-full h-full relative">
            {modelError ? (
              <ModelFallback />
            ) : (
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                  <Model position={[0, -1, 0]} onError={() => setModelError(true)} />
                </Float>
                <Environment preset="city" />
                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  )
}
