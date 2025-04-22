import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import useGetPurchases from "@/hooks/useGetPurchaseSlice"
import useGetProducts from "@/hooks/useGetProducts"
import axios from "axios"
import { PURCHASES_API_END_POINT } from "@/utils/constants"
import toast from "react-hot-toast"
import { getRefresh } from "@/redux/purchaseSlice"
import { format } from "date-fns";


const PurchaseOrders = () => {

  // State for purchases
  const [purchases, setPurchases] = useState([])

  // State for search
  const [searchQuery, setSearchQuery] = useState("")

  // State for form
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPurchase, setCurrentPurchase] = useState({
    _id: "",
    purchaseId: "",
    supplierId: "",
    supplierName: "",
    supplierContact: "",
    supplierEmail: "",
    supplierAddress: "",
    products: [],
    orderDate: "",
    deliveryDate: "",
    paymentStatus: "Pending",
    notes: "",
  })

  // State for product search in form
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [selectedProducts, setSelectedProducts] = useState([])

  // State for view details modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewPurchase, setViewPurchase] = useState(null)

  // State for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [purchaseToDelete, setPurchaseToDelete] = useState(null)

  const [products, setProducts] = useState([]);

  const allPurchases = useSelector((state) => state.purchases.allPurchases);
  const { allProducts } = useSelector((store) => store.product)

  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false);


  // Filter purchases based on search query
  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.purchaseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.supplierName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter available products based on product search query
  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      product.productId.toLowerCase().includes(productSearchQuery.toLowerCase()),
  )

  // Handle adding a product to the purchase
  const handleAddProduct = (product) => {
    const isProductAlreadyAdded = selectedProducts.some((p) => p.productMongodbId === product._id)

    if (!isProductAlreadyAdded) {
      const newProduct = {
        productMongodbId: product._id,
        productId: product.productId,
        productName: product.productName,
        quantity: 1,
        sellingPrice: product.sellingPrice,
        totalPrice: product.sellingPrice,
      }

      setSelectedProducts([...selectedProducts, newProduct])
    }
  }

  // Handle removing a product from the purchase
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.productMongodbId !== productId))
  }

  // Handle quantity change for a product
  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(
      selectedProducts.map((product) => {
        if (product.productMongodbId === productId) {
          const newQuantity = Number.parseInt(quantity) || 0
          return {
            ...product,
            quantity: newQuantity,
            totalPrice: newQuantity * product.sellingPrice,
          }
        }
        return product
      }),
    )
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentPurchase({
      ...currentPurchase,
      [name]: value,
    })
  }

  // Handle payment status change
  const handlePaymentStatusChange = (value) => {
    setCurrentPurchase({
      ...currentPurchase,
      paymentStatus: value,
    })
  }

  // Open add form
  const openAddForm = () => {
    setIsEditMode(false)
    setCurrentPurchase({
      _id: "",
      purchaseId: "",
      supplierId: "",
      supplierName: "",
      supplierContact: "",
      supplierEmail: "",
      supplierAddress: "",
      products: [],
      orderDate: new Date().toISOString().split("T")[0],
      deliveryDate: "",
      paymentStatus: "Pending",
      notes: "",
    })
    setSelectedProducts([])
    setIsAddFormOpen(true)
  }

  // Open edit form
  const openEditForm = (purchase) => {
    setIsEditMode(true)
    setCurrentPurchase({
      ...purchase,
      orderDate: format(new Date(purchase.orderDate), "yyyy-MM-dd"),      // 👈 for <input type="date" />
      deliveryDate: purchase.deliveryDate
        ? format(new Date(purchase.deliveryDate), "yyyy-MM-dd")
        : "",
    });
    setSelectedProducts([...purchase.products])
    setIsAddFormOpen(true)
  }

  // Open view details modal
  const openViewModal = (purchase) => {
    setViewPurchase(purchase)
    setIsViewModalOpen(true)
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (purchase) => {
    setPurchaseToDelete(purchase)
    setIsDeleteDialogOpen(true)
  }

  // api calli
  useEffect(() => {
    if (allProducts?.AllProducts) {
      setProducts(allProducts.AllProducts);
    }
  }, [allProducts]);
  useGetProducts()


  useEffect(() => {
    if (allPurchases?.AllPurchases) {
      setPurchases(allPurchases.AllPurchases);
    }
  }, [allPurchases]);
  useGetPurchases()



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      ...currentPurchase,
      products: selectedProducts,
    };

    try {
      if (isEditMode) {
        // 🔥 Update existing purchase
        const res = await axios.patch(
          `${PURCHASES_API_END_POINT}/update-purchase/${formData._id}`,
          formData,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        toast.success(res.data.message || "Purchase updated successfully!");

      } else {
        // 🔥 Create new purchase
        const res = await axios.post(
          `${PURCHASES_API_END_POINT}/create-purchase`,
          formData,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        toast.success(res.data.message || "Purchase created successfully!");
      }
      // ✅ After successful API call
      setIsAddFormOpen(false);
      dispatch(getRefresh());  // if you have Redux action to refresh purchases

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save purchase!");
    }
  };

  // Handle purchase deletion
  const handleDeletePurchase = async () => {
    if (!purchaseToDelete) return;

    try {
      const res = await axios.delete(
        `${PURCHASES_API_END_POINT}/delete-purchase/${purchaseToDelete._id}`,
        {
          withCredentials: true,
        }
      );

      // Show success toast
      toast.success(res.data?.message || "Purchase deleted successfully!");

      // Remove from local state
      setPurchases(purchases.filter((p) => p._id !== purchaseToDelete._id));
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete purchase!");
    } finally {
      setIsDeleteDialogOpen(false);
      setPurchaseToDelete(null);
    }
  };


  // Calculate total amount for a purchase
  const calculateTotalAmount = (products) => {
    return products.reduce((total, product) => total + product.totalPrice, 0)
  }

  // Get badge color based on payment status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Effect to update selected products when editing
  useEffect(() => {
    if (isEditMode && currentPurchase.products) {
      setSelectedProducts(currentPurchase.products)
    }
  }, [isEditMode, currentPurchase])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Purchases Management</h1>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search purchases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openAddForm} className="flex items-center gap-2">
          <Plus size={18} />
          Add Purchase
        </Button>
      </div>

      {/* Purchases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPurchases.length > 0 ? (
          filteredPurchases.map((purchase) => (
            <Card key={purchase._id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{purchase.purchaseId}</CardTitle>
                    <CardDescription className="mt-1">{purchase.supplierName}</CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(purchase.paymentStatus)}>{purchase.paymentStatus}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order Date:</span>
                    <span>{format(new Date(purchase.orderDate), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Date:</span>
                    <span>{purchase.deliveryDate ? format(new Date(purchase.deliveryDate), "dd MMM yyyy") : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Products:</span>
                    <span>{purchase.products.length}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Total Amount:</span>
                    <span>${calculateTotalAmount(purchase.products).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => openViewModal(purchase)}>
                  <Eye size={16} className="mr-1" /> View
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEditForm(purchase)}>
                  <Edit size={16} className="mr-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => openDeleteDialog(purchase)}
                >
                  <Trash2 size={16} className="mr-1" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No purchases found. Add a new purchase to get started.
          </div>
        )}
      </div>

      {/* Add/Edit Purchase Form Modal */}
      <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Purchase" : "Add New Purchase"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Purchase Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchaseId">Purchase ID</Label>
                <Input
                  id="purchaseId"
                  name="purchaseId"
                  value={currentPurchase.purchaseId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="supplierId">Supplier ID</Label>
                <Input
                  id="supplierId"
                  name="supplierId"
                  value={currentPurchase.supplierId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  name="supplierName"
                  value={currentPurchase.supplierName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="supplierContact">Supplier Contact</Label>
                <Input
                  id="supplierContact"
                  name="supplierContact"
                  value={currentPurchase.supplierContact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="supplierEmail">Supplier Email</Label>
                <Input
                  id="supplierEmail"
                  name="supplierEmail"
                  type="email"
                  value={currentPurchase.supplierEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="supplierAddress">Supplier Address</Label>
                <Input
                  id="supplierAddress"
                  name="supplierAddress"
                  value={currentPurchase.supplierAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="orderDate">Order Date</Label>
                <Input
                  id="orderDate"
                  name="orderDate"
                  type="date"
                  value={currentPurchase.orderDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deliveryDate">Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="date"
                  value={currentPurchase.deliveryDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={currentPurchase.paymentStatus} onValueChange={handlePaymentStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" value={currentPurchase.notes} onChange={handleInputChange} rows={3} />
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Products</h3>

              {/* Product Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search for products to add..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Product Search Results */}
              {productSearchQuery && (
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>{product.productId}</TableCell>
                            <TableCell>{product.productName}</TableCell>
                            <TableCell>${product.sellingPrice}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddProduct(product)}
                                disabled={selectedProducts.some((p) => p.productMongodbId === product._id)}
                              >
                                {selectedProducts.some((p) => p.productMongodbId === product._id) ? "Added" : "Add"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No products found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Selected Products */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProducts.length > 0 ? (
                      selectedProducts.map((product) => (
                        <TableRow key={product.productMongodbId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.productName}</div>
                              <div className="text-sm text-gray-500">{product.productId}</div>
                            </div>
                          </TableCell>
                          <TableCell>${product.sellingPrice}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => handleQuantityChange(product.productMongodbId, e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>${product.totalPrice}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveProduct(product.productMongodbId)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          No products added. Search and add products above.
                        </TableCell>
                      </TableRow>
                    )}
                    {selectedProducts.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total Amount:
                        </TableCell>
                        <TableCell colSpan={2} className="font-bold">
                          ${calculateTotalAmount(selectedProducts).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update Purchase" : "Add Purchase"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Purchase Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
          </DialogHeader>

          {viewPurchase && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Purchase ID</h3>
                  <p>{viewPurchase.purchaseId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Supplier ID</h3>
                  <p>{viewPurchase.supplierId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Supplier Name</h3>
                  <p>{viewPurchase.supplierName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Supplier Contact</h3>
                  <p>{viewPurchase.supplierContact}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Supplier Email</h3>
                  <p>{viewPurchase.supplierEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Supplier Address</h3>
                  <p>{viewPurchase.supplierAddress}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                  <p>{format(new Date(viewPurchase.orderDate), "dd MMM yyyy")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Delivery Date</h3>
                  <p>{viewPurchase.deliveryDate ? format(new Date(viewPurchase.deliveryDate), "dd MMM yyyy") : "Not set"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                  <Badge className={getStatusBadgeColor(viewPurchase.paymentStatus)}>
                    {viewPurchase.paymentStatus}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p>{viewPurchase.notes || "No notes"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Products</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewPurchase.products.map((product) => (
                        <TableRow key={product.productMongodbId}>
                          <TableCell>{product.productId}</TableCell>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell>${product.sellingPrice}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>${product.totalPrice}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Total Amount:
                        </TableCell>
                        <TableCell className="font-bold">
                          ${calculateTotalAmount(viewPurchase.products).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the purchase
              {purchaseToDelete && ` "${purchaseToDelete.purchaseId}"`} and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePurchase} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PurchaseOrders
