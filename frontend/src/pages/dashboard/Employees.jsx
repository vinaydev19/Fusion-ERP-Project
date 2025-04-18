import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Search, Plus, Eye, Edit, Trash, Mail, Phone, Briefcase, Building } from "lucide-react"

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
import useGetEmployees from "@/hooks/useGetEmployee"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { EMPLOYEES_API_END_POINT } from "@/utils/constants"
import toast from "react-hot-toast"
import { getRefresh } from "@/redux/employeeSlice"
import Loading from "@/components/commen/Loading"

// Sample employees data
const initialEmployeesData = [
  {
    _id: "e1",
    employeeId: "EMP-001",
    fullName: "John Smith",
    email: "john.smith@example.com",
    phoneNumber: "+1 (555) 123-4567",
    role: "Software Engineer",
    department: "Engineering",
    dateOfJoining: "2021-06-15",
    salary: 85000,
    employmentStatus: "Active",
    address: "123 Main St, Anytown, CA 94538",
    emergencyContact: "Jane Smith, +1 (555) 987-6543, Spouse",
    notes: "Full-stack developer with 5 years of experience",
  },
  {
    _id: "e2",
    employeeId: "EMP-002",
    fullName: "Emily Johnson",
    email: "emily.johnson@example.com",
    phoneNumber: "+1 (555) 234-5678",
    role: "Product Manager",
    department: "Product",
    dateOfJoining: "2020-03-10",
    salary: 95000,
    employmentStatus: "Active",
    address: "456 Oak Ave, Somewhere, NY 10001",
    emergencyContact: "Michael Johnson, +1 (555) 876-5432, Husband",
    notes: "Led the launch of 3 successful products",
  },
  {
    _id: "e3",
    employeeId: "EMP-003",
    fullName: "Michael Williams",
    email: "michael.williams@example.com",
    phoneNumber: "+1 (555) 345-6789",
    role: "UX Designer",
    department: "Design",
    dateOfJoining: "2022-01-05",
    salary: 78000,
    employmentStatus: "On Leave",
    address: "789 Pine St, Elsewhere, TX 75001",
    emergencyContact: "Sarah Williams, +1 (555) 765-4321, Wife",
    notes: "On parental leave until March 2023",
  },
  {
    _id: "e4",
    employeeId: "EMP-004",
    fullName: "Jessica Brown",
    email: "jessica.brown@example.com",
    phoneNumber: "+1 (555) 456-7890",
    role: "Marketing Specialist",
    department: "Marketing",
    dateOfJoining: "2021-09-20",
    salary: 72000,
    employmentStatus: "Active",
    address: "101 Maple Dr, Nowhere, WA 98001",
    emergencyContact: "Robert Brown, +1 (555) 654-3210, Father",
    notes: "Specializes in digital marketing campaigns",
  },
  {
    _id: "e5",
    employeeId: "EMP-005",
    fullName: "David Miller",
    email: "david.miller@example.com",
    phoneNumber: "+1 (555) 567-8901",
    role: "Financial Analyst",
    department: "Finance",
    dateOfJoining: "2020-07-15",
    salary: 88000,
    employmentStatus: "Active",
    address: "202 Cedar Ln, Anywhere, IL 60007",
    emergencyContact: "Lisa Miller, +1 (555) 543-2109, Sister",
    notes: "CPA certified with expertise in financial forecasting",
  },
  {
    _id: "e6",
    employeeId: "EMP-006",
    fullName: "Sarah Davis",
    email: "sarah.davis@example.com",
    phoneNumber: "+1 (555) 678-9012",
    role: "HR Specialist",
    department: "Human Resources",
    dateOfJoining: "2019-11-08",
    salary: 76000,
    employmentStatus: "Terminated",
    address: "303 Birch Rd, Someplace, FL 33101",
    emergencyContact: "James Davis, +1 (555) 432-1098, Brother",
    notes: "Contract terminated on 2023-01-15",
  },
]

function Employees() {
  // State for employees data and search
  const [employeesData, setEmployeesData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  // State for modals
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)


  // Form state for adding/editing employee
  const [formData, setFormData] = useState({
    _id: "",
    employeeId: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    department: "",
    dateOfJoining: "",
    salary: "",
    employmentStatus: "",
    address: "",
    emergencyContact: "",
    notes: "",
  })

  const { allEmployees } = useSelector((store) => store.employee)
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch()

  // Filter employees based on search term
  const filteredEmployees = employeesData.filter((employee) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      employee.employeeId.toLowerCase().includes(searchTermLower) ||
      employee.fullName.toLowerCase().includes(searchTermLower) ||
      employee.email.toLowerCase().includes(searchTermLower) ||
      employee.phoneNumber.toLowerCase().includes(searchTermLower) ||
      employee.role.toLowerCase().includes(searchTermLower) ||
      employee.department.toLowerCase().includes(searchTermLower) ||
      employee.employmentStatus.toLowerCase().includes(searchTermLower)
    )
  })

  // Reset form data
  const resetFormData = () => {
    setFormData({
      _id: "",
      employeeId: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      role: "",
      department: "",
      dateOfJoining: "",
      salary: "",
      employmentStatus: "Active",
      address: "",
      emergencyContact: "",
      notes: "",
    })
  }

  // Open add employee modal
  const handleOpenAddEmployeeModal = () => {
    resetFormData()
    setIsAddEmployeeModalOpen(true)
  }

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }



  // api calling
  useEffect(() => {
    if (allEmployees?.AllEmployees) {
      setEmployeesData(allEmployees.AllEmployees);
    }
  }, [allEmployees]);
  useGetEmployees()




  // Submit new employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newEmployee = {
        employeeId: formData.employeeId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        department: formData.department,
        dateOfJoining: formData.dateOfJoining,
        salary: Number.parseFloat(formData.salary),
        employmentStatus: formData.employmentStatus,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        notes: formData.notes,
      };

      const res = await axios.post(`${EMPLOYEES_API_END_POINT}/create-employee`, newEmployee, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      toast.success(res.data.message);
      dispatch(getRefresh()); // Refresh the employee list
      // Update UI only if the request succeeds
      setEmployeesData((prev) => [...prev, newEmployee]);

      setIsAddEmployeeModalOpen(false);
      resetFormData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.error("Error in handleAddEmployee:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Open view details modal
  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee)
    setIsViewDetailsModalOpen(true)
  }

  // Open edit modal
  const handleOpenEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      ...employee,
      salary: employee.salary.toString(),
      dateOfJoining: format(new Date(employee.dateOfJoining), "yyyy-MM-dd"), // Ensure correct format
    });
    setIsEditModalOpen(true);
  };


  // Submit edit
  const handleEditEmployee = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedEmployee = {
        employeeId: formData.employeeId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        department: formData.department,
        dateOfJoining: formData.dateOfJoining,
        salary: Number.parseFloat(formData.salary),
        employmentStatus: formData.employmentStatus,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        notes: formData.notes,
      };

      // API Call to Update Employee
      const res = await axios.patch(
        `${EMPLOYEES_API_END_POINT}/update-employee/${formData._id}`,
        updatedEmployee,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message || "Employee updated successfully");
      console.log("Updated Employee ID:", formData._id);

      // ✅ Correctly Update UI After Successful API Response
      setEmployeesData((prev) =>
        prev.map((employee) =>
          employee._id === formData._id ? { ...employee, ...updatedEmployee } : employee
        )
      );

      dispatch(getRefresh()); // Refresh employee list from API

      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update employee");
      console.error("Error updating employee:", error);
    } finally {
      setIsLoading(false);
    }
  };



  // Open delete confirmation
  const handleOpenDeleteAlert = (employee) => {
    setSelectedEmployee(employee)
    setIsDeleteAlertOpen(true)
  }

  // Confirm delete
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    setIsLoading(true);
    try {
      const res = await axios.delete(`${EMPLOYEES_API_END_POINT}/delete-employee/${selectedEmployee._id}`, {
        withCredentials: true,
      });

      toast.success(res.data.message || "Employee deleted successfully");
      console.log("id", selectedEmployee._id);

      // Update state only after successful deletion
      setEmployeesData((prev) => prev.filter((employee) => employee._id !== selectedEmployee._id));
      dispatch(getRefresh()); // Refresh the employee list

      setIsDeleteAlertOpen(false);
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
      return format(date, "MMM dd, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Get employment status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Terminated":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Employee Management</h1>

      {/* Search and Add Employee */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search employees by name, email, role, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-end">
          <Button onClick={handleOpenAddEmployeeModal} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Employees Cards Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee._id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{employee.fullName}</CardTitle>
                <Badge className={getStatusBadgeStyle(employee.employmentStatus)}>{employee.employmentStatus}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">ID: {employee.employeeId}</p>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="ml-auto font-medium truncate max-w-[180px]">{employee.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <span className="ml-auto font-medium">{employee.phoneNumber}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <span className="ml-auto font-medium">{employee.role}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Department:</span>
                  <span className="ml-auto font-medium">{employee.department}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee)}>
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(employee)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenDeleteAlert(employee)}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No employees found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Dialog open={isAddEmployeeModalOpen} onOpenChange={setIsAddEmployeeModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Enter the details of the new employee below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="employeeId">Employee ID * (Unique Id)</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name * </Label>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email * </Label>
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
                <Label htmlFor="phoneNumber">Phone Number * </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role * </Label>
                <Input id="role" name="role" value={formData.role} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department * </Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dateOfJoining">Date of Joining * </Label>
                <Input
                  type="date"
                  id="dateOfJoining"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salary">Salary * </Label>
                <Input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employmentStatus">Employment Status * </Label>
              <Select
                value={formData.employmentStatus}
                onValueChange={(value) => handleSelectChange("employmentStatus", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={2}

              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Textarea
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                rows={2}
                placeholder="Name, Phone Number, Relationship"

              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
            </div>

            <DialogFooter>
              {
                isLoading ? (<Button><Loading color="#000" /></Button>) : (<Button type="submit">Add Employee</Button>)
              }
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      {selectedEmployee && (
        <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedEmployee.fullName}</h3>
                <Badge className={getStatusBadgeStyle(selectedEmployee.employmentStatus)}>
                  {selectedEmployee.employmentStatus}
                </Badge>
              </div>

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Employee ID</TableCell>
                    <TableCell>{selectedEmployee.employeeId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Full Name</TableCell>
                    <TableCell>{selectedEmployee.fullName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Email</TableCell>
                    <TableCell>{selectedEmployee.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Phone Number</TableCell>
                    <TableCell>{selectedEmployee.phoneNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Role</TableCell>
                    <TableCell>{selectedEmployee.role}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Department</TableCell>
                    <TableCell>{selectedEmployee.department}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Date of Joining</TableCell>
                    <TableCell>{formatDate(selectedEmployee.dateOfJoining)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Salary</TableCell>
                    <TableCell>${selectedEmployee.salary.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Employment Status</TableCell>
                    <TableCell>{selectedEmployee.employmentStatus}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Address</TableCell>
                    <TableCell>{selectedEmployee.address}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Emergency Contact</TableCell>
                    <TableCell>{selectedEmployee.emergencyContact}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Notes</TableCell>
                    <TableCell>{selectedEmployee.notes || "No notes provided"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleOpenEditModal(selectedEmployee)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleOpenDeleteAlert(selectedEmployee)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Employee Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update the details of the employee below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-employeeId">Employee ID * (unique Id)</Label>
                <Input
                  id="edit-employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-fullName">Full Name * </Label>
                <Input
                  id="edit-fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email * </Label>
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
                <Label htmlFor="edit-phoneNumber">Phone Number * </Label>
                <Input
                  id="edit-phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role * </Label>
                <Input id="edit-role" name="role" value={formData.role} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Department * </Label>
                <Input
                  id="edit-department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-dateOfJoining">Date of Joining * </Label>
                <Input
                  type="date"
                  id="edit-dateOfJoining"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-salary">Salary * </Label>
                <Input
                  type="number"
                  id="edit-salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-employmentStatus">Employment Status * </Label>
              <Select
                value={formData.employmentStatus}
                onValueChange={(value) => handleSelectChange("employmentStatus", value)}
                required
              >
                <SelectTrigger id="edit-employmentStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={2}

              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
              <Textarea
                id="edit-emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                rows={2}
                placeholder="Name, Phone Number, Relationship"

              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea id="edit-notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
            </div>

            <DialogFooter>
              {
                isLoading ? (<Button><Loading color="#000" /></Button>) : (<Button type="submit">Save Changes</Button>)
              }
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      {selectedEmployee && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the employee record for "{selectedEmployee.fullName}" (ID:{" "}
                {selectedEmployee.employeeId}). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEmployee} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

export default Employees