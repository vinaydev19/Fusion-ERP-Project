import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Customer } from "../models/customer.model.js";


const createCustomerItem = asyncHandler(async (req, res) => {

    const {
        customerId,
        fullName,
        email,
        phoneNumber,
        address,
        purchaseHistory,
        notes,
    } = req.body;


    if (
        [
            customerId,
            fullName,
            email,
            phoneNumber,
            address,
            notes
        ].some((field) => !field || field.trim() === "") ||
        !purchaseHistory || !Array.isArray(purchaseHistory) ||
        purchaseHistory.some(item => !item.saleId || !item.saleItem || !item.salesDate || item.totalAmount === undefined)
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const customerIdIsUnique = await Customer.findOne({ customerId })

    if (customerIdIsUnique) {
        throw new ApiError(401, "Customer Id must be unique")
    }


    const customer = await Customer.create({
        customerId,
        fullName,
        email,
        phoneNumber,
        address,
        purchaseHistory,
        notes,
        userId: req.user._id,
    });

    if (!customer) {
        throw new ApiError(500, "Something went wrong while creating customer");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { customer }, "Customer added successfully"));
});

const getAllCustomer = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const AllCustomers = await Customer.find({ userId }).populate({
        path: "purchaseHistory",
        select: "saleId saleItem salesDate totalAmount",
        populate: {
            path: "saleItem",
            select: "productName" // Select the fields you want from saleItem
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { AllCustomers }, "Fetched all customers successfully")
        );
});

const getOneCustomer = asyncHandler(async (req, res) => {
    const customerMongodbId = req.params.customerMongodbId;

    const customer = await Customer.findById(customerMongodbId);

    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { customer }, "Fetch one customer successfully"));
});

const deleteCustomer = asyncHandler(async (req, res) => {
    const customerMongodbId = req.params.customerMongodbId;

    const customer = await Customer.findByIdAndDelete(customerMongodbId);

    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { customer }, "Customer deleted successfully"));
});

const updateCustomerDetails = asyncHandler(async (req, res) => {
    const customerDocsId = req.params.customerMongodbId;
    const {
        customerId,
        fullName,
        email,
        phoneNumber,
        address,
        purchaseHistory,
        notes,
    } = req.body;


    if (
        [
            customerId,
            fullName,
            email,
            phoneNumber,
            address,
            notes
        ].some((field) => !field || field.trim() === "") ||
        !purchaseHistory || !Array.isArray(purchaseHistory) ||
        purchaseHistory.some(item => !item.saleId || !item.saleItem || !item.salesDate || item.totalAmount === undefined)
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }


    const updateCustomer = await Customer.findByIdAndUpdate(
        customerDocsId,
        {
            $set: {
                customerId,
                fullName,
                email,
                phoneNumber,
                address,
                purchaseHistory,
                notes,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { updateCustomer },
                "Customer data updated successfully"
            )
        );
});

export {
    createCustomerItem,
    getAllCustomer,
    getOneCustomer,
    deleteCustomer,
    updateCustomerDetails
};
