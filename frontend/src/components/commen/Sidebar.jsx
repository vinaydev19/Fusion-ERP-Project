import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Package, User , ShoppingCart, DollarSign, FileText, Users, Truck, BarChart, ShoppingBag, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "Inventory",
      icon: <Package className="h-5 w-5" />,
      path: "/dashboard/product-inventory",
    },
    { 
      title: "Sales", 
      icon: <ShoppingCart className="h-5 w-5" />, 
      path: "/dashboard/sales" 
    },
    {
      title: "Finance",
      icon: <DollarSign className="h-5 w-5" />,
      path: "/dashboard/financial-transactions",
    },
    {
      title: "Invoices",
      icon: <FileText className="h-5 w-5" />,
      path: "/dashboard/invoice-generator",
    },
    {
      title: "Employees",
      icon: <Users className="h-5 w-5" />,
      path: "/dashboard/employees-management",
    },
    {
      title: "Delivery",
      icon: <Truck className="h-5 w-5" />,
      path: "/dashboard/deliveries",
    },
    {
      title: "Customers",
      icon: <BarChart className="h-5 w-5" />,
      path: "/dashboard/customer-management",
    },
    {
      title: "Purchase",
      icon: <ShoppingBag className="h-5 w-5" />,
      path: "/dashboard/purchase-Orders",
    },
    {
      title: "Other Business",
      icon: <User className="h-5 w-5" />,
      path: "/dashboard/other-users",
    },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <div 
        className={cn(
          "h-screen bg-gray-900 text-white transition-all duration-300 relative",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && <h1 className="text-xl font-bold">Fusion ERP</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="h-8 w-8 text-white hover:bg-gray-800"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <div className="py-4">
          <nav className="space-y-2 px-2">
            {menuItems.map((item, index) => (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all",
                      isCollapsed ? "justify-center" : "justify-start"
                    )}
                  >
                    <span className="text-gray-300">{item.icon}</span>
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default Sidebar
