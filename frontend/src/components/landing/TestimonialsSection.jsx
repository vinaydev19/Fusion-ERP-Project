import { useState, useRef, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import GMR from "../../assets/GMR.png"
import VR from "../../assets/VR.png"
import TTS from "../../assets/TTS.jpg"

const testimonials = [
    {
        id: 1,
        content:
            "Fusion ERP has completely transformed the way we manage our operations. From centralized data management to real-time business insights, everything we need is now at our fingertips. It has made our metal trading processes faster, more organized, and far more efficient.",
            author: "Ramnaresh Vishwakarma",
        role: "Owner",
        company: "Galaxy Metal Recyclers",
        avatar: GMR,
    },
    {
        id: 2,
        content:
            "Managing a transport business involves handling a lot of moving parts. Fusion ERP has helped us streamline our business processes, reduce operational costs, and improve decision-making. It's an essential part of our growth journey.",
            author: "Gaurav Pandey",
        role: "Owner",
        company: "Total Transport Solutions",
        avatar: TTS,
    },
    {
        id: 3,
        content:
            "Fusion ERP is the backbone of our daily operations. It has enhanced our productivity, simplified our finance and sales management, and given us powerful real-time insights to make better decisions. Highly recommended for any business looking to scale.",
        author: "Ashok Vishwakarma",
        role: "Owner",
        company: "Vishwakarma Enterprises",
        avatar: VR,
    },
]

export default function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    const nextTestimonial = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }

    const prevTestimonial = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAnimating(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [currentIndex])

    // Auto-advance testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            nextTestimonial()
        }, 6000)

        return () => clearInterval(interval)
    }, [currentIndex])

    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Discover how Fusion ERP has helped businesses transform their operations and achieve growth.
                    </p>
                </motion.div>

                <div ref={ref} className="relative max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg p-8 md:p-12">
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 text-blue-500 opacity-20">
                            <Quote size={120} />
                        </div>

                        <div className="relative z-10">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className="mb-8"
                            >
                                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic mb-6">
                                    "{testimonials[currentIndex].content}"
                                </p>

                                <div className="flex items-center">
                                    <Avatar className="h-12 w-12 mr-4">
                                        <AvatarImage
                                            src={testimonials[currentIndex].avatar || "/placeholder.svg"}
                                            alt={testimonials[currentIndex].author}
                                        />
                                        <AvatarFallback>
                                            {testimonials[currentIndex].author
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-bold text-lg">{testimonials[currentIndex].author}</h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentIndex === index
                                    ? "bg-blue-500"
                                    : "bg-gray-300 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-blue-800"
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            ></button>
                        ))}
                    </div>

                    {/* Arrow Controls */}
                    <button
                        onClick={prevTestimonial}
                        className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 md:-translate-x-full bg-white dark:bg-slate-700 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={nextTestimonial}
                        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 md:translate-x-full bg-white dark:bg-slate-700 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>
        </section>
    )
}
