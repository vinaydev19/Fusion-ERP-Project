
import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash,
  Phone,
  MapPin,
  Package,
  Truck,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  User,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import useGetDeliveries from "@/hooks/useGetDeliverie"
import { useDispatch, useSelector } from "react-redux"
import useGetProducts from "@/hooks/useGetProducts"
import toast from "react-hot-toast"
import { getRefresh } from "@/redux/deliverieSlice"
import { DELIVERIES_API_END_POINT } from "@/utils/constants"
import Loading from "@/components/commen/Loading"
import axios from "axios"


function Deliveries() {
  // State for deliveries data and search
  const [deliveriesData, setDeliveriesData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState([]);


  // State for modals
  const [isAddDeliveryModalOpen, setIsAddDeliveryModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)


  // State for product search
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [selectedProducts, setSelectedProducts] = useState([])
  const [productQuantities, setProductQuantities] = useState({})

  // Form state for adding/editing delivery
  const [formData, setFormData] = useState({
    _id: "",
    deliveryId: "",
    orderNumber: "",
    customerName: "",
    customerContact: "",
    deliveryAddress: "",
    products: [],
    deliveryMethod: "",
    trackingNumber: "",
    courierDetails: "",
    totalPrice: 0,
    paymentStatus: "",
    paymentMethod: "",
    notes: "",
  })

  const allDeliveries = useSelector((state) => state.deliveries.allDeliveries);
  const { allProducts } = useSelector((store) => store.product)

  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false);


  // Filter deliveries based on search term
  const filteredDeliveries = deliveriesData.filter((delivery) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      delivery.deliveryId.toLowerCase().includes(searchTermLower) ||
      delivery.orderNumber.toLowerCase().includes(searchTermLower) ||
      delivery.customerName.toLowerCase().includes(searchTermLower) ||
      delivery.customerContact.toLowerCase().includes(searchTermLower) ||
      delivery.trackingNumber.toLowerCase().includes(searchTermLower) ||
      delivery.courierDetails.toLowerCase().includes(searchTermLower) ||
      delivery.paymentStatus.toLowerCase().includes(searchTermLower) ||
      delivery.products.some(
        (product) =>
          product.productName.toLowerCase().includes(searchTermLower) ||
          product.productId.toLowerCase().includes(searchTermLower),
      )
    )
  })

  // Filter products based on search term
  const filteredProducts = products.filter((product) => {
    if (!productSearchTerm) return true
    return (
      product.productName.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.productId.toLowerCase().includes(productSearchTerm.toLowerCase())
    )
  })


  // Reset form data
  const resetFormData = () => {
    setFormData({
      _id: "",
      deliveryId: "",
      orderNumber: "",
      customerName: "",
      customerContact: "",
      deliveryAddress: "",
      products: [],
      deliveryMethod: "",
      trackingNumber: "",
      courierDetails: "",
      totalPrice: 0,
      paymentStatus: "",
      paymentMethod: "",
      notes: "",
    })
    setSelectedProducts([])
    setProductQuantities({})
  }

  // Open add delivery modal
  const handleOpenAddDeliveryModal = () => {
    resetFormData()
    setIsAddDeliveryModalOpen(true)
  }

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
    if (!selectedProducts.some((p) => p.productMongodbId === product._id)) {
      const newProduct = {
        productMongodbId: product._id,
        productId: product.productId,
        productName: product.productName,
        productImage: product.productImage,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
      };

      setSelectedProducts([...selectedProducts, newProduct]);

      setProductQuantities({
        ...productQuantities,
        [product._id]: 1,
      });

      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, newProduct], // Ensure multiple products are added
        totalPrice: calculateTotalPrice([...prev.products, newProduct]),
      }));
    }
  };


  // Handle product quantity change
  const handleQuantityChange = (productMongodbId, quantity) => {
    const numQuantity = Number.parseInt(quantity)
    if (numQuantity < 1) return

    setProductQuantities({
      ...productQuantities,
      [productMongodbId]: numQuantity,
    })

    // Update selected products with new quantity
    const updatedProducts = selectedProducts.map((product) => {
      if (product.productMongodbId === productMongodbId) {
        return {
          ...product,
          quantity: numQuantity,
        }
      }
      return product
    })

    setSelectedProducts(updatedProducts)

    // Update total price
    const newTotalPrice = calculateTotalPrice(updatedProducts)
    setFormData((prev) => ({
      ...prev,
      totalPrice: newTotalPrice,
    }))
  }

  // Handle product removal
  const handleRemoveProduct = (productMongodbId) => {
    const updatedProducts = selectedProducts.filter((product) => product.productMongodbId !== productMongodbId)
    setSelectedProducts(updatedProducts)

    // Remove from quantities
    const newQuantities = { ...productQuantities }
    delete newQuantities[productMongodbId]
    setProductQuantities(newQuantities)

    // Update total price
    const newTotalPrice = calculateTotalPrice(updatedProducts)
    setFormData((prev) => ({
      ...prev,
      totalPrice: newTotalPrice,
    }))
  }

  // Calculate total price for a delivery
  const calculateTotalPrice = (products) => {
    return products.reduce((total, product) => {
      return total + product.sellingPrice * product.quantity
    }, 0)
  }

  // api calling

  // Update form data with selected products
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      products: selectedProducts,
    }))
  }, [selectedProducts])


  useEffect(() => {
    if (allProducts?.AllProducts) {
      setProducts(allProducts.AllProducts);
    }
  }, [allProducts]);
  useGetProducts()


  useEffect(() => {
    if (allDeliveries?.AllDeliverys) {
      setDeliveriesData(allDeliveries.AllDeliverys);
    }
  }, [allDeliveries]);
  useGetDeliveries()


  // Submit new delivery
  const handleAddDelivery = async (e) => {
    e.preventDefault()

    if (selectedProducts.length === 0) {
      alert("Please select at least one product")
      return
    }

    try {
      const res = await axios.post(`${DELIVERIES_API_END_POINT}/create-delivery`, {
        deliveryId: formData.deliveryId,
        orderNumber: formData.orderNumber,
        customerName: formData.customerName,
        customerContact: formData.customerContact,
        deliveryAddress: formData.deliveryAddress,
        products: formData.products,
        deliveryMethod: formData.deliveryMethod,
        trackingNumber: formData.trackingNumber,
        courierDetails: formData.courierDetails,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        totalPrice: formData.totalPrice,
      }, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      })
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

    const newDelivery = {
      ...formData,
      createdAt: new Date().toISOString(),
    }

    setDeliveriesData((prev) => [...prev, newDelivery])
    setIsAddDeliveryModalOpen(false)
    resetFormData()
  }

  // Open view details modal
  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery)
    setIsViewDetailsModalOpen(true)
  }

  // Open edit modal
  const handleOpenEditModal = (delivery) => {
    setSelectedDelivery(delivery)
    setFormData({
      ...delivery,
    })
    setSelectedProducts(delivery.products)

    // Set product quantities
    const quantities = {}
    delivery.products.forEach((product) => {
      quantities[product.productMongodbId] = product.quantity
    })
    setProductQuantities(quantities)

    setIsEditModalOpen(true)
  }

  // Submit edit
  const handleEditDelivery = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      alert("Please select at least one product");
      return;
    }

    const updatedDelivery = {
      ...formData,
      products: selectedProducts,
      totalPrice: calculateTotalPrice(selectedProducts),
    };

    setIsLoading(true);
    try {
      const res = await axios.patch(
        `${DELIVERIES_API_END_POINT}/update-delivery/${updatedDelivery._id}`,
        updatedDelivery,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      toast.success(res.data.message || "Delivery updated successfully");
      dispatch(getRefresh()); // Refresh data from the backend

      // Update local state after successful update
      setDeliveriesData((prev) =>
        prev.map((delivery) =>
          delivery._id === updatedDelivery._id ? updatedDelivery : delivery
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update delivery");
      console.error("Error updating delivery:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Open delete confirmation
  const handleOpenDeleteAlert = (delivery) => {
    setSelectedDelivery(delivery)
    setIsDeleteAlertOpen(true)
  }

  // Confirm delete
  const handleDeleteDelivery = async () => {
    if (!selectedDelivery) return

    setIsLoading(true);
    try {
      const res = await axios.delete(`${DELIVERIES_API_END_POINT}/delete-delivery/${selectedDelivery._id}`, {
        withCredentials: true,
      });

      toast.success(res.data.message || "Employee deleted successfully");

      // Update state only after successful deletion
      dispatch(getRefresh()); // Refresh the employee list
      setDeliveriesData((prev) => prev.filter((delivery) => delivery._id !== selectedDelivery._id))
      setIsDeleteAlertOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete employee");
      console.error("Error deleting employee:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM dd, yyyy h:mm a")
    } catch (error) {
      return dateString
    }
  }

  // Get payment status badge style
  const getPaymentStatusBadgeStyle = (status) => {
    switch (status) {
      case "Paid":
        return {
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
        }
      case "Pending":
        return {
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          icon: <Clock className="h-4 w-4 mr-1" />,
        }
      case "Failed":
        return {
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          icon: <XCircle className="h-4 w-4 mr-1" />,
        }
      default:
        return {
          className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          icon: null,
        }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Delivery Management</h1>

      {/* Search and Add Delivery */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search deliveries by ID, order number, customer name, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-end">
          <Button onClick={handleOpenAddDeliveryModal} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add New Delivery
          </Button>
        </div>
      </div>

      {/* Deliveries Cards Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeliveries.map((delivery) => (
          <Card key={delivery._id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{delivery.customerName}</CardTitle>
                <Badge className={getPaymentStatusBadgeStyle(delivery.paymentStatus).className}>
                  <span className="flex items-center">
                    {getPaymentStatusBadgeStyle(delivery.paymentStatus).icon}
                    {delivery.paymentStatus}
                  </span>
                </Badge>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm text-muted-foreground">Delivery ID: {delivery.deliveryId}</p>
                <p className="text-sm text-muted-foreground">Order: {delivery.orderNumber}</p>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-3">
                <div className="flex items-start">
                  <Package className="h-4 w-4 mr-1 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">Products:</span>
                    <ul className="mt-1 space-y-1">
                      {delivery.products.map((product) => (
                        <li key={product.productMongodbId} className="text-sm">
                          {product.quantity}x {product.productName}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Method:</span>
                  <span className="ml-auto font-medium">{delivery.deliveryMethod}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tracking:</span>
                  <span className="ml-auto font-medium">{delivery.trackingNumber}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="ml-auto font-medium">${delivery.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(delivery)}>
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(delivery)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenDeleteAlert(delivery)}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {filteredDeliveries.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No deliveries found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Add Delivery Modal */}
      <Dialog open={isAddDeliveryModalOpen} onOpenChange={setIsAddDeliveryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Delivery</DialogTitle>
            <DialogDescription>Enter the details of the new delivery below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDelivery} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deliveryId">Delivery ID * (unique Id)</Label>
                <Input
                  id="deliveryId"
                  name="deliveryId"
                  value={formData.deliveryId}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="orderNumber">Order Number * (unique Id)</Label>
                <Input
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name * </Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerContact">Customer Contact * </Label>
                <Input
                  id="customerContact"
                  name="customerContact"
                  value={formData.customerContact}
                  onChange={handleInputChange}
                  placeholder="Phone or Email"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deliveryAddress">Delivery Address * </Label>
              <Textarea
                id="deliveryAddress"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                rows={2}
                required
              />
            </div>

            {/* Product Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Products</Label>
                <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Product</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="end">
                    <Command>
                      <CommandInput
                        placeholder="Search products..."
                        value={productSearchTerm}
                        onValueChange={setProductSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
                        <CommandGroup heading="Products">
                          {filteredProducts.map((product) => (
                            <CommandItem
                              key={product.productMongodbId}
                              value={product.productId}
                              onSelect={() => handleProductSelect(product)}
                              className="flex items-center"
                            >
                              <div className="w-8 h-8 mr-2 rounded overflow-hidden">
                                <img
                                  src={product.productImage || "/placeholder.svg"}
                                  alt={product.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{product.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  ${product.sellingPrice.toFixed(2)} - {product.category}
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

              {selectedProducts.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {selectedProducts.map((product) => (
                    <div key={product.productMongodbId} className="p-3 flex items-center">
                      <div className="w-10 h-10 mr-3 rounded overflow-hidden">
                        <img
                          src={product.productImage || "/placeholder.svg"}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">${product.sellingPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={productQuantities[product.productMongodbId] || 1}
                          onChange={(e) => handleQuantityChange(product.productMongodbId, e.target.value)}
                          min="1"
                          className="w-16 h-8"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(product.productMongodbId)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 flex justify-between items-center bg-muted/50">
                    <p className="font-medium">Total</p>
                    <p className="font-bold">${formData.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No products selected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Add Product" to select products for delivery
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deliveryMethod">Delivery Method * </Label>
                <Select
                  value={formData.deliveryMethod}
                  onValueChange={(value) => handleSelectChange("deliveryMethod", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Shipping">Standard Shipping</SelectItem>
                    <SelectItem value="Express Shipping">Express Shipping</SelectItem>
                    <SelectItem value="Same Day Delivery">Same Day Delivery</SelectItem>
                    <SelectItem value="International Shipping">International Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="courierDetails">Courier Details</Label>
                <Input
                  id="courierDetails"
                  name="courierDetails"
                  value={formData.courierDetails}
                  onChange={handleInputChange}
                  placeholder="Courier company name"

                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleInputChange}

              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentStatus">Payment Status * </Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleSelectChange("paymentStatus", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Payment Method * </Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional delivery instructions or notes"
              />
            </div>

            <DialogFooter>
              {
                isLoading ? (<Button><Loading color="#000" /></Button>) : (<Button type="submit">Add Delivery</Button>)
              }
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      {selectedDelivery && (
        <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Delivery Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedDelivery.customerName}</h3>
                <Badge className={getPaymentStatusBadgeStyle(selectedDelivery.paymentStatus).className}>
                  <span className="flex items-center">
                    {getPaymentStatusBadgeStyle(selectedDelivery.paymentStatus).icon}
                    {selectedDelivery.paymentStatus}
                  </span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Delivery ID</h4>
                  <p>{selectedDelivery.deliveryId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Order Number</h4>
                  <p>{selectedDelivery.orderNumber}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer Information</h4>
                <div className="space-y-1">
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    {selectedDelivery.customerName}
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                    {selectedDelivery.customerContact}
                  </p>
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-1 text-muted-foreground" />
                    <span>{selectedDelivery.deliveryAddress}</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Products</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDelivery.products.map((product) => (
                        <TableRow key={product.productMongodbId}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-8 h-8 mr-2 rounded overflow-hidden">
                                <img
                                  src={product.productImage || "/placeholder.svg"}
                                  alt={product.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span>{product.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{product.productId}</TableCell>
                          <TableCell>${product.sellingPrice.toFixed(2)}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${(product.sellingPrice * product.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${selectedDelivery.totalPrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Delivery Method</h4>
                  <p>{selectedDelivery.deliveryMethod}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Courier Details</h4>
                  <p>{selectedDelivery.courierDetails}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Tracking Number</h4>
                <p>{selectedDelivery.trackingNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Payment Status</h4>
                  <p>{selectedDelivery.paymentStatus}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Payment Method</h4>
                  <p>{selectedDelivery.paymentMethod}</p>
                </div>
              </div>

              {selectedDelivery.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                  <p>{selectedDelivery.notes}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Created At</h4>
                <p>{formatDate(selectedDelivery.createdAt)}</p>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleOpenEditModal(selectedDelivery)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleOpenDeleteAlert(selectedDelivery)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Delivery Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Delivery</DialogTitle>
            <DialogDescription>Update the details of the delivery below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDelivery} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-deliveryId">Delivery ID * (unique Id)</Label>
                <Input
                  id="edit-deliveryId"
                  name="deliveryId"
                  value={formData.deliveryId}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-orderNumber">Order Number * (unique Id)</Label>
                <Input
                  id="edit-orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-customerName">Customer Name *</Label>
                <Input
                  id="edit-customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-customerContact">Customer Contact *</Label>
                <Input
                  id="edit-customerContact"
                  name="customerContact"
                  value={formData.customerContact}
                  onChange={handleInputChange}
                  placeholder="Phone or Email"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-deliveryAddress">Delivery Address *</Label>
              <Textarea
                id="edit-deliveryAddress"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                rows={2}
                required
              />
            </div>

            {/* Product Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Products *</Label>
                <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Product</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="end">
                    <Command>
                      <CommandInput
                        placeholder="Search products..."
                        value={productSearchTerm}
                        onValueChange={setProductSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
                        <CommandGroup heading="Products">
                          {filteredProducts.map((product) => (
                            <CommandItem
                              key={product.productMongodbId}
                              value={product.productId}
                              onSelect={() => handleProductSelect(product)}
                              className="flex items-center"
                            >
                              <div className="w-8 h-8 mr-2 rounded overflow-hidden">
                                <img
                                  src={product.productImage || "/placeholder.svg"}
                                  alt={product.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{product.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  ${product.sellingPrice.toFixed(2)} - {product.category}
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

              {selectedProducts.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {selectedProducts.map((product) => (
                    <div key={product.productMongodbId} className="p-3 flex items-center">
                      <div className="w-10 h-10 mr-3 rounded overflow-hidden">
                        <img
                          src={product.productImage || "/placeholder.svg"}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">${product.sellingPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={productQuantities[product.productMongodbId] || 1}
                          onChange={(e) => handleQuantityChange(product.productMongodbId, e.target.value)}
                          min="1"
                          className="w-16 h-8"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(product.productMongodbId)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 flex justify-between items-center bg-muted/50">
                    <p className="font-medium">Total</p>
                    <p className="font-bold">${formData.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No products selected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Add Product" to select products for delivery
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-deliveryMethod">Delivery Method *</Label>
                <Select
                  value={formData.deliveryMethod}
                  onValueChange={(value) => handleSelectChange("deliveryMethod", value)}
                  required
                >
                  <SelectTrigger id="edit-deliveryMethod">
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Shipping">Standard Shipping</SelectItem>
                    <SelectItem value="Express Shipping">Express Shipping</SelectItem>
                    <SelectItem value="Same Day Delivery">Same Day Delivery</SelectItem>
                    <SelectItem value="International Shipping">International Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-courierDetails">Courier Details</Label>
                <Input
                  id="edit-courierDetails"
                  name="courierDetails"
                  value={formData.courierDetails}
                  onChange={handleInputChange}
                  placeholder="Courier company name"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-trackingNumber">Tracking Number</Label>
              <Input
                id="edit-trackingNumber"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentStatus">Payment Status *</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleSelectChange("paymentStatus", value)}
                  required
                >
                  <SelectTrigger id="edit-paymentStatus">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                  required
                >
                  <SelectTrigger id="edit-paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional delivery instructions or notes"
              />
            </div>

            <DialogFooter>
              {isLoading ? (<Button><Loading color="#000" /></Button>) : <Button type="submit">Save Changes</Button>}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Alert */}
      {selectedDelivery && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the delivery record for "{selectedDelivery.customerName}" (ID:{" "}
                {selectedDelivery.deliveryId}). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDelivery} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>

  )
}

export default Deliveries