import { Link } from "react-router-dom"
import { Facebook, Twitter, Linkedin, Instagram, Github, Mail } from "lucide-react"

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">F</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                                Fusion ERP
                            </span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            All-in-one business management software solution that helps organizations manage, streamline, and automate
                            business functions.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                                <Facebook size={20} />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                                <Twitter size={20} />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                                <Linkedin size={20} />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                                <Instagram size={20} />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                                <Github size={20} />
                                <span className="sr-only">GitHub</span>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#home" className="text-gray-400 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="#services" className="text-gray-400 hover:text-white transition-colors">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link href="#about" className="text-gray-400 hover:text-white transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="#contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Services</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Sales Management
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Customer Management
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Financial Transactions
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Employees Management
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Products Management
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                <a href="mailto:info@fusionerp.com" className="text-gray-400 hover:text-white transition-colors">
                                    info@fusionerp.com
                                </a>
                            </li>
                            <li className="text-gray-400">
                                123 Business Avenue, Suite 500
                                <br />
                                San Francisco, CA 94107
                            </li>
                            <li className="text-gray-400">+1 (555) 123-4567</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; {currentYear} Fusion ERP. All rights reserved.</p>
                        <div className="flex space-x-6">
                            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                    <div className="text-center mt-6 text-gray-500 text-sm">
                        <p>Made with ❤️ by Fusion Team</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
