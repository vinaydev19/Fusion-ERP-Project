import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import image from "../../assets/logo.jpg"

const companies = [
    { name: "TechCorp", logo: image },
    { name: "Innovate Inc", logo: image },
    { name: "Global Systems", logo: image },
    { name: "Future Tech", logo: image },
    { name: "Smart Solutions", logo: image },
    { name: "Apex Industries", logo: image },
]

export default function TrustedCompanies() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.2 })

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 },
        },
    }

    return (
        <section className="py-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Trusted by Leading Companies</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Join thousands of businesses that rely on Fusion ERP for their operations.
                    </p>
                </motion.div>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
                >
                    {companies.map((company, index) => (
                        <motion.div key={index} variants={itemVariants} className="flex justify-center">
                            <div className="w-32 h-16 relative grayscale hover:grayscale-0 transition-all duration-300">
                                <img
                                    src={company.logo || "/placeholder.svg"}
                                    alt={`${company.name} logo`}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
