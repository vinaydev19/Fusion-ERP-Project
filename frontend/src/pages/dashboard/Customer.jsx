import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  DollarSign,
  Clock,
  User,
  FileText,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import useGetCustomers from "@/hooks/useGetCustomer"
import { useDispatch, useSelector } from "react-redux"
import useGetSales from "@/hooks/useGetSales"
import axios from "axios"
import { CUSTOMERS_API_END_POINT } from "@/utils/constants"
import toast from "react-hot-toast"
import { getRefresh } from "@/redux/customerSlice"
import Loading from "@/components/commen/Loading"



function Customer() {
  // State for customers data and search
  const [customersData, setCustomersData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sales, setSales] = useState([])
  const allCustomers = useSelector((state) => state.customers.allCustomers)
  const { allSales } = useSelector((state) => state.sale)
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch()


  // State for modals
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // State for sale search
  const [saleSearchOpen, setSaleSearchOpen] = useState(false)
  const [saleSearchTerm, setSaleSearchTerm] = useState("")
  const [selectedSales, setSelectedSales] = useState([])

  // Form state for adding/editing customer
  const [formData, setFormData] = useState({
    _id: "",
    customerId: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    purchaseHistory: [],
    notes: "",
  })

  // Filter customers based on search term
  const filteredCustomers = customersData.filter((customer) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      customer.customerId.toLowerCase().includes(searchTermLower) ||
      customer.fullName.toLowerCase().includes(searchTermLower) ||
      customer.email.toLowerCase().includes(searchTermLower) ||
      customer.phoneNumber.toLowerCase().includes(searchTermLower)
    )
  })

  // Filter sales based on search term
  const filteredSales = sales.filter((sale) => {
    if (!saleSearchTerm) return true
    return (
      sale.saleId.toLowerCase().includes(saleSearchTerm.toLowerCase()) ||
      sale.saleItem.productName.toLowerCase().includes(saleSearchTerm.toLowerCase())
    )
  })

  // Reset form data
  const resetFormData = () => {
    setFormData({
      _id: "",
      customerId: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      purchaseHistory: [],
      notes: "",
    })
    setSelectedSales([])
  }

  // Open add customer modal
  const handleOpenAddCustomerModal = () => {
    resetFormData()
    setIsAddCustomerModalOpen(true)
  }

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle sale selection
  const handleSaleSelect = (sale) => {
    const newSale = { ...sale, saleMongodbId: sale._id }

    if (!selectedSales.some((s) => s.saleMongodbId === newSale.saleMongodbId)) {
      const updatedSales = [...selectedSales, newSale]
      setSelectedSales(updatedSales)

      setFormData((prev) => ({
        ...prev,
        purchaseHistory: updatedSales,
      }))
    }

    setSaleSearchOpen(false)
  }

  // Handle sale removal
  const handleRemoveSale = (saleMongodbId) => {
    const updatedSales = selectedSales.filter((sale) => sale.saleMongodbId !== saleMongodbId)
    setSelectedSales(updatedSales)

    // Update form data
    setFormData((prev) => ({
      ...prev,
      purchaseHistory: updatedSales,
    }))
  }

  // api calling

  useEffect(() => {
    if (allSales.AllSales) {
      setSales(allSales.AllSales)
    }
  }, [allSales])
  useGetSales()

  useEffect(() => {
    if (allCustomers && allCustomers.AllCustomers) {
      setCustomersData(allCustomers.AllCustomers)
    }
  }, [allCustomers])
  useGetCustomers()


  // Submit new customer
  const handleAddCustomer = async (e) => {
    e.preventDefault()
    setIsLoading(true);


    const newCustomer = {
      ...formData,
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await axios.post(`${CUSTOMERS_API_END_POINT}/create-customer`,
        {
          customerId: formData.customerId,
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          purchaseHistory: formData.purchaseHistory,
          notes: formData.notes,
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      )
      console.log(res);
      toast.success(res.data.message);
      dispatch(getRefresh());

      setCustomersData((prev) => [...prev, newCustomer])
      setIsAddCustomerModalOpen(false)
      resetFormData()

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(`Error in handleSubmit: ${error}`);
      console.log(error);
    } finally {
      setIsLoading(false);
    }


  }

  // Open view details modal
  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer)
    setIsViewDetailsModalOpen(true)
  }

  // Open edit modal
  const handleOpenEditModal = (customer) => {
    setSelectedCustomer(customer)
    setFormData({
      ...customer,
    })
    setSelectedSales(customer.purchaseHistory)
    setIsEditModalOpen(true)
  }

  // Submit edit
  const handleEditCustomer = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const updatedCustomer = {
      ...formData,
      purchaseHistory: selectedSales,
    };

    try {
      const res = await axios.patch(
        `${CUSTOMERS_API_END_POINT}/update-customer/${updatedCustomer._id}`,
        updatedCustomer,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setCustomersData((prev) =>
        prev.map((customer) =>
          customer._id === updatedCustomer._id ? updatedCustomer : customer
        )
      );
      console.log("update cus", res);
      toast.success(res.data.message || "Customer updated successfully.");
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update customer.");
      console.error("Error updating customer:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Open delete confirmation
  const handleOpenDeleteAlert = (customer) => {
    setSelectedCustomer(customer)
    setIsDeleteAlertOpen(true)
  }

  // Confirm delete
  const handleDeleteCustomer = async () => {
    try {
      await axios.delete(`${CUSTOMERS_API_END_POINT}/delete-customer/${selectedCustomer._id}`, {
        withCredentials: true,
      });
      // Update local state
      setCustomersData((prev) =>
        prev.filter((customer) => customer._id !== selectedCustomer._id)
      );
      toast.success("Customer deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete customer.");
      console.error("Error deleting customer:", error);
    } finally {
      setIsDeleteAlertOpen(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM dd, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Calculate total spent by customer
  const calculateTotalSpent = (purchaseHistory) => {
    return purchaseHistory.reduce((total, sale) => total + sale.totalAmount, 0)
  }

  // Get most recent sale
  const getMostRecentSale = (purchaseHistory) => {
    if (purchaseHistory.length === 0) return null

    return purchaseHistory.reduce((latest, current) => {
      const latestDate = new Date(latest.salesDate)
      const currentDate = new Date(current.salesDate)
      return currentDate > latestDate ? current : latest
    }, purchaseHistory[0])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Customer Management</h1>

      {/* Search and Add Customer */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search customers by name, email, phone, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-end">
          <Button onClick={handleOpenAddCustomerModal} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        </div>
      </div>

      {/* Customers Cards Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const recentSale = getMostRecentSale(customer.purchaseHistory)
          const totalSpent = calculateTotalSpent(customer.purchaseHistory)

          return (
            <Card key={customer._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{customer.fullName}</CardTitle>
                  <Badge variant="outline" className="bg-primary/10">
                    {customer.customerId}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="ml-auto font-medium truncate max-w-[180px]">{customer.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <span className="ml-auto font-medium">{customer.phoneNumber}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <span className="ml-auto font-medium text-right max-w-[180px]">{customer.address}</span>
                  </div>

                  {recentSale ? (
                    <div className="mt-4 border-t pt-3">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-1 text-muted-foreground" />
                        Recent Purchase
                      </h4>
                      <div className="bg-muted/50 p-2 rounded-md">
                        <p className="text-sm font-medium">{recentSale.saleItem.productName}</p>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{formatDate(recentSale.salesDate)}</span>
                          <span>${recentSale.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-right mt-1 text-muted-foreground">
                        Total Spent: ${totalSpent.toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 border-t pt-3">
                      <p className="text-sm text-muted-foreground italic">No purchase history</p>
                    </div>
                  )}

                  {customer.notes && (
                    <div className="mt-2 border-t pt-3">
                      <h4 className="text-sm font-medium mb-1 flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                        Notes
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{customer.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(customer)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(customer)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDeleteAlert(customer)}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No customers found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Dialog open={isAddCustomerModalOpen} onOpenChange={setIsAddCustomerModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter the details of the new customer below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCustomer} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerId">Customer ID * (unique Id)</Label>
                <Input
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={2}
                required
              />
            </div>

            {/* Purchase History Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Purchase History *</Label>
                <Popover open={saleSearchOpen} onOpenChange={setSaleSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Sale</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="end">
                    <Command>
                      <CommandInput
                        placeholder="Search sales..."
                        value={saleSearchTerm}
                        onValueChange={setSaleSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No sales found.</CommandEmpty>
                        <CommandGroup heading="Sales">
                          {filteredSales.map((sale) => (
                            <CommandItem
                              key={sale._id}
                              value={sale.saleId}
                              onSelect={() => handleSaleSelect(sale)}
                              className="flex items-center"
                            >
                              <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{sale.saleItem.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(sale.salesDate)} - ${sale.totalAmount.toFixed(2)}
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

              {selectedSales.length > 0 ? (
                <div className="border rounded-md">
                  <ScrollArea className="h-[200px]">
                    <div className="divide-y">
                      {selectedSales.map((sale) => (
                        <div key={sale._id} className="p-3 flex items-center">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{sale.saleItem.productName}</p>
                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(sale.salesDate)}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {sale.totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSale(sale.saleMongodbId)}
                            className="ml-2 h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-3 flex justify-between items-center bg-muted/50 border-t">
                    <p className="font-medium">Total Spent</p>
                    <p className="font-bold">${calculateTotalSpent(selectedSales).toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No purchase history</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add Sale" to add purchase history</p>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes about the customer"
              />
            </div>

            <DialogFooter>
              {
                isLoading ? <Button><Loading color="#000" /></Button> : <Button type="submit">Add Customer</Button>
              }
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      {selectedCustomer && (
        <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedCustomer.fullName}</h3>
                <Badge variant="outline" className="bg-primary/10">
                  {selectedCustomer.customerId}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer ID</h4>
                  <p>{selectedCustomer.customerId}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Contact Information</h4>
                <div className="space-y-1">
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    {selectedCustomer.fullName}
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                    {selectedCustomer.email}
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                    {selectedCustomer.phoneNumber}
                  </p>
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-1 text-muted-foreground" />
                    <span>{selectedCustomer.address}</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Purchase History</h4>
                {selectedCustomer.purchaseHistory.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sale ID</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.purchaseHistory.map((sale) => (
                          <TableRow key={sale.saleMongodbId}>
                            <TableCell className="font-medium">{sale.saleId}</TableCell>
                            <TableCell>{sale.saleItem.productName}</TableCell>
                            <TableCell>{formatDate(sale.salesDate)}</TableCell>
                            <TableCell className="text-right">${sale.totalAmount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-bold">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${calculateTotalSpent(selectedCustomer.purchaseHistory).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No purchase history available</p>
                )}
              </div>

              {selectedCustomer.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{selectedCustomer.notes}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Created At</h4>
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  {formatDate(selectedCustomer.createdAt)}
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleOpenEditModal(selectedCustomer)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleOpenDeleteAlert(selectedCustomer)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update the details of the customer below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCustomer} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-customerId">Customer ID * (unique Id)</Label>
                <Input
                  id="edit-customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}

                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-fullName">Full Name *</Label>
              <Input
                id="edit-fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phoneNumber">Phone Number *</Label>
                <Input
                  id="edit-phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Textarea
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={2}
                required
              />
            </div>

            {/* Purchase History Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Purchase History *</Label>
                <Popover open={saleSearchOpen} onOpenChange={setSaleSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Sale</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="end">
                    <Command>
                      <CommandInput
                        placeholder="Search sales..."
                        value={saleSearchTerm}
                        onValueChange={setSaleSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No sales found.</CommandEmpty>
                        <CommandGroup heading="Sales">
                          {filteredSales.map((sale) => (
                            <CommandItem
                              key={sale._id}
                              value={sale.saleId}
                              onSelect={() => handleSaleSelect(sale)}
                              className="flex items-center"
                            >
                              <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{sale.saleItem.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(sale.salesDate)} - ${sale.totalAmount.toFixed(2)}
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

              {selectedSales.length > 0 ? (
                <div className="border rounded-md">
                  <ScrollArea className="h-[200px]">
                    <div className="divide-y">
                      {selectedSales.map((sale) => (
                        <div key={sale._id} className="p-3 flex items-center">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{sale.saleItem.productName}</p>
                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(sale.salesDate)}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {sale.totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSale(sale.saleMongodbId)}
                            className="ml-2 h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-3 flex justify-between items-center bg-muted/50 border-t">
                    <p className="font-medium">Total Spent</p>
                    <p className="font-bold">${calculateTotalSpent(selectedSales).toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No purchase history</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add Sale" to add purchase history</p>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes about the customer"
              />
            </div>

            <DialogFooter>
              {
                isLoading ? <Button><Loading color="000" /></Button> : <Button type="submit">Save Changes</Button>
              }
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      {selectedCustomer && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the customer record for "{selectedCustomer.fullName}" (ID:{" "}
                {selectedCustomer.customerId}). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

export default Customer