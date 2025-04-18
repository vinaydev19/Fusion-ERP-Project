import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash,
  Calendar,
  DollarSign,
  ShoppingCart,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

// Import shadcn components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import CardImage from "../../assets/placeholder.png"
import useGetProducts from "@/hooks/useGetProducts"
import useGetSales from "@/hooks/useGetSales"
import { useDispatch, useSelector } from "react-redux"
import toast from "react-hot-toast"
import axios from "axios"
import { SALES_API_END_POINT } from "@/utils/constants"
import { getRefresh } from "@/redux/saleSlice"
import Loading from "@/components/commen/Loading"

function Sales() {
  // State for sales data and search
  const [salesData, setSalesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const { allProducts } = useSelector((store) => store.product)
  const { allSales } = useSelector((store) => store.sale)
  const [searchTerm, setSearchTerm] = useState("")

  // State for modals
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)

  // State for product search
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false);


  // Form state for adding/editing sale
  const [formData, setFormData] = useState({
    _id: "",
    saleId: "",
    saleItem: {
      _id: "",
      productId: "",
      productName: "",
      productImage: "",
      sellingPrice: "",
    },
    sellingPrice: "",
    quantity: "",
    totalAmount: "",
    paymentStatus: "",
    notes: "",
    salesDate: format(new Date(), "yyyy-MM-dd"),
    customerName: "",
    invoice: ""
  })

  // Filter sales based on search term
  const filteredSales = salesData.filter((sale) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      sale.saleItem.productId.toLowerCase().includes(searchTermLower) ||
      sale.customerName.toLowerCase().includes(searchTermLower) ||
      sale.saleId.toLowerCase().includes(searchTermLower) ||
      sale.saleItem.productName.toLowerCase().includes(searchTermLower)
    );
  });


  // Filter products based on search term
  const filteredProducts = productsData.filter((product) => {
    if (!productSearchTerm) return true
    return (
      product.productName.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.productId.toLowerCase().includes(productSearchTerm.toLowerCase())
    )
  })

  // Calculate total amount when selling price or quantity changes
  useEffect(() => {
    if (formData.sellingPrice && formData.quantity) {
      const total = Number.parseFloat(formData.sellingPrice) * Number.parseInt(formData.quantity)
      setFormData((prev) => ({ ...prev, totalAmount: total.toFixed(2) }))
    }
  }, [formData.sellingPrice, formData.quantity])

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setFormData((prev) => ({
      ...prev,
      saleItem: {
        _id: product._id,
        productId: product.productId,
        productName: product.productName,
        productImage: product.productImage,
        sellingPrice: product.sellingPrice,
      }
    }))
    setProductSearchOpen(false)
  }

  // Reset form data
  const resetFormData = () => {
    setFormData({
      _id: "",
      saleId: "",
      saleItem: {
        _id: "",
        productId: "",
        productName: "",
        productImage: "",
        sellingPrice: "",
      },
      sellingPrice: "",
      quantity: "",
      totalAmount: "",
      paymentStatus: "",
      notes: "",
      salesDate: format(new Date(), "yyyy-MM-dd"),
      customerName: "",
      invoice: ""
    });
    setSelectedProduct(null);
  };


  // api calling 
  // fetch all product and sales data 

  useEffect(() => {
    if (allProducts?.AllProducts) {
      setProductsData(allProducts.AllProducts);
    }
  }, [allProducts]);
  useGetProducts()



  useEffect(() => {
    if (allSales?.AllSales) {
      setSalesData(allSales.AllSales);
    }
  }, [allSales]);
  useGetSales()


  // Open add sale modal
  const handleOpenAddSaleModal = () => {
    resetFormData()
    setIsAddSaleModalOpen(true)
  }

  // Submit new sale
  const handleAddSale = async (e) => {
    e.preventDefault()


    try {
      const res = await axios.post(`${SALES_API_END_POINT}/create-sale`, {
        saleId: formData.saleId,
        saleItem: formData.saleItem._id,
        sellingPrice: formData.sellingPrice,
        quantity: formData.quantity,
        totalAmount: formData.totalAmount,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
        salesDate: formData.salesDate,
        customerName: formData.customerName,
        invoice: formData.invoice
      }, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      })
      console.log("id", formData.saleItem._id);
      console.log(res);
      toast.success(res.data.message);
      dispatch(getRefresh());
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(`Error in handleSubmit: ${error}`);
      console.log(error);
    } finally {
      setIsLoading(false);
    }

    const newSale = {
      ...formData,
      sellingPrice: Number.parseFloat(formData.sellingPrice),
      quantity: Number.parseInt(formData.quantity),
      totalAmount: Number.parseFloat(formData.totalAmount),
    }

    setSalesData((prev) => [...prev, newSale])
    setIsAddSaleModalOpen(false)
    resetFormData()
  }

  // Open view details modal
  const handleViewDetails = (sale) => {
    setSelectedSale(sale)
    setIsViewDetailsModalOpen(true)
  }

  // Open edit modal
  const handleOpenEditModal = (sale) => {
    setSelectedSale(sale);
    setFormData({
      _id: sale._id,
      saleId: sale.saleId,
      saleItem: {
        _id: sale.saleItem._id,
        productId: sale.saleItem.productId,
        productName: sale.saleItem.productName,
        productImage: sale.saleItem.productImage,
        sellingPrice: sale.saleItem.sellingPrice,
      },
      sellingPrice: Number(sale.sellingPrice),
      quantity: Number(sale.quantity),
      totalAmount: Number(sale.totalAmount),
      paymentStatus: sale.paymentStatus,
      notes: sale.notes,
      salesDate: sale.salesDate ? format(new Date(sale.salesDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"), //,
      customerName: sale.customerName,
      invoice: sale.invoice
    });

    // Find the product
    const product = productsData.find((p) => p.productId === sale.saleItem.productId);
    setSelectedProduct(product);

    setIsEditModalOpen(true);
  };



  // Submit edit
  const handleEditSale = async (e) => {
    e.preventDefault();
    if (!formData._id) {
      toast.error("Sale ID is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.patch(`${SALES_API_END_POINT}/update-sale/${formData._id}`, {
        saleId: formData.saleId,
        saleItem: formData.saleItem._id,
        sellingPrice: Number(formData.sellingPrice),
        quantity: Number(formData.quantity),
        totalAmount: Number(formData.totalAmount),
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
        salesDate: formData.salesDate,
        customerName: formData.customerName,
        invoice: formData.invoice
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      toast.success(res.data.message);
      dispatch(getRefresh());

      // ✅ Only update state when API succeeds
      setSalesData((prev) =>
        prev.map((sale) =>
          sale._id === formData._id ? {
            ...sale,
            sellingPrice: Number(formData.sellingPrice),
            quantity: Number(formData.quantity),
            totalAmount: Number(formData.totalAmount),
          } : sale
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.error("Error in handleEditSale:", error);
    } finally {
      setIsLoading(false);
    }
  };



  // Open delete confirmation
  const handleOpenDeleteAlert = (sale) => {
    setSelectedSale(sale); // Ensure selectedSale is set
    setIsDeleteAlertOpen(true);
  };

  // Confirm delete
  const handleDeleteSale = async () => {
    if (!selectedSale) return;

    setIsLoading(true);

    try {
      const res = await axios.delete(`${SALES_API_END_POINT}/delete-sale/${selectedSale._id}`, {
        withCredentials: true
      });
      console.log("id", selectedSale._id);
      toast.success(res.data.message);
      dispatch(getRefresh());
      // Remove the deleted sale from local state
      setSalesData((prev) => prev.filter((sale) => sale.saleId !== selectedSale.saleId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete sale");
      console.error("Error in handleDeleteSale:", error);
    } finally {
      setIsLoading(false);
      setIsDeleteAlertOpen(false);
    }
  };

  // Helper function for payment status styling
  const getPaymentStatusStyles = (status) => {
    switch (status) {
      case "Paid":
        return {
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          className: "bg-green-500 hover:bg-green-600",
        }
      case "Pending":
        return {
          icon: <Clock className="h-4 w-4 mr-1" />,
          className: "bg-yellow-500 hover:bg-yellow-600",
        }
      case "Overdue":
        return {
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          className: "bg-red-500 hover:bg-red-600",
        }
      default:
        return {
          icon: null,
          className: "",
        }
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM dd, yyyy")
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sales Management</h1>

      {/* Search and Add Sale */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search sales by item, customer, ID or invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-end">
          <Button onClick={handleOpenAddSaleModal} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add New Sale
          </Button>
        </div>
      </div>

      {/* Sales Cards Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSales.map((sale) => (
          <Card key={sale._id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{sale.saleItem?.productName || "N/A"}</CardTitle>
                <Badge className={getPaymentStatusStyles(sale.paymentStatus).className}>
                  <span className="flex items-center">
                    {getPaymentStatusStyles(sale.paymentStatus).icon}
                    {sale.paymentStatus}
                  </span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">ID: {sale.saleId}</p>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex mb-4">
                <div className="w-20 h-20 mr-4 rounded-md overflow-hidden">
                  <img
                    src={sale.saleItem.productImage || CardImage} alt={sale.saleItem.productName || "Product Image"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="ml-auto font-medium">${sale.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Qty:</span>
                    <span className="ml-auto font-medium">{sale.quantity}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="ml-auto font-bold">${sale.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="ml-auto font-medium">{formatDate(sale.salesDate)}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Customer:</span>
                  <span className="ml-auto font-medium truncate max-w-[150px]">{sale.customerName}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(sale)}>
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(sale)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenDeleteAlert(sale)}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {filteredSales.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No sales found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      <Dialog open={isAddSaleModalOpen} onOpenChange={setIsAddSaleModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Sale</DialogTitle>
            <DialogDescription>Enter the details of the new sale below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSale} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="saleId">Sale ID * (Unique Id)</Label>
                <Input id="saleId" name="saleId" value={formData.saleId} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salesDate">Sale Date * </Label>
                <Input
                  type="date"
                  id="salesDate"
                  name="salesDate"
                  value={formData.salesDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="saleItem">Product * (required)</Label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={productSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedProduct ? selectedProduct.productName : "Search for a product..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search products..."
                      value={productSearchTerm}
                      onValueChange={setProductSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-auto">
                        {filteredProducts.map((product) => (
                          <CommandItem
                            key={product._id}
                            value={product.productId}
                            onSelect={() => handleProductSelect(product)}
                            className="flex items-center"
                          >
                            <div className="w-8 h-8 mr-2 rounded overflow-hidden">
                              <img
                                src={product.productImage || CardImage}
                                alt={product.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{product.productName}</p>
                              <p className="text-xs text-muted-foreground">
                                ${product.sellingPrice.toFixed(2)} - {product.category || "N/A"}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedProduct && (
              <div className="flex items-center p-4 border rounded-md">
                <div className="w-16 h-16 mr-4 rounded overflow-hidden">
                  <img
                    src={selectedProduct.productImage || CardImage}
                    alt={selectedProduct.productName || "N/A"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedProduct.productName || "N/A"}</h3>
                  <p className="text-sm text-muted-foreground">Category: {selectedProduct.category || "N/A"}</p>
                  <p className="text-sm font-medium">Price: ${selectedProduct.sellingPrice.toFixed(2)}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sellingPrice">Selling Price ($) * </Label>
                <Input
                  type="number"
                  id="sellingPrice"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity * </Label>
                <Input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Total Amount ($) * </Label>
                <Input type="number" id="totalAmount" name="totalAmount" value={formData.totalAmount} disabled required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paymentStatus">Payment Status * </Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleSelectChange("paymentStatus", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invoice">Invoice Number</Label>
              <Input id="invoice" name="invoice" value={formData.invoice} onChange={handleInputChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
            </div>

            <DialogFooter>
              {
                isLoading ? (<Button><Loading color="#000" /></Button>) : (<Button type="submit">Add Sale</Button>)
              }
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      {selectedSale && (
        <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Sale Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedSale.saleItem.productName}</h3>
                <Badge className={getPaymentStatusStyles(selectedSale.paymentStatus).className}>
                  <span className="flex items-center">
                    {getPaymentStatusStyles(selectedSale.paymentStatus).icon}
                    {selectedSale.paymentStatus}
                  </span>
                </Badge>
              </div>

              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <img
                    src={selectedSale.saleItem.productImage || CardImage} alt={selectedSale.saleItem.productName}
                    className="object-cover rounded-md"
                  />
                </div>
              </div>

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Sale ID</TableCell>
                    <TableCell>{selectedSale.saleId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Product ID</TableCell>
                    <TableCell>{selectedSale.saleItem.productId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Customer</TableCell>
                    <TableCell>{selectedSale.customerName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sale Date</TableCell>
                    <TableCell>{formatDate(selectedSale.salesDate)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Invoice</TableCell>
                    <TableCell>{selectedSale.invoice}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Selling Price</TableCell>
                    <TableCell>${selectedSale.sellingPrice.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Quantity</TableCell>
                    <TableCell>{selectedSale.quantity}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Amount</TableCell>
                    <TableCell className="font-bold">${selectedSale.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Notes</TableCell>
                    <TableCell>{selectedSale.notes || "No notes provided"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleOpenEditModal(selectedSale)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleOpenDeleteAlert(selectedSale)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Sale Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
            <DialogDescription>Update the details of the sale below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSale} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-id">Sale ID * (Unique Id)</Label>
                <Input id="edit-id" name="saleId" value={formData.saleId} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-salesDate">Sale Date * </Label>
                <Input
                  type="date"
                  id="edit-salesDate"
                  name="salesDate"
                  value={formData.salesDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-saleItem">Product * </Label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={productSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedProduct ? selectedProduct.productName : "Search for a product..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search products..."
                      value={productSearchTerm}
                      onValueChange={setProductSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-auto">
                        {filteredProducts.map((product) => (
                          <CommandItem
                            key={product._id}
                            value={product.productId}
                            onSelect={() => handleProductSelect(product)}
                            className="flex items-center"
                          >
                            <div className="w-8 h-8 mr-2 rounded overflow-hidden">
                              <img
                                src={product.productImage || CardImage}
                                alt={product.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{product.productName}</p>
                              <p className="text-xs text-muted-foreground">
                                ${product.sellingPrice.toFixed(2)} - {product.category || "N/A"}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedProduct && (
              <div className="flex items-center p-4 border rounded-md">
                <div className="w-16 h-16 mr-4 rounded overflow-hidden">
                  <img
                    src={selectedProduct.productImage || CardImage}
                    alt={selectedProduct.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedProduct.productName}</h3>
                  <p className="text-sm text-muted-foreground">Category: {selectedProduct.category}</p>
                  <p className="text-sm font-medium">Price: ${selectedProduct.sellingPrice.toFixed(2)}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-sellingPrice">Selling Price ($) * </Label>
                <Input
                  type="number"
                  id="edit-sellingPrice"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity * </Label>
                <Input
                  type="number"
                  id="edit-quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-totalAmount">Total Amount ($) * </Label>
                <Input type="number" id="edit-totalAmount" name="totalAmount" value={formData.totalAmount} disabled required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-customerName">Customer Name</Label>
                <Input
                  id="edit-customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}

                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentStatus">Payment Status * </Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleSelectChange("paymentStatus", value)}
                  required
                >
                  <SelectTrigger id="edit-paymentStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-invoice">Invoice Number</Label>
              <Input id="edit-invoice" name="invoice" value={formData.invoice} onChange={handleInputChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea id="edit-notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
            </div>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      {selectedSale && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the sale record for "{selectedSale.saleItem?.productName}" (ID: {selectedSale.saleId}). This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSale} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

export default Sales