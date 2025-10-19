import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Invoice } from "../models/invoices.model.js";




const createInvoice = asyncHandler(async (req, res) => {
    const {
        invoiceNumber,
        dateOfIssue,
        dueDate,
        customerName,
        billingAddress,
        products,
        subtotal,
        discount,
        taxRate,
        shippingCost,
        totalAmount,
        status,
        notes,
    } = req.body;


    if (
        [
            invoiceNumber,
            dateOfIssue,
            dueDate,
            customerName,
            billingAddress,
            subtotal,
            taxRate,
            totalAmount,
            status,
        ].some((field) => field === undefined || field === null || String(field).trim() === "") ||
        !products || !Array.isArray(products) ||
        products.some((product) => !product.productId || !product.productName || !product.sellingPrice || !product.productMongodbId || !product.quantity)
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const invoiceNumberIsUnique = await Invoice.findOne({ invoiceNumber, userId: req.user._id  })

    if (invoiceNumberIsUnique) {
        throw new ApiError(401, "invoice number must be unique")
    }

    const invoice = await Invoice.create({
        invoiceNumber,
        dateOfIssue,
        dueDate,
        customerName,
        billingAddress,
        products,
        subtotal,
        discount,
        taxRate,
        shippingCost,
        totalAmount,
        status,
        notes,
        userId: req.user._id,
    });

    if (!invoice) {
        throw new ApiError(500, "Something went wrong while creating invoice");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { invoice }, "invoice added successfully"));
});

const getAllInvoice = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const AllInvoices = await Invoice.find({ userId }).populate("products", "_id productId productName sellingPrice quantity");

    return res
        .status(200)
        .json(
            new ApiResponse(200, { AllInvoices }, "Fetched all Invoice successfully")
        );
});

const deleteInvoice = asyncHandler(async (req, res) => {
    const invoiceMongodbId = req.params.invoiceMongodbId;

    const invoice = await Invoice.findByIdAndDelete(invoiceMongodbId);

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }


    return res
        .status(200)
        .json(new ApiResponse(200, invoice, "Invoice deleted successfully"));
});

const updateInvoice = asyncHandler(async (req, res) => {
    const invoiceDocsId = req.params.invoiceMongodbId;

    const {
        invoiceNumber,
        dateOfIssue,
        dueDate,
        customerName,
        billingAddress,
        products,
        subtotal,
        discount,
        taxRate,
        shippingCost,
        totalAmount,
        status,
        notes,
    } = req.body;


    if (
        [
            invoiceNumber,
            dateOfIssue,
            dueDate,
            customerName,
            billingAddress,
            subtotal,
            taxRate,
            totalAmount,
            status,
        ].some((field) => field === undefined || field === null || String(field).trim() === "") ||
        !products || !Array.isArray(products) ||
        products.some((product) => !product.productId || !product.productName || !product.sellingPrice || !product.productMongodbId || !product.quantity)
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const updateInvoice = await Invoice.findByIdAndUpdate(
        invoiceDocsId,
        {
            $set: {
                invoiceNumber,
                dateOfIssue,
                dueDate,
                customerName,
                billingAddress,
                products,
                subtotal,
                discount,
                taxRate,
                shippingCost,
                totalAmount,
                status,
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
                { updateInvoice },
                "Invoice data are updated successfully"
            )
        );
});


export {
    createInvoice,
    getAllInvoice,
    deleteInvoice,
    updateInvoice,
};
