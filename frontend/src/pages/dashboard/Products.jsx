import React, { useEffect, useState } from 'react'
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import CardImage from "../../assets/placeholder.png"
import useGetProducts from '@/hooks/useGetProducts'
import { useDispatch, useSelector } from 'react-redux'
import Loading from '@/components/commen/Loading'
import toast from 'react-hot-toast'
import axios from 'axios'
import { PRODUCTS_API_END_POINT } from '@/utils/constants'
import { getRefresh } from '@/redux/productSlice'
import { format } from "date-fns";




function Products() {

  // variable or state in react
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    category: "",
    description: "",
    productImage: "",
    quantity: "",
    expirationDate: "",
    costPrice: "",
    sellingPrice: "",
    notes: "",
    dateAdded: "",
    warehouse: "",
    status: "",
    supplierName: "",
  })
  const [filters, setFilters] = useState({
    stockStatus: "All",
  })
  const [products, setProducts] = useState([]);
  const { allProducts } = useSelector((store) => store.product)
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch()


  // handle the changes or model 
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }))
  }

  const openEditModal = (product) => {
    setFormData({
      ...product,
      dateAdded: product.dateAdded
        ? format(new Date(product.dateAdded), "yyyy-MM-dd") // ✅ Ensure proper format for input type="date"
        : format(new Date(), "yyyy-MM-dd"),
    });
    setIsEditModalOpen(true);
  }

  const resetForm = () => {
    setFormData({
      productId: "",
      productName: "",
      category: "",
      description: "",
      productImage: "",
      quantity: "",
      expirationDate: "",
      costPrice: "",
      sellingPrice: "",
      notes: "",
      dateAdded: "",
      warehouse: "",
      status: "",
      supplierName: "",
    })
  }



  // api calling
  useEffect(() => {
    if (allProducts?.AllProducts) {
      setProducts(allProducts.AllProducts);
    }
  }, [allProducts]);
  useGetProducts()


  // handle the form 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formattedDate = formData.dateAdded
      ? format(new Date(formData.dateAdded), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");

    try {
      const res = await axios.post(
        `${PRODUCTS_API_END_POINT}/create-product`,
        {
          productId: formData.productId,
          productName: formData.productName,
          category: formData.category,
          description: formData.description,
          quantity: formData.quantity,
          expirationDate: formData.expirationDate,
          costPrice: formData.costPrice,
          sellingPrice: formData.sellingPrice,
          notes: formData.notes,
          dateAdded: formattedDate,
          warehouse: formData.warehouse,
          status: formData.status,
          supplierName: formData.supplierName,
          productImage: formData.productImage,

        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log(res);
      toast.success(res.data.message);
      console.log("🔍 Request Headers:", res.config.headers);
      // Update state only after success
      setProducts((prevProducts) => [...prevProducts, res.data.product]);
      setIsAddProductModalOpen(false);
      resetForm();
      dispatch(getRefresh())
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(`Error in handleSubmit: ${error}`);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.patch(
        `${PRODUCTS_API_END_POINT}/update-product/${formData._id}`,
        {
          productId: formData.productId,
          productName: formData.productName,
          category: formData.category,
          description: formData.description,
          quantity: formData.quantity,
          expirationDate: formData.expirationDate,
          costPrice: formData.costPrice,
          sellingPrice: formData.sellingPrice,
          notes: formData.notes,
          dateAdded: formData.dateAdded,
          warehouse: formData.warehouse,
          status: formData.status,
          supplierName: formData.supplierName,
          productImage: formData.productImage,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      console.log("id", formData._id);
      console.log(res);
      toast.success(res.data.message);
      dispatch(getRefresh()); // Refresh product list from API
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.error(`Error in handleUpdate: ${error}`);
    } finally {
      setIsLoading(false);
      setIsEditModalOpen(false); // Close modal after update
      resetForm();
    }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const res = await axios.delete(
        `${PRODUCTS_API_END_POINT}/delete-product/${id}`,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      console.log(res);
      toast.success(res.data.message);
      dispatch(getRefresh())
      // setProducts(products.filter((product) => product.productId !== id))

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(`Error in handleSubmit: ${error}`);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
    setSelectedProduct(null)
  }


  // Filter products based on search term and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

    let matchesStatus = true;
    if (filters.stockStatus !== "all") {
      if (filters.stockStatus === "Low Stock") {
        matchesStatus = product.status === "Low Stock";
      } else if (filters.stockStatus === "Available") {
        matchesStatus = product.status === "Available";
      } else if (filters.stockStatus === "Out of Stock") {
        matchesStatus = product.status === "Out of Stock";
      }
    }

    return matchesSearch && matchesStatus;
  });


  // status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500 hover:bg-green-600"
      case "Low Stock":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "Out of Stock":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // product card component
  function ProductCard({ product }) {

    return (
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
          <img src={product.productImage || CardImage} alt={product.productName} className="w-full h-48 object-cover" />
        </div>
        <CardHeader className="p-4 pb-0">
          <h3 className="text-lg font-semibold">{product.productName}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-muted-foreground">{product.category}</p>
          <p className="text-lg font-bold mt-1">${product.costPrice}</p>
          <Badge className={`mt-2 ${getStatusColor(product.status)}`}>{product.status}</Badge>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button onClick={() => setSelectedProduct(product)}>View</Button>
          <Button variant="outline" onClick={() => openEditModal(product)}><Edit className="w-4 h-4" /></Button>
          <Button variant="destructive" onClick={(e) => handleDelete(product._id, e)}><Trash2 className="w-4 h-4" /></Button>
        </CardFooter>
      </Card>
    )
  }

  // ProductGrid Component
  function ProductGrid() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    )
  }

  // display more details of product component
  function ProductDetailsModal() {
    if (!selectedProduct) return null

    return (
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent aria-describedby="dialog-description" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct.productName}</DialogTitle>
            <DialogDescription id="dialog-description">
              View product details
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="flex justify-center items-center">
                  <img className='w-32 h-32 object-cover rounded-lg' alt={selectedProduct.productName} src={selectedProduct.productImage || CardImage} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Product Id</TableCell>
                <TableCell>{selectedProduct.productId || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Description</TableCell>
                <TableCell>{selectedProduct.description || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Category</TableCell>
                <TableCell>{selectedProduct.category || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell>{selectedProduct.status || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost Price</TableCell>
                <TableCell>₹{Number(selectedProduct.costPrice).toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Selling Price</TableCell>
                <TableCell>₹{Number(selectedProduct.sellingPrice).toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Supplier</TableCell>
                <TableCell>{selectedProduct.supplierName || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Expiration Date</TableCell>
                <TableCell>{selectedProduct.expirationDate || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Stock Quantity</TableCell>
                <TableCell>{selectedProduct.quantity || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Warehouse Location</TableCell>
                <TableCell>{selectedProduct.warehouse || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Notes</TableCell>
                <TableCell>{selectedProduct.notes || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Date Added</TableCell>
                <TableCell>    {selectedProduct.dateAdded
                  ? format(new Date(selectedProduct.dateAdded), "dd MMM yyyy") // Example: "23 Mar 2025"
                  : "N/A"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    )
  }


  return (

    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>
        {/* Search and Add Product */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-end">
            <Button onClick={() => setIsAddProductModalOpen(true)} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </div>
        </div>

        {/* add product */}
        <Dialog open={isAddProductModalOpen} onOpenChange={setIsAddProductModalOpen}>
          <DialogContent id="dialog-description" aria-describedby={selectedProduct ? "dialog-description" : undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription id="dialog-description">
                Add product details in the form below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="productId">Product Id * (Unique Id)</Label>
                  <Input id="productId" name="productId" value={formData.productId} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="productName">Product Name * </Label>
                  <Input id="productName" name="productName" value={formData.productName} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" value={formData.category} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" value={formData.description} onChange={handleInputChange} />
                </div>

                {/* {image} */}
                <div className="grid gap-2">
                  <Label htmlFor="productImage">Product Image</Label>
                  <Input type="file" id="productImage" name="productImage" onChange={handleInputChange} accept="image/*" />
                </div>


                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity * </Label>
                  <Input type="Number" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input type="date" id="expirationDate" name="expirationDate" value={formData.expirationDate} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="costPrice">Cost Price * </Label>
                  <Input type="Number" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sellingPrice">Selling Price * </Label>
                  <Input type="Number" id="sellingPrice" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dateAdded">Date Added</Label>
                  <Input type="date" id="dateAdded" name="dateAdded" value={formData.dateAdded} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Input id="warehouse" name="warehouse" value={formData.warehouse} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status * </Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input id="supplierName" name="supplierName" value={formData.supplierName} onChange={handleInputChange} />
                </div>
              </div>
              <DialogFooter>
                {isLoading ? (<Button type="submit"><Loading color='#000' /></Button>) : (<Button type="submit">Add Product</Button>)}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={filters.stockStatus} onValueChange={(value) => handleFilterChange("stockStatus", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Stock Status</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* display product */}
        <ProductGrid />

        {/* display single product */}
        <ProductDetailsModal />

        {/* edit */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent id="dialog-description" aria-describedby={selectedProduct ? "dialog-description" : undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product details and save changes.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="productId">Product Id * (Unique Id)</Label>
                  <Input id="productId" name="productId" value={formData.productId} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="productName">Product Name * </Label>
                  <Input id="productName" name="productName" value={formData.productName} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" value={formData.category} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" value={formData.description} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="productImage">Product Image</Label>
                  <Input type="file" id="productImage" name="productImage" onChange={handleInputChange} accept="image/*" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity * </Label>
                  <Input type="Number" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expirationDate">Expiration Date </Label>
                  <Input type="date" id="expirationDate" name="expirationDate" value={formData.expirationDate} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="costPrice">Cost Price * </Label>
                  <Input type="Number" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sellingPrice">Selling Price * </Label>
                  <Input type="Number" id="sellingPrice" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dateAdded">Date Added</Label>
                  <Input type="date" id="dateAdded" name="dateAdded" value={formData.dateAdded} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Input id="warehouse" name="warehouse" value={formData.warehouse} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status * </Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("Status", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input id="supplierName" name="supplierName" value={formData.supplierName} onChange={handleInputChange} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={(e) => { e.preventDefault(); setIsEditModalOpen(false) }}>Cancel</Button>
                {
                  isLoading ? (
                    <Button><Loading color='#000' /></Button>
                  ) : (
                    <Button onClick={handleUpdate}>Save</Button>
                  )
                }
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>

  )
}

export default Products