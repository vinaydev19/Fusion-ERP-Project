
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
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
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
import { Skeleton } from "@/components/ui/skeleton"
import useGetFinancials from "@/hooks/useGetFinancial"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { FINANCIALS_API_END_POINT } from "@/utils/constants"
import toast from "react-hot-toast"
import { getRefresh } from "@/redux/financialSlice"
import Loading from "@/components/commen/Loading"


function FinancialTransactions() {
  // State for transactions data and search
  const [transactionsData, setTransactionsData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  // State for modals
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  // State for currency data
  const [currencies, setCurrencies] = useState([])
  const [exchangeRates, setExchangeRates] = useState({})
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true)
  const [isCalculatingRate, setIsCalculatingRate] = useState(false)


  // Form state for adding/editing transaction
  const [formData, setFormData] = useState({
    _id: "",
    transactionId: "",
    type: "",
    financialDate: "",
    fromAmount: "",
    fromCurrency: "INR",
    toAmount: "",
    toCurrency: "INR",
    exchangeRate: "",
    paymentMethod: "",
    account: "",
    notes: "",
    status: "",
    invoiceId: "",
  })
  const { allFinancials } = useSelector((store) => store.financial)
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false);



  // Fetch currencies and exchange rates on component mount
  useEffect(() => {
    fetchCurrencies()
  }, [])

  // Fetch available currencies
  const fetchCurrencies = async () => {
    setIsLoadingCurrencies(true)
    try {
      const response = await fetch("https://v6.exchangerate-api.com/v6/200615b92498ac7c5413056f/latest/USD")
      const data = await response.json()

      if (data.result === "success") {
        // Get currency codes from the conversion_rates object
        const currencyCodes = Object.keys(data.conversion_rates)
        setCurrencies(currencyCodes)
        setExchangeRates(data.conversion_rates)
      } else {
        console.error("Failed to fetch currencies:", data.error)
      }
    } catch (error) {
      console.error("Error fetching currencies:", error)
    } finally {
      setIsLoadingCurrencies(false)
    }
  }

  // Call this function once when the app loads
  useEffect(() => {
    const lastUpdated = localStorage.getItem("lastUpdated");
    if (lastUpdated && Date.now() - lastUpdated < 3600000) { // 1-hour cache
      setExchangeRates(JSON.parse(localStorage.getItem("exchangeRates")));
    } else {
      fetchCurrencies();
    }
  }, []);

  // Fetch exchange rate for specific currency pair
  const fetchExchangeRate = async (fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return 1;

    // Use cached exchange rates
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
      return exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    }

    // Fallback to API call if not found in cache
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${import.meta.env.VITE_CURRENCY_API}/latest/${fromCurrency}`);
      const data = await response.json();
      if (data.result === "success") {
        setExchangeRates((prevRates) => ({
          ...prevRates,
          ...data.conversion_rates
        }));
        return data.conversion_rates[toCurrency];
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
    return null;
  };


  // Calculate converted amount based on exchange rate
  const calculateConvertedAmount = (amount, rate) => {
    if (!amount || !rate) return ""
    return (Number.parseFloat(amount) * rate).toFixed(2)
  }

  // Handle currency change
  const handleCurrencyChange = async (name, value) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };

      if ((name === "fromCurrency" && prev.toCurrency) || (name === "toCurrency" && prev.fromCurrency)) {
        fetchExchangeRate(updatedFormData.fromCurrency, updatedFormData.toCurrency).then((rate) => {
          setFormData((finalPrev) => ({
            ...finalPrev,
            exchangeRate: rate,
            toAmount: finalPrev.fromAmount ? calculateConvertedAmount(finalPrev.fromAmount, rate) : "",
          }));
        });
      }

      return updatedFormData;
    });
  };


  // Handle amount change
  const handleAmountChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // If fromAmount changes and we have an exchange rate, calculate toAmount
    if (name === "fromAmount" && formData.exchangeRate) {
      const convertedAmount = calculateConvertedAmount(value, formData.exchangeRate)
      setFormData((prev) => ({ ...prev, toAmount: convertedAmount }))
    }
  }

  // Filter transactions based on search term
  const filteredTransactions = transactionsData.filter((transaction) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      transaction.transactionId.toLowerCase().includes(searchTermLower) ||
      transaction.description?.toLowerCase().includes(searchTermLower) ||
      transaction.paymentMethod.toLowerCase().includes(searchTermLower) ||
      transaction.status.toLowerCase().includes(searchTermLower) ||
      transaction.invoiceId.toLowerCase().includes(searchTermLower) ||
      transaction.fromCurrency.toLowerCase().includes(searchTermLower) ||
      transaction.toCurrency.toLowerCase().includes(searchTermLower)
    )
  })

  // Reset form data
  const resetFormData = () => {
    setFormData({
      _id: "",
      transactionId: "",
      type: "",
      financialDate: format(new Date(), "yyyy-MM-dd"),
      fromAmount: "",
      fromCurrency: "INR",
      toAmount: "",
      toCurrency: "INR",
      exchangeRate: "",
      paymentMethod: "",
      account: "",
      notes: "",
      status: "Pending",
      invoiceId: "",
    })

    // Fetch initial exchange rate for USD to EUR
    fetchExchangeRate("INR", "INR").then((rate) => {
      if (rate) {
        setFormData((prev) => ({
          ...prev,
          exchangeRate: rate,
        }))
      }
    })
  }

  // Open add transaction modal
  const handleOpenAddTransactionModal = () => {
    resetFormData()
    setIsAddTransactionModalOpen(true)
  }

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }



  // api calls
  // fetch the financial transaction and display
  useEffect(() => {
    if (allFinancials?.AllFinancials) {
      setTransactionsData(allFinancials.AllFinancials);
    }
  }, [allFinancials]);
  useGetFinancials()





  // Submit new transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(`${FINANCIALS_API_END_POINT}/create-financial`, {
        transactionId: formData.transactionId,
        type: formData.type,
        financialDate: formData.financialDate,
        fromAmount: formData.fromAmount,
        fromCurrency: formData.fromCurrency,
        toAmount: formData.toAmount,
        toCurrency: formData.toCurrency,
        exchangeRate: formData.exchangeRate,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        account: formData.account,
        notes: formData.notes,
        status: formData.status,
        invoiceId: formData.invoiceId,
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


    const newTransaction = {
      ...formData,
      fromAmount: Number.parseFloat(formData.fromAmount),
      toAmount: Number.parseFloat(formData.toAmount),
      exchangeRate: Number.parseFloat(formData.exchangeRate),
    }

    setTransactionsData((prev) => [...prev, newTransaction])
    setIsAddTransactionModalOpen(false)
    resetFormData()
  }

  // Open view details modal
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setIsViewDetailsModalOpen(true)
  }

  // Open edit modal
  const handleOpenEditModal = (transaction) => {
    setSelectedTransaction(transaction);

    // Convert date to 'YYYY-MM-DD' format for input field
    const formattedDate = transaction.financialDate
      ? new Date(transaction.financialDate).toISOString().split("T")[0]
      : "";

    setFormData({
      ...transaction,
      financialDate: formattedDate,  // Set formatted date
      fromAmount: transaction.fromAmount.toString(),
      toAmount: transaction.toAmount.toString(),
      exchangeRate: transaction.exchangeRate.toString(),
    });

    setIsEditModalOpen(true);
  };


  // Submit edit
  const handleEditTransaction = async (e) => {
    e.preventDefault();

    if (!formData._id) {
      toast.error("Transaction ID is required.");
      return;
    }

    setIsLoading(true);

    try {
      // Define updated transaction BEFORE updating state
      const updatedTransaction = {
        ...formData,
        fromAmount: Number.parseFloat(formData.fromAmount),
        toAmount: Number.parseFloat(formData.toAmount),
        exchangeRate: Number.parseFloat(formData.exchangeRate),
      };

      const res = await axios.patch(`${FINANCIALS_API_END_POINT}/update-financial/${formData._id}`, {
        transactionId: formData.transactionId,
        type: formData.type,
        financialDate: formData.financialDate,
        fromAmount: formData.fromAmount,
        fromCurrency: formData.fromCurrency,
        toAmount: formData.toAmount,
        toCurrency: formData.toCurrency,
        exchangeRate: formData.exchangeRate,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        account: formData.account,
        notes: formData.notes,
        status: formData.status,
        invoiceId: formData.invoiceId,
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log("Updating transaction ID:", formData._id);
      toast.success(res.data.message);
      dispatch(getRefresh());

      // Update local state
      setTransactionsData((prev) =>
        prev.map((transaction) => (transaction._id === updatedTransaction._id ? updatedTransaction : transaction))
      );

      setIsEditModalOpen(false); // Close modal after update success
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.error("Error in handleEditTransaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open delete confirmation
  const handleOpenDeleteAlert = (transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteAlertOpen(true)
  }

  // Confirm delete
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    setIsLoading(true);

    try {
      const res = await axios.delete(`${FINANCIALS_API_END_POINT}/delete-financial/${selectedTransaction._id}`, {
        withCredentials: true
      });
      console.log("id", selectedTransaction._id);
      toast.success(res.data.message);
      dispatch(getRefresh());
      setTransactionsData((prev) => prev.filter((transaction) => transaction._id !== selectedTransaction._id))
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete sale");
      console.error("Error in handleDeleteSale:", error);
    } finally {
      setIsLoading(false);
      setIsDeleteAlertOpen(false);
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

  // Get transaction type badge style
  const getTransactionTypeStyle = (type) => {
    if (type === "Income") {
      return {
        icon: <ArrowUpRight className="h-4 w-4 mr-1" />,
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      }
    } else {
      return {
        icon: <ArrowDownLeft className="h-4 w-4 mr-1" />,
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      }
    }
  }

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Transaction Management</h1>

      {/* Search and Add Transaction */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search transactions by ID, currency, payment method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-end">
          <Button onClick={handleOpenAddTransactionModal} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add New Transaction
          </Button>
        </div>
      </div>

      {/* Transactions Cards Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction._id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Transaction {transaction.transactionId || 'N/A'}</CardTitle>
                <Badge className={getTransactionTypeStyle(transaction.type).className || 'N/A'}>
                  <span className="flex items-center">
                    {getTransactionTypeStyle(transaction.type).icon}
                    {transaction.type || 'N/A'}
                  </span>
                </Badge>
              </div>
              <div className="mt-1">
                <Badge variant="outline" className={getStatusBadgeStyle(transaction.status)}>
                  {transaction.status || 'N/A'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">From:</span>
                  <span className="ml-auto font-medium">
                    {transaction.fromCurrency || 'N/A'} {transaction.fromAmount.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">To:</span>
                  <span className="ml-auto font-medium">
                    {transaction.toCurrency || 'N/A'} {transaction.toAmount.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Rate:</span>
                  <span className="ml-auto font-medium">
                    1 {transaction.fromCurrency || 'N/A'} = {transaction.exchangeRate.toFixed(4) || 'N/A'} {transaction.toCurrency || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment:</span>
                  <span className="ml-auto font-medium">{transaction.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="ml-auto font-medium">{formatDate(transaction.financialDate) || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(transaction)}>
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(transaction)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenDeleteAlert(transaction)}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No transactions found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Dialog open={isAddTransactionModalOpen} onOpenChange={setIsAddTransactionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>Enter the details of the new transaction below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="transactionId">Transaction ID * (Unique Id)</Label>
                <Input
                  id="transactionId"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type * </Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="financialDate">Financial Date * </Label>
                <Input
                  type="date"
                  id="financialDate"
                  name="financialDate"
                  value={formData.financialDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status * </Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Currency Conversion Section */}
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-4">Currency Conversion</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="fromAmount">From Amount * </Label>
                  <Input
                    type="number"
                    id="fromAmount"
                    name="fromAmount"
                    value={formData.fromAmount}
                    onChange={handleAmountChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fromCurrency">From Currency * </Label>
                  {isLoadingCurrencies ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={formData.fromCurrency}
                      onValueChange={(value) => handleCurrencyChange("fromCurrency", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="toAmount">To Amount</Label>
                  <Input
                    type="number"
                    id="toAmount"
                    name="toAmount"
                    value={formData.toAmount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="toCurrency">To Currency</Label>
                  {isLoadingCurrencies ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={formData.toCurrency}
                      onValueChange={(value) => handleCurrencyChange("toCurrency", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="exchangeRate">Exchange Rate</Label>
                <div className="relative">
                  <Input
                    id="exchangeRate"
                    name="exchangeRate"
                    value={formData.exchangeRate}
                    onChange={handleInputChange}
                    disabled
                  />
                  {isCalculatingRate && (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  1 {formData.fromCurrency} = {formData.exchangeRate || "?"} {formData.toCurrency}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="account">Account</Label>
                <Input id="account" name="account" value={formData.account} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invoiceId">Invoice ID</Label>
              <Input id="invoiceId" name="invoiceId" value={formData.invoiceId} onChange={handleInputChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
            </div>

            <DialogFooter>
              {
                isLoading ? (<Button><Loading color="#000" /></Button>) : (<Button type="submit">Add Transaction</Button>)
              }
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      {selectedTransaction && (
        <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Transaction {selectedTransaction.transactionId || 'N/A'}</h3>
                <Badge className={getTransactionTypeStyle(selectedTransaction.type).className}>
                  <span className="flex items-center">
                    {getTransactionTypeStyle(selectedTransaction.type).icon}
                    {selectedTransaction.type}
                  </span>
                </Badge>
              </div>
              <div className="mt-1">
                <Badge variant="outline" className={getStatusBadgeStyle(selectedTransaction.status)}>
                  {selectedTransaction.status || 'N/A'}
                </Badge>
              </div>

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Transaction ID</TableCell>
                    <TableCell>{selectedTransaction.transactionId || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Type</TableCell>
                    <TableCell>{selectedTransaction.type || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Financial Date</TableCell>
                    <TableCell>{formatDate(selectedTransaction.financialDate) || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">From Amount</TableCell>
                    <TableCell>
                      {selectedTransaction.fromCurrency || 'N/A'} {selectedTransaction.fromAmount.toFixed(2) || 'N/A'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">To Amount</TableCell>
                    <TableCell>
                      {selectedTransaction.toCurrency || 'N/A'} {selectedTransaction.toAmount.toFixed(2) || 'N/A'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Exchange Rate</TableCell>
                    <TableCell>
                      1 {selectedTransaction.fromCurrency || 'N/A'} = {selectedTransaction.exchangeRate.toFixed(4) || 'N/A'}{" "}
                      {selectedTransaction.toCurrency || 'N/A'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Payment Method</TableCell>
                    <TableCell>{selectedTransaction.paymentMethod || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Account</TableCell>
                    <TableCell>{selectedTransaction.account || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    <TableCell>{selectedTransaction.status || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Invoice ID</TableCell>
                    <TableCell>{selectedTransaction.invoiceId || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Notes</TableCell>
                    <TableCell>{selectedTransaction.notes || "No notes provided"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleOpenEditModal(selectedTransaction)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleOpenDeleteAlert(selectedTransaction)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Transaction Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the details of the transaction below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-transactionId">Transaction ID * (unique Id)</Label>
                <Input
                  id="edit-transactionId"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Type * </Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-financialDate">Financial Date * </Label>
                <Input
                  type="date"
                  id="edit-financialDate"
                  name="financialDate"
                  value={formData.financialDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status * </Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Currency Conversion Section */}
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-4">Currency Conversion</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-fromAmount">From Amount *</Label>
                  <Input
                    type="number"
                    id="edit-fromAmount"
                    name="fromAmount"
                    value={formData.fromAmount}
                    onChange={handleAmountChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-fromCurrency">From Currency * </Label>
                  {isLoadingCurrencies ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={formData.fromCurrency}
                      onValueChange={(value) => handleCurrencyChange("fromCurrency", value)}
                      required
                    >
                      <SelectTrigger id="edit-fromCurrency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-toAmount">To Amount</Label>
                  <Input
                    type="number"
                    id="edit-toAmount"
                    name="toAmount"
                    value={formData.toAmount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-toCurrency">To Currency</Label>
                  {isLoadingCurrencies ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={formData.toCurrency}
                      onValueChange={(value) => handleCurrencyChange("toCurrency", value)}
                      required
                    >
                      <SelectTrigger id="edit-toCurrency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-exchangeRate">Exchange Rate</Label>
                <div className="relative">
                  <Input
                    id="edit-exchangeRate"
                    name="exchangeRate"
                    value={formData.exchangeRate}
                    onChange={handleInputChange}
                    disabled
                  />
                  {isCalculatingRate && (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  1 {formData.fromCurrency} = {formData.exchangeRate || "?"} {formData.toCurrency}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentMethod">Payment Method * </Label>
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
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-account">Account</Label>
                <Input
                  id="edit-account"
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}

                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-invoiceId">Invoice ID</Label>
              <Input id="edit-invoiceId" name="invoiceId" value={formData.invoiceId} onChange={handleInputChange} />
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
      {selectedTransaction && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the transaction record for "{selectedTransaction.transactionId}". This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTransaction} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

export default FinancialTransactions