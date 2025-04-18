import { useState, useEffect, useRef } from "react"
import { jsPDF } from "jspdf"
import { autoTable } from "jspdf-autotable"
import { format } from "date-fns"
import { v4 as uuidv4 } from "uuid"

// Import shadcn components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Edit, Trash2, FileText, Download, X, CalendarIcon } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import useGetProducts from "@/hooks/useGetProducts"
import useGetInvoices from "@/hooks/useGetInvoice"
import { getRefresh } from "@/redux/invoiceSlice"
import toast from "react-hot-toast"
import axios from "axios"
import { INVOICES_API_END_POINT } from "@/utils/constants"
import Loading from "@/components/commen/Loading"
import avatarImg from "../../assets/placeholder.png";
import useGetMyProfile from "@/hooks/useGetMyProfile"


function Invoices() {
  // State for invoices
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [products, setProducts] = useState([]);

  const allInvoices = useSelector((state) => state.invoices.allInvoices);
  const { allProducts } = useSelector((store) => store.product)
  const { user, profile } = useSelector((store) => store.user);
  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNo: "",
    companyName: "",
    description: "", // Added description field
    profilePic: avatarImg,
  });

  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false);

  // State for form
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState(products)

  // Form state
  const [invoiceForm, setInvoiceForm] = useState({
    _id: "",
    invoiceNumber: "",
    dateOfIssue: new Date(),
    dueDate: new Date(),
    customerName: "",
    billingAddress: "",
    products: [],
    discount: 0,
    taxRate: 0,
    shippingCost: 0,
    totalAmount: 0,
    status: "",
    notes: "",
  })

  // Refs
  const invoiceFormRef = useRef(null)

  // Effect to filter invoices based on search query and status
  useEffect(() => {
    let result = invoices

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(query) ||
          invoice.customerName.toLowerCase().includes(query) ||
          format(new Date(invoice.dateOfIssue), "yyyy-MM-dd").includes(query),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((invoice) => invoice.status === statusFilter)
    }

    setFilteredInvoices(result)
  }, [searchQuery, statusFilter, invoices])

  useEffect(() => {
    if (productSearchQuery) {
      const query = productSearchQuery.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.productName.toLowerCase().includes(query) || product.productId.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [productSearchQuery, products]);


  useEffect(() => {
    if (invoiceForm.products.length > 0) {
      const subtotal = invoiceForm.products.reduce((sum, product) => sum + product.subtotal, 0)
      const total =
        subtotal + Number(invoiceForm.taxRate) + Number(invoiceForm.shippingCost) - Number(invoiceForm.discount)
      setInvoiceForm((prev) => ({
        ...prev,
        totalAmount: Number(total),
      }))
    }
  }, [invoiceForm.products, invoiceForm.discount, invoiceForm.taxRate, invoiceForm.shippingCost])

  // Function to reset form
  const resetForm = () => {
    setInvoiceForm({
      _id: "",
      invoiceNumber: "",
      dateOfIssue: new Date(),
      dueDate: new Date(),
      customerName: "",
      billingAddress: "",
      products: [],
      discount: 0,
      taxRate: 0,
      shippingCost: 0,
      totalAmount: 0,
      status: "",
      notes: "",
    })
    setIsEditMode(false)
    setCurrentInvoice(null)
  }

  // Function to open add invoice form
  const handleAddInvoice = () => {
    resetForm()
    setIsAddInvoiceOpen(true)
  }

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setInvoiceForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Function to handle date changes
  const handleDateChange = (date, field) => {
    setInvoiceForm((prev) => ({
      ...prev,
      [field]: date,
    }))
  }

  // Function to handle status change
  const handleStatusChange = (value) => {
    setInvoiceForm((prev) => ({
      ...prev,
      status: value,
    }))
  }

  // Function to add product to invoice
  const handleAddProduct = (product) => {
    // Check if product already exists in the invoice
    const existingProductIndex = invoiceForm.products.findIndex((p) => p._id === product._id)

    if (existingProductIndex !== -1) {
      // Update quantity if product already exists
      const updatedProducts = [...invoiceForm.products]
      updatedProducts[existingProductIndex].quantity += 1
      updatedProducts[existingProductIndex].subtotal =
        updatedProducts[existingProductIndex].quantity * updatedProducts[existingProductIndex].sellingPrice

      setInvoiceForm((prev) => ({
        ...prev,
        products: updatedProducts,
      }))
    } else {
      // Add new product
      const newProduct = {
        ...product,
        quantity: 1,
        subtotal: product.sellingPrice,
      }

      setInvoiceForm((prev) => ({
        ...prev,
        products: [...prev.products, newProduct],
      }))
    }

    setIsProductSearchOpen(false)
    setProductSearchQuery("")
  }

  // Function to update product quantity
  const handleQuantityChange = (productId, quantity) => {
    const updatedProducts = invoiceForm.products.map((product) => {
      if (product._id === productId) {
        const newQuantity = Math.max(1, Number.parseInt(quantity) || 1)
        return {
          ...product,
          quantity: newQuantity,
          subtotal: newQuantity * product.sellingPrice,
        }
      }
      return product
    })

    setInvoiceForm((prev) => ({
      ...prev,
      products: updatedProducts,
    }))
  }

  // Function to remove product from invoice
  const handleRemoveProduct = (productId) => {
    const updatedProducts = invoiceForm.products.filter((product) => product._id !== productId)

    setInvoiceForm((prev) => ({
      ...prev,
      products: updatedProducts,
    }))
  }


  // api calling
  useEffect(() => {
    if (allProducts?.AllProducts) {
      setProducts(allProducts.AllProducts);
    }
  }, [allProducts]);
  useGetProducts()

  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.fullName || "",
        username: profile.username || "",
        email: profile.email || "",
        phoneNo: profile.phoneNo || "",
        companyName: profile.companyName || "",
        description: profile.description || "", // Added description field
        profilePic: profile.profilePic || avatarImg,
      });
    }
  }, [profile]);
  useGetMyProfile();


  useEffect(() => {
    if (allInvoices?.AllInvoices) {
      setInvoices(allInvoices.AllInvoices);
    }
  }, [allInvoices]);
  useGetInvoices()


  // Function to save invoice
  const handleSaveInvoice = async () => {
    if (!invoiceForm.customerName || !invoiceForm.products.length) {
      alert("Please fill in all required fields and add at least one product.");
      return;
    }

    setIsLoading(true);

    try {
      // 🔥 Prepare products with subtotal
      const preparedProducts = invoiceForm.products.map((product) => ({
        productMongodbId: product.productMongodbId,
        productId: product.productId,
        productName: product.productName,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
        subtotal: product.sellingPrice * product.quantity,    // ✅ Add subtotal calculation here
      }));

      // 🔥 Calculate invoice subtotal (sum of all product subtotals)
      const invoiceSubtotal = preparedProducts.reduce(
        (acc, product) => acc + product.subtotal,
        0
      );




      if (isEditMode) {
        // Update existing invoice
        const res = await axios.patch(`${INVOICES_API_END_POINT}/update-invoice/${invoiceForm._id}`, {
          invoiceNumber: invoiceForm.invoiceNumber,
          dateOfIssue: invoiceForm.dateOfIssue,
          dueDate: invoiceForm.dueDate,
          customerName: invoiceForm.customerName,
          billingAddress: invoiceForm.billingAddress,
          products: preparedProducts,
          subtotal: invoiceSubtotal,                          // ✅ Send subtotal
          discount: Number(invoiceForm.discount),
          taxRate: Number(invoiceForm.taxRate),
          shippingCost: Number(invoiceForm.shippingCost),
          totalAmount: Number(invoiceForm.totalAmount),
          status: invoiceForm.status,
          notes: invoiceForm.notes,
        }, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        toast.success(res.data.message || "Invoice updated successfully!");
      } else {
        // Create new invoice
        const res = await axios.post(`${INVOICES_API_END_POINT}/create-invoice`, {
          invoiceNumber: invoiceForm.invoiceNumber,
          dateOfIssue: invoiceForm.dateOfIssue,
          dueDate: invoiceForm.dueDate,
          customerName: invoiceForm.customerName,
          billingAddress: invoiceForm.billingAddress,
          products: preparedProducts,
          subtotal: invoiceSubtotal,                          // ✅ Send subtotal
          discount: Number(invoiceForm.discount),
          taxRate: Number(invoiceForm.taxRate),
          shippingCost: Number(invoiceForm.shippingCost),
          totalAmount: Number(invoiceForm.totalAmount),
          status: invoiceForm.status,
          notes: invoiceForm.notes,
        }, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        toast.success(res.data.message || "Invoice created successfully!");
      }

      dispatch(getRefresh());
      setIsAddInvoiceOpen(false);
      resetForm();
      setIsEditMode(false);
      setCurrentInvoice(null);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to edit invoice
  const handleEditInvoice = (invoice) => {
    const preparedProducts = invoice.products.map(product => ({
      productMongodbId: product.productMongodbId,
      productId: product.productId,
      productName: product.productName,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      subtotal: product.sellingPrice * product.quantity,
    }));

    setInvoiceForm({
      ...invoice,
      products: preparedProducts,
      dateOfIssue: new Date(invoice.dateOfIssue),
      dueDate: new Date(invoice.dueDate),
      totalAmount: invoice.totalAmount ? Number(invoice.totalAmount) : 0
    })
    setIsEditMode(true)
    setCurrentInvoice(invoice)
    setIsAddInvoiceOpen(true)
  }

  // Function to view invoice details
  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const res = await axios.delete(`${INVOICES_API_END_POINT}/delete-invoice/${invoiceId}`, {
        withCredentials: true,
      });

      toast.success(res.data.message || "Invoice deleted successfully!");

      const updatedInvoices = invoices.filter((invoice) => invoice._id !== invoiceId);
      setInvoices(updatedInvoices);
      dispatch(getRefresh());
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete invoice!");
    }
  };


  // Function to generate PDF
  const handleGeneratePDF = (invoice) => {
    const doc = new jsPDF()


    const logoBase64 = profileData?.profilePic;
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 80, 10, 50, 20);
    }

    // Add company header
    doc.setFontSize(20)
    doc.setTextColor(44, 62, 80)
    doc.text(`${profileData.companyName}`, 105, 40, { align: "center" })
    doc.setFontSize(10)
    doc.text(`${profileData.phoneNo} | ${profileData.email}`, 105, 47, { align: "center" })

    // Add invoice title
    doc.setFontSize(18)
    doc.setTextColor(52, 73, 94)
    doc.text("INVOICE", 105, 60, { align: "center" })

    // Add invoice details
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    // Left side - Customer info
    doc.setFontSize(11)
    doc.text("Bill To:", 14, 60)
    doc.setFontSize(10)
    doc.text(invoice.customerName, 14, 65)
    const addressLines = doc.splitTextToSize(invoice.billingAddress, 80)
    addressLines.forEach((line, i) => {
      doc.text(line, 14, 70 + i * 5)
    })

    // Right side - Invoice info
    doc.setFontSize(10)
    doc.text("Invoice Number:", 140, 60)
    doc.text(invoice.invoiceNumber, 180, 60)

    doc.text("Issue Date:", 140, 65)
    doc.text(format(new Date(invoice.dateOfIssue), "yyyy-MM-dd"), 180, 65)

    doc.text("Due Date:", 140, 70)
    doc.text(format(new Date(invoice.dueDate), "yyyy-MM-dd"), 180, 70)

    doc.text("Status:", 140, 75)
    doc.text(invoice.status, 180, 75)

    // Add products table
    const tableColumn = ["Product ID", "Product", "Quantity", "Price", "Subtotal"]
    const tableRows = []

    invoice.products.forEach((product) => {
      const productData = [
        product.productId,
        product.productName,
        product.quantity,
        `$${product.sellingPrice.toFixed(2)}`,
        `$${(product.sellingPrice * product.quantity).toFixed(2)}`,
      ]
      tableRows.push(productData)
    })

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
    })

    // Add summary
    const finalY = doc.lastAutoTable.finalY + 10

    // Left side - Notes
    if (invoice.notes) {
      doc.setFontSize(10)
      doc.text("Notes:", 14, finalY)
      const notesLines = doc.splitTextToSize(invoice.notes, 80)
      notesLines.forEach((line, i) => {
        doc.text(line, 14, finalY + 5 + i * 5)
      })
    }

    // Right side - Totals
    doc.text("Subtotal:", 140, finalY)
    const subtotal = invoice.products.reduce((sum, product) => sum + product.subtotal, 0)
    doc.text(`$${subtotal.toFixed(2)}`, 180, finalY, { align: "right" })

    doc.text("Discount:", 140, finalY + 5)
    doc.text(`$${invoice.discount.toFixed(2)}`, 180, finalY + 5, { align: "right" })

    doc.text("Tax:", 140, finalY + 10)
    doc.text(`$${invoice.taxRate.toFixed(2)}`, 180, finalY + 10, { align: "right" })

    doc.text("Shipping:", 140, finalY + 15)
    doc.text(`$${invoice.shippingCost.toFixed(2)}`, 180, finalY + 15, { align: "right" })

    doc.setFontSize(11)
    doc.setFont(undefined, "bold")
    doc.text("Total:", 140, finalY + 22)
    doc.text(`$${invoice.totalAmount.toFixed(2)}`, 180, finalY + 22, { align: "right" })

    // Add footer
    doc.setFontSize(8)
    doc.setFont(undefined, "normal")
    doc.text("Thank you for your business!", 105, 280, { align: "center" })

    // Save PDF
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`)
  }

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Unpaid":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Invoice Management</h1>
          <Button onClick={handleAddInvoice} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices by number, customer, or date..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs defaultValue="all" className="w-full md:w-auto" value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid grid-cols-4 w-full md:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Paid">Paid</TabsTrigger>
              <TabsTrigger value="Unpaid">Unpaid</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Invoice Cards */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No invoices found. Create a new invoice to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice._id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Customer:</span>
                      <span className="text-sm font-medium">{invoice.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Issue Date:</span>
                      <span className="text-sm">{format(new Date(invoice.dateOfIssue), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Due Date:</span>
                      <span className="text-sm">{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="text-sm font-bold">${invoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(invoice)}
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditInvoice(invoice)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGeneratePDF(invoice)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete invoice {invoice.invoiceNumber}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Invoice Dialog */}
      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Invoice" : "Add New Invoice"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? `Update the details for invoice ${invoiceForm.invoiceNumber}`
                : "Fill in the details to create a new invoice"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <form ref={invoiceFormRef} className="space-y-6 py-2">
              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    name="invoiceNumber"
                    value={invoiceForm.invoiceNumber}
                    onChange={handleInputChange}
                    placeholder="INV-2023-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={invoiceForm.status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date of Issue</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceForm.dateOfIssue ? format(invoiceForm.dateOfIssue, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceForm.dateOfIssue}
                        onSelect={(date) => handleDateChange(date, "dateOfIssue")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceForm.dueDate ? format(invoiceForm.dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceForm.dueDate}
                        onSelect={(date) => handleDateChange(date, "dueDate")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={invoiceForm.customerName}
                    onChange={handleInputChange}
                    placeholder="John Doe or Company Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Textarea
                    id="billingAddress"
                    name="billingAddress"
                    value={invoiceForm.billingAddress}
                    onChange={handleInputChange}
                    placeholder="Street, City, State, ZIP"
                    rows={3}
                  />
                </div>
              </div>

              {/* Products */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Products</Label>
                  <Popover open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" /> Add Product
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="productSearch">Search Products</Label>
                          <Input
                            id="productSearch"
                            value={productSearchQuery}
                            onChange={(e) => setProductSearchQuery(e.target.value)}
                            placeholder="Type to search products..."
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {filteredProducts.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-2">No products found</p>
                          ) : (
                            filteredProducts.map((product) => (
                              <Button
                                key={product.productMongodbId}
                                variant="ghost"
                                className="w-full justify-start text-left"
                                onClick={() => handleAddProduct(product)}
                              >
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{product.productName}</span>
                                  <span className="text-xs text-gray-500">
                                    {product.productId} - ${product.sellingPrice.toFixed(2)}
                                  </span>
                                </div>
                              </Button>
                            ))
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {invoiceForm.products.length === 0 ? (
                  <div className="text-center py-4 border border-dashed rounded-md">
                    <p className="text-gray-500">
                      No products added yet. Click "Add Product" to add products to this invoice.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="w-24 text-right">Price</TableHead>
                          <TableHead className="w-24 text-right">Quantity</TableHead>
                          <TableHead className="w-32 text-right">Subtotal</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceForm.products.map((product) => (
                          <TableRow key={product.productMongodbId}>
                            <TableCell>
                              <div className="font-medium">{product.productName}</div>
                              <div className="text-xs text-gray-500">{product.productId}</div>
                            </TableCell>
                            <TableCell className="text-right">${product.sellingPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="1"
                                value={product.quantity}
                                onChange={(e) => handleQuantityChange(product.productMongodbId, e.target.value)}
                                className="w-16 h-8 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">${(product.sellingPrice * product.quantity).toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveProduct(product._id)}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount ($)</Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={Number(invoiceForm.discount)}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax ($)</Label>
                    <Input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={Number(invoiceForm.taxRate)}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                    <Input
                      id="shippingCost"
                      name="shippingCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={Number(invoiceForm.shippingCost)}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={invoiceForm.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes or payment instructions..."
                    rows={8}
                  />
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex justify-end items-center space-x-2 pt-4 border-t">
                <span className="text-gray-500">Total Amount:</span>
                <span className="text-xl font-bold">${Number(invoiceForm.totalAmount)}</span>
              </div>
            </form>
          </ScrollArea>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsAddInvoiceOpen(false)}>
              Cancel
            </Button>
            {
              isLoading ? (<Button><Loading color="#000" /></Button>) : (<Button onClick={handleSaveInvoice}>{isEditMode ? "Update Invoice" : "Create Invoice"}</Button>)
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        {selectedInvoice && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Invoice {selectedInvoice.invoiceNumber}</span>
                <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-2">
                {/* Invoice and Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Invoice Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Invoice Number:</span>
                        <span>{selectedInvoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date of Issue:</span>
                        <span>{format(new Date(selectedInvoice.dateOfIssue), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Due Date:</span>
                        <span>{format(new Date(selectedInvoice.dueDate), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer Name:</span>
                        <span>{selectedInvoice.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Billing Address:</span>
                        <p className="mt-1 text-right">{selectedInvoice.billingAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Products</h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.products.map((product) => (
                          <TableRow key={product.productMongodbId}>
                            <TableCell>
                              <div className="font-medium">{product.productName}</div>
                              <div className="text-xs text-gray-500">{product.productId}</div>
                            </TableCell>
                            <TableCell className="text-right">${product.sellingPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{product.quantity}</TableCell>
                            <TableCell className="text-right font-medium">${(product.sellingPrice * product.quantity).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notes</h3>
                    <p className="text-gray-700">{selectedInvoice.notes || "No notes provided."}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal:</span>
                        <span>
                          ${selectedInvoice.products.reduce((sum, product) => sum + product.subtotal, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Discount:</span>
                        <span>${selectedInvoice.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax:</span>
                        <span>${selectedInvoice.taxRate.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping:</span>
                        <span>${selectedInvoice.shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total:</span>
                        <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => handleGeneratePDF(selectedInvoice)}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailsModalOpen(false)
                  handleEditInvoice(selectedInvoice)
                }}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" /> Edit Invoice
              </Button>
              <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

export default Invoices
