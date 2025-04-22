"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity, ArrowDown, ArrowUp, CreditCard, DollarSign, Package, ShoppingCart, Users, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useGetSales from "@/hooks/useGetSales"
import useGetCustomers from "@/hooks/useGetCustomer"
import useGetDeliveries from "@/hooks/useGetDeliverie"
import useGetEmployees from "@/hooks/useGetEmployee"
import useGetFinancials from "@/hooks/useGetFinancial"
import useGetInvoices from "@/hooks/useGetInvoice"
import useGetPurchases from "@/hooks/useGetPurchaseSlice"
import useGetProducts from "@/hooks/useGetProducts"
import { useSelector } from "react-redux"

function Dashboard() {
  // State for all data
  const [timeRange, setTimeRange] = useState("month")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    activeInventory: 0,
    activeCustomers: 0,
    revenueChange: 0,
    salesChange: 0,
    inventoryChange: 0,
    customerChange: 0,
  })

  // Fetch data using custom hooks
  useGetProducts()
  useGetSales()
  useGetCustomers()
  useGetDeliveries()
  useGetEmployees()
  useGetFinancials()
  useGetInvoices()
  useGetPurchases()

  // Get data from Redux store
  const { allProducts } = useSelector((store) => store.product)
  const { allSales } = useSelector((store) => store.sale)
  const allPurchases = useSelector((state) => state.purchases.allPurchases)
  const allInvoices = useSelector((state) => state.invoices.allInvoices)
  const { allFinancials } = useSelector((store) => store.financial)
  const { allEmployees } = useSelector((store) => store.employee)
  const allDeliveries = useSelector((state) => state.deliveries.allDeliveries)
  const allCustomers = useSelector((state) => state.customers.allCustomers)

  // State for chart data
  const [salesData, setSalesData] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [customerData, setCustomerData] = useState([])
  const [financialData, setFinancialData] = useState([])
  const [employeeData, setEmployeeData] = useState([])
  const [warehouseData, setWarehouseData] = useState([])
  const [paymentMethodsData, setPaymentMethodsData] = useState([])
  const [topSellingProducts, setTopSellingProducts] = useState([])

  // Calculate dashboard stats
  useEffect(() => {
    if (allSales?.AllSales && allProducts?.AllProducts && allCustomers?.AllCustomers) {
      const totalRev = allSales.AllSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
      const totalSalesCount = allSales.AllSales.length
      const activeInventoryCount = allProducts.AllProducts.reduce((sum, product) => sum + (product.quantity || 0), 0)
      const activeCustomersCount = allCustomers.AllCustomers.length

      setDashboardStats({
        totalRevenue: totalRev,
        totalSales: totalSalesCount,
        activeInventory: activeInventoryCount,
        activeCustomers: activeCustomersCount,
        revenueChange: 15.2, // Placeholder - would need historical data to calculate
        salesChange: 8.7, // Placeholder
        inventoryChange: 5.3, // Placeholder
        customerChange: 12.1, // Placeholder
      })

      setIsLoading(false)
    }
  }, [allSales, allProducts, allCustomers])

  // Transform products data for inventory chart
  useEffect(() => {
    if (allProducts?.AllProducts) {
      // Group products by category for pie chart
      const categoryMap = {}

      allProducts.AllProducts.forEach((product) => {
        const category = product.category || "Uncategorized"
        if (!categoryMap[category]) {
          categoryMap[category] = 0
        }
        categoryMap[category] += product.quantity || 0
      })

      const transformedData = Object.keys(categoryMap).map((category) => ({
        name: category,
        value: categoryMap[category],
      }))

      setInventoryData(transformedData)

      // Create warehouse distribution data
      const warehouseMap = {}
      allProducts.AllProducts.forEach((product) => {
        const warehouse = product.warehouse || "Main Warehouse"
        if (!warehouseMap[warehouse]) {
          warehouseMap[warehouse] = 0
        }
        warehouseMap[warehouse] += product.quantity || 0
      })

      const warehouseChartData = Object.keys(warehouseMap).map((warehouse) => ({
        name: warehouse || "Main Warehouse",
        value: warehouseMap[warehouse],
      }))

      setWarehouseData(
        warehouseChartData.length > 0
          ? warehouseChartData
          : [
            { name: "Main Warehouse", value: 450 },
            { name: "East Warehouse", value: 350 },
            { name: "West Warehouse", value: 300 },
            { name: "South Warehouse", value: 224 },
          ],
      )

      // Create low stock items
      const lowStock = allProducts.AllProducts.filter((product) => (product.quantity || 0) < 50)
        .slice(0, 4)
        .map((product) => ({
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity || 0,
          warehouse: product.warehouse || "Main",
        }))

      setLowStockItems(
        lowStock.length > 0
          ? lowStock
          : [

          ],
      )
    }
  }, [allProducts])

  // Transform sales data for revenue chart
  useEffect(() => {
    if (allSales?.AllSales) {
      // Group sales by month for line chart
      const salesByMonth = {}
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      allSales.AllSales.forEach((sale) => {
        if (sale.salesDate) {
          const date = new Date(sale.salesDate)
          const monthIndex = date.getMonth()
          const monthName = months[monthIndex]

          if (!salesByMonth[monthName]) {
            salesByMonth[monthName] = 0
          }
          salesByMonth[monthName] += sale.totalAmount || 0
        }
      })

      const transformedSalesData = months.map((month) => ({
        name: month,
        total: salesByMonth[month] || 0,
      }))

      setSalesData(transformedSalesData)

      // Create top selling products data
      const productSales = {}
      allSales.AllSales.forEach((sale) => {
        if (sale.saleItem && sale.saleItem.productName) {
          const productName = sale.saleItem.productName
          if (!productSales[productName]) {
            productSales[productName] = 0
          }
          productSales[productName] += sale.quantity || 0
        }
      })

      const topProducts = Object.keys(productSales)
        .map((product) => ({ name: product, sales: productSales[product] }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)

      setTopSellingProducts(
        topProducts.length > 0
          ? topProducts
          : [
            { name: "Product A", sales: 120 },
            { name: "Product B", sales: 98 },
            { name: "Product C", sales: 86 },
            { name: "Product D", sales: 72 },
            { name: "Product E", sales: 65 },
          ],
      )
    }
  }, [allSales])

  // Transform financial data
  useEffect(() => {
    if (allFinancials?.AllFinancials) {
      // Group financial transactions by month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const incomeByMonth = {}
      const expensesByMonth = {}

      allFinancials.AllFinancials.forEach((transaction) => {
        if (transaction.financialDate) {
          const date = new Date(transaction.financialDate)
          const monthIndex = date.getMonth()
          const monthName = months[monthIndex]

          if (!incomeByMonth[monthName]) {
            incomeByMonth[monthName] = 0
            expensesByMonth[monthName] = 0
          }

          if (transaction.type === "Income") {
            incomeByMonth[monthName] += transaction.toAmount || 0
          } else {
            expensesByMonth[monthName] += transaction.toAmount || 0
          }
        }
      })

      const transformedFinancialData = months.map((month) => ({
        month,
        income: incomeByMonth[month] || 0,
        expenses: expensesByMonth[month] || 0,
      }))

      setFinancialData(transformedFinancialData)

      // Create payment methods distribution
      const paymentMethods = {}
      allFinancials.AllFinancials.forEach((transaction) => {
        const method = transaction.paymentMethod || "Other"
        if (!paymentMethods[method]) {
          paymentMethods[method] = 0
        }
        paymentMethods[method] += transaction.toAmount || 0
      })

      const paymentMethodsChartData = Object.keys(paymentMethods).map((method) => ({
        name: method,
        value: paymentMethods[method],
      }))

      setPaymentMethodsData(
        paymentMethodsChartData.length > 0
          ? paymentMethodsChartData
          : [
            { name: "Credit Card", value: 45 },
            { name: "Bank Transfer", value: 30 },
            { name: "PayPal", value: 15 },
            { name: "Cash", value: 10 },
          ],
      )
    }
  }, [allFinancials])

  // Transform customer data
  useEffect(() => {
    if (allCustomers?.AllCustomers) {
      // Create customer growth data (would need timestamps to be accurate)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
      const sampleGrowth = [120, 132, 145, 162, 180, 204, 215]

      const customerGrowthData = months.map((month, index) => ({
        name: month,
        customers: sampleGrowth[index],
      }))

      setCustomerData(customerGrowthData)
    }
  }, [allCustomers])

  // Transform invoices data for recent orders
  useEffect(() => {
    if (allInvoices?.AllInvoices) {
      const recentInvoices = [...allInvoices.AllInvoices] // clone it
        .sort((a, b) => new Date(b.dateOfIssue) - new Date(a.dateOfIssue))
        .slice(0, 4)
        .map((invoice) => ({
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customerName,
          totalAmount: invoice.totalAmount,
          dateOfIssue: invoice.dateOfIssue,
        }))


      setRecentOrders(recentInvoices)

      // Create recent activities from invoices
      const activities = [...allInvoices.AllInvoices] // clone again
        .sort((a, b) => new Date(b.dateOfIssue) - new Date(a.dateOfIssue))
        .slice(0, 4)
        .map((invoice) => ({
          type: invoice.status === "Paid" ? "payment" : "order",
          description: `Invoice #${invoice.invoiceNumber} ${invoice.status}`,
          timestamp: invoice.dateOfIssue,
        }))


      setRecentActivities(activities)
    }
  }, [allInvoices])

  // Transform employee data
  useEffect(() => {
    if (allEmployees?.AllEmployees) {
      // Group employees by department
      const departmentMap = {}

      allEmployees.AllEmployees.forEach((employee) => {
        const department = employee.department || "Other"
        if (!departmentMap[department]) {
          departmentMap[department] = 0
        }
        departmentMap[department] += 1
      })

      const transformedEmployeeData = Object.keys(departmentMap).map((department) => ({
        name: department,
        value: departmentMap[department],
      }))

      setEmployeeData(transformedEmployeeData)
    }
  }, [allEmployees])

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Helper function to get time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInMinutes = Math.floor((now - past) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  // Helper function to get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "payment":
        return <CreditCard className="h-4 w-4" />
      case "inventory":
        return <Package className="h-4 w-4" />
      case "customer":
        return <Users className="h-4 w-4" />
      case "delivery":
        return <Truck className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {dashboardStats.revenueChange >= 0 ? (
                    <>
                      <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500">+{dashboardStats.revenueChange}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500">{dashboardStats.revenueChange}%</span>
                    </>
                  )}
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{dashboardStats.totalSales}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {dashboardStats.salesChange >= 0 ? (
                    <>
                      <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500">+{dashboardStats.salesChange}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500">{dashboardStats.salesChange}%</span>
                    </>
                  )}
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Inventory</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.activeInventory}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {dashboardStats.inventoryChange >= 0 ? (
                    <>
                      <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500">+{dashboardStats.inventoryChange}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500">{dashboardStats.inventoryChange}%</span>
                    </>
                  )}
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.activeCustomers}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {dashboardStats.customerChange >= 0 ? (
                    <>
                      <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500">+{dashboardStats.customerChange}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500">{dashboardStats.customerChange}%</span>
                    </>
                  )}
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer
                  config={{
                    total: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <LineChart
                    data={salesData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                    dataKey="total"
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="total" />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Inventory Distribution</CardTitle>
                <CardDescription>Current inventory by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Items",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <PieChart
                    data={inventoryData}
                    dataKey="value"
                    nameKey="name"
                    margin={{
                      top: 5,
                      right: 5,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="value" />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.invoiceNumber} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">#{order.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.dateOfIssue)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent orders found</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <a href="/invoices" className="text-sm text-primary hover:underline">
                  View all orders
                </a>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Low Stock Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">{item.productId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.quantity} units</p>
                          <p className="text-xs text-red-500">Low stock</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No low stock items found</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <a href="/products" className="text-sm text-primary hover:underline">
                  View inventory
                </a>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, i) => (
                      <div key={i} className="flex items-center gap-2 border-b pb-2">
                        <div className="bg-muted p-1 rounded-full">{getActivityIcon(activity.type)}</div>
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activities found</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <a href="/activities" className="text-sm text-primary hover:underline">
                  View all activities
                </a>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* SALES & REVENUE TAB */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Sales vs Expenses</CardTitle>
                <CardDescription>Financial overview comparing income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    income: {
                      label: "Income",
                      color: "hsl(var(--chart-1))",
                    },
                    expenses: {
                      label: "Expenses",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="aspect-[3/1]"
                >
                  <BarChart
                    data={financialData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="income" />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Payments",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <PieChart
                    data={paymentMethodsData}
                    dataKey="value"
                    nameKey="name"
                    margin={{
                      top: 5,
                      right: 5,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="value" />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products with highest sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sales: {
                      label: "Sales",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <BarChart
                    data={topSellingProducts}
                    layout="vertical"
                    dataKey="sales"
                    nameKey="name"
                    margin={{
                      top: 5,
                      right: 10,
                      left: 50,
                      bottom: 0,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="sales" />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* INVENTORY TAB */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Inventory Levels Over Time</CardTitle>
                <CardDescription>Tracking inventory changes over the past months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    inventory: {
                      label: "Inventory",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="aspect-[3/1]"
                >
                  <AreaChart
                    data={[
                      { month: "Jan", inventory: 1200 },
                      { month: "Feb", inventory: 1350 },
                      { month: "Mar", inventory: 1500 },
                      { month: "Apr", inventory: 1400 },
                      { month: "May", inventory: 1600 },
                      { month: "Jun", inventory: 1750 },
                      { month: "Jul", inventory: 1650 },
                    ]}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="inventory" />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Warehouse Distribution</CardTitle>
                <CardDescription>Inventory distribution by warehouse</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Items",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <PieChart
                    data={warehouseData}
                    dataKey="value"
                    nameKey="name"
                    margin={{
                      top: 5,
                      right: 5,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="value" />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Expiration</CardTitle>
                <CardDescription>Products by expiration timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Products",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <BarChart
                    data={[
                      { period: "< 30 days", count: 45 },
                      { period: "1-3 months", count: 120 },
                      { period: "3-6 months", count: 210 },
                      { period: "6-12 months", count: 350 },
                      { period: "> 12 months", count: 599 },
                    ]}
                    dataKey="count"
                    nameKey="period"
                    margin={{
                      top: 5,
                      right: 10,
                      left: 50,
                      bottom: 0,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="count" />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customer acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    customers: {
                      label: "Customers",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="aspect-[3/1]"
                >
                  <LineChart
                    data={customerData}
                    dataKey="customers"
                    nameKey="name"
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="customers" />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
                <CardDescription>Distribution by customer type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Customers",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <PieChart
                    data={[
                      { name: "Retail", value: 65 },
                      { name: "Wholesale", value: 15 },
                      { name: "Corporate", value: 12 },
                      { name: "Government", value: 8 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    margin={{
                      top: 5,
                      right: 5,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="value" />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Purchase Frequency</CardTitle>
                <CardDescription>Customer purchase patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    customers: {
                      label: "Customers",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <BarChart
                    data={[
                      { frequency: "Weekly", customers: 120 },
                      { frequency: "Monthly", customers: 250 },
                      { frequency: "Quarterly", customers: 180 },
                      { frequency: "Yearly", customers: 90 },
                      { frequency: "One-time", customers: 60 },
                    ]}
                    dataKey="customers"
                    nameKey="frequency"
                    margin={{
                      top: 5,
                      right: 10,
                      left: 50,
                      bottom: 0,
                    }}
                  >
                    <ChartTooltip content={<ChartTooltipContent labelKey="customers" />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard
