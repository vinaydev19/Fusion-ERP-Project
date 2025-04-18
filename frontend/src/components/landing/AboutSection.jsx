import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { CheckCircle } from "lucide-react"
import image from "../../assets/logo.jpg"

export default function AboutSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    const benefits = [
        "Centralized data management",
        "Improved decision-making",
        "Streamlined business processes",
        "Enhanced productivity",
        "Real-time business insights",
        "Reduced operational costs",
    ]

    return (
        <section id="about" className="py-20 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left side - About content */}
                    <motion.div
                        ref={ref}
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        className="w-full lg:w-1/2"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">About Fusion ERP</h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                            Fusion ERP is an all-in-one business management software solution that helps organizations manage,
                            streamline, and automate business functions. With modules for accounting, finance, sales, and HR — Fusion
                            ERP centralizes your data, improves decision-making, and connects businesses together.
                        </p>
                        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                            With a modern UI and seamless experience, it's built for the future of business.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                                    className="flex items-center"
                                >
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right side - Image/Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="w-full lg:w-1/2"
                    >
                        <div className="relative">
                            <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70"></div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70"></div>

                            <div className="relative rounded-2xl overflow-hidden shadow-xl">
                                <div className="aspect-w-16 aspect-h-9">
                                    <img
                                        src={image}
                                        alt="Fusion ERP Dashboard"
                                        className="object-cover w-full h-full rounded-2xl"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 backdrop-blur-sm"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                                    <h3 className="text-white text-xl font-bold">Modern UI Experience</h3>
                                    <p className="text-white/80">Designed for productivity and ease of use</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
