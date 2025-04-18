import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FeatureHighlight() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    return (
        <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="container mx-auto px-4">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col lg:flex-row items-center gap-12"
                >
                    {/* Left side - Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full lg:w-1/2"
                    >
                        <div className="relative">
                            <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob"></div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                            <div className="absolute inset-0 w-64 h-64 mx-auto my-auto bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
                                <div className="flex justify-center mb-6">
                                    <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                                        <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-center mb-4">Connect with Other Businesses</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                                    Fusion ERP allows you to connect with other businesses using our platform, enabling seamless
                                    collaboration, supply chain integration, and business networking.
                                </p>
                                <div className="flex justify-center">
                                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                        Explore Network
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right side - Feature details */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="w-full lg:w-1/2"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Build Your Business Network</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                            In today's interconnected world, businesses thrive through collaboration. Fusion ERP's unique networking
                            feature allows you to:
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Connect directly with suppliers and customers",
                                "Share selected data and documents securely",
                                "Automate purchase orders and invoicing between businesses",
                                "Discover new business opportunities within the network",
                                "Build trusted relationships with verified partners",
                            ].map((item, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                    className="flex items-start"
                                >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1">
                                        <svg
                                            className="w-3.5 h-3.5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <span className="ml-3 text-gray-700 dark:text-gray-300">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                            Join Our Network
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
