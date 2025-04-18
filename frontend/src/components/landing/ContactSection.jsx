import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ContactSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle form submission
        console.log("Form submitted")
    }

    return (
        <section id="contact" className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Have questions about Fusion ERP? Our team is here to help you find the right solution for your business.
                    </p>
                </motion.div>

                <div ref={ref} className="flex flex-col lg:flex-row gap-8">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full lg:w-1/3"
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>Reach out to us through any of these channels</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start">
                                    <Mail className="h-5 w-5 text-blue-500 mt-1 mr-3" />
                                    <div>
                                        <h4 className="font-medium">Email</h4>
                                        <p className="text-gray-600 dark:text-gray-400">fusionerp01@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Phone className="h-5 w-5 text-blue-500 mt-1 mr-3" />
                                    <div>
                                        <h4 className="font-medium">Phone</h4>
                                        <p className="text-gray-600 dark:text-gray-400">+91 9579353237</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <MapPin className="h-5 w-5 text-blue-500 mt-1 mr-3" />
                                    <div>
                                        <h4 className="font-medium">Office</h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            123 Business Avenue, Suite 500
                                            <br />
                                            Bhiwandi, Maharashtra
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-lg p-4">
                                    <h4 className="font-medium mb-2">Business Hours</h4>
                                    <p className="text-gray-600 dark:text-gray-400">Monday - Friday: 9AM - 6PM</p>
                                    <p className="text-gray-600 dark:text-gray-400">Saturday: 10AM - 4PM</p>
                                    <p className="text-gray-600 dark:text-gray-400">Sunday: Closed</p>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="w-full lg:w-2/3"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                                <CardDescription>Fill out the form below and we'll get back to you shortly</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" placeholder="John Doe" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" placeholder="fusionerp01@gmail.com" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone (Optional)</Label>
                                            <Input id="phone" placeholder="+91 9579353237" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company (Optional)</Label>
                                            <Input id="company" placeholder="Your Company" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>What are you interested in?</Label>
                                        <RadioGroup defaultValue="demo" className="flex flex-col space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="demo" id="demo" />
                                                <Label htmlFor="demo" className="cursor-pointer">
                                                    Schedule a Demo
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="support" id="support" />
                                                <Label htmlFor="support" className="cursor-pointer">
                                                    Technical Support
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="other" id="other" />
                                                <Label htmlFor="other" className="cursor-pointer">
                                                    Other
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea id="message" placeholder="Tell us about your business needs..." rows={5} required />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Message
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
