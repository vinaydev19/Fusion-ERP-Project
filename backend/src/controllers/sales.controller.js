import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Sale } from "../models/sales.model.js";

const createSaleItem = asyncHandler(async (req, res) => {

    const {
        saleId,
        saleItem,
        sellingPrice,
        quantity,
        totalAmount,
        paymentStatus,
        invoice,
        notes,
        salesDate,
        customerName,
    } = req.body;


    if (
        [saleId, paymentStatus].some(field => typeof field === "string" && field.trim() === "") ||
        [saleItem, sellingPrice, quantity, totalAmount, salesDate].some(field => field === undefined || field === null)
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const saleIdIsUnique = await Sale.findOne({ saleId })

    if (saleIdIsUnique) {
        throw new ApiError(401, "sale Id must be unique")
    }



    const sale = await Sale.create({
        saleId,
        saleItem,
        sellingPrice,
        quantity,
        totalAmount,
        paymentStatus,
        invoice,
        notes,
        salesDate,
        customerName,
        userId: req.user._id,
    });

    if (!sale) {
        throw new ApiError(500, "Something went wrong while creating sale");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { sale }, "Sale added successfully"));
});

const getAllSale = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const AllSales = await Sale.find({ userId }).populate("saleItem", "productId productName productImage sellingPrice");

    return res
        .status(200)
        .json(
            new ApiResponse(200, { AllSales }, "Fetched all sales successfully")
        );
});

const getOneSale = asyncHandler(async (req, res) => {
    const saleMongodbId = req.params.saleMongodbId;

    const sale = await Sale.findById(saleMongodbId);

    if (!sale) {
        throw new ApiError(404, "Sale not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { sale }, "Fetched one sale successfully"));
});

const deleteSale = asyncHandler(async (req, res) => {
    const saleMongodbId = req.params.saleMongodbId;

    const sale = await Sale.findByIdAndDelete(saleMongodbId);

    if (!sale) {
        throw new ApiError(404, "Sale not found");
    }


    return res
        .status(200)
        .json(new ApiResponse(200, sale, "Sale deleted successfully"));
});

const updateSaleDetails = asyncHandler(async (req, res) => {
    const saleDocsId = req.params.saleMongodbId;
    const {
        saleId,
        saleItem,
        sellingPrice,
        quantity,
        totalAmount,
        paymentStatus,
        invoice,
        notes,
        salesDate,
        customerName,
    } = req.body;


    console.table([saleId,
        saleItem,
        sellingPrice,
        quantity,
        totalAmount,
        paymentStatus,
        invoice,
        notes,
        salesDate,
        customerName,])

    if (
        [saleId, paymentStatus, customerName, notes, invoice].every(
            field => field === undefined || field === null || (typeof field === "string" && field.trim() === "")
        ) &&
        [saleItem, sellingPrice, quantity, totalAmount, salesDate].every(
            field => field === undefined || field === null
        )
    ) {
        throw new ApiError(403, "At least one field is required to update");
    }


    const updateSale = await Sale.findByIdAndUpdate(
        saleDocsId,
        {
            $set: {
                saleId,
                saleItem,
                sellingPrice,
                quantity,
                totalAmount,
                paymentStatus,
                invoice,
                notes,
                salesDate,
                customerName,
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
                { updateSale },
                "Sale data updated successfully"
            )
        );
});

export {
    createSaleItem,
    getAllSale,
    getOneSale,
    deleteSale,
    updateSaleDetails
};
