import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ShoppingCart, ClipboardList, Users, Truck, UserCircle, CreditCard, FileText, Package } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const services = [
  {
    title: "Sales Management",
    description: "Track sales, manage customer orders, and analyze performance metrics.",
    icon: <ShoppingCart className="h-12 w-12 text-blue-500" />,
    color: "from-blue-400 to-blue-600",
  },
  {
    title: "Purchase Orders Management",
    description: "Create, track, and manage purchase orders with suppliers.",
    icon: <ClipboardList className="h-12 w-12 text-purple-500" />,
    color: "from-purple-400 to-purple-600",
  },
  {
    title: "Customer Management",
    description: "Manage customer relationships, track interactions, and store contact information.",
    icon: <Users className="h-12 w-12 text-indigo-500" />,
    color: "from-indigo-400 to-indigo-600",
  },
  {
    title: "Deliveries Management",
    description: "Track shipments, manage delivery schedules, and optimize logistics.",
    icon: <Truck className="h-12 w-12 text-green-500" />,
    color: "from-green-400 to-green-600",
  },
  {
    title: "Employees Management",
    description: "Manage employee data, track attendance, and handle payroll.",
    icon: <UserCircle className="h-12 w-12 text-red-500" />,
    color: "from-red-400 to-red-600",
  },
  {
    title: "Financial Transactions Management",
    description: "Track income, expenses, and manage financial records.",
    icon: <CreditCard className="h-12 w-12 text-yellow-500" />,
    color: "from-yellow-400 to-yellow-600",
  },
  {
    title: "Invoices Management",
    description: "Create, send, and track invoices and payment status.",
    icon: <FileText className="h-12 w-12 text-pink-500" />,
    color: "from-pink-400 to-pink-600",
  },
  {
    title: "Products Management",
    description: "Manage product catalog, inventory, and pricing.",
    icon: <Package className="h-12 w-12 text-cyan-500" />,
    color: "from-cyan-400 to-cyan-600",
  },
]

export default function ServicesSection() {
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
    <section id="services" className="py-20 bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Business Solutions</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Fusion ERP provides a complete suite of tools to manage every aspect of your business operations.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <CardHeader className="pt-6">
                  <div className="mb-4 transition-transform duration-300 group-hover:scale-110">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="text-blue-600 dark:text-blue-400 p-0 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-transparent"
                  >
                    Learn more →
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
