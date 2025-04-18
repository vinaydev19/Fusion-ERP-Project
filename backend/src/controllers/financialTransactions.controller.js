import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Financial } from "../models/financialTransactions.model.js";

const createFinancialItem = asyncHandler(async (req, res) => {
    const {
        transactionId,
        type,
        financialDate,
        fromAmount,
        fromCurrency,
        toAmount,
        toCurrency,
        exchangeRate,
        description,
        paymentMethod,
        account,
        notes,
        status,
        invoiceId,
    } = req.body;

    if (
        [
            transactionId,
            type,
            financialDate,
            fromAmount,
            fromCurrency,
            paymentMethod,
            status,
        ].some((field) => field === undefined || field === null || String(field).trim() === "")
    ) {
        throw new ApiError(401, "All fields are required");
    }


    const transactionIdIsUnique = await Financial.findOne({ transactionId })

    if (transactionIdIsUnique) {
        throw new ApiError(401, "Transaction Id must be unique")
    }

    const financial = await Financial.create({
        transactionId,
        type,
        financialDate,
        fromAmount,
        fromCurrency,
        toAmount,
        toCurrency,
        exchangeRate,
        description,
        paymentMethod,
        account,
        notes,
        status,
        invoiceId,
        userId: req.user._id,
    });

    if (!financial) {
        throw new ApiError(500, "something want wrong while create financial");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { financial }, "financial add successfully"));
});

const getAllFinancial = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const AllFinancials = await Financial.find({ userId });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { AllFinancials }, "fetch all financials successfully")
        );
});

const getOneFinancial = asyncHandler(async (req, res) => {
    const financialMongodbId = req.params.financialMongodbId;

    const financial = await Financial.findById(financialMongodbId);

    if (!financial) {
        throw new ApiError(401, "financial not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { financial }, "fetch one financial successfully"));
});

const deleteFinancial = asyncHandler(async (req, res) => {
    const financialMongodbId = req.params.financialMongodbId;

    const financial = await Financial.findByIdAndDelete(financialMongodbId);

    console.log(financial);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Financial record deleted successfully"));
});

const updateFinancialDetails = asyncHandler(async (req, res) => {
    const financialDocsId = req.params.financialMongodbId;
    const {
        transactionId,
        type,
        financialDate,
        fromAmount,
        fromCurrency,
        toAmount,
        toCurrency,
        exchangeRate,
        description,
        paymentMethod,
        account,
        notes,
        status,
        invoiceId,
    } = req.body;

    if (
        [
            transactionId,
            type,
            financialDate,
            fromAmount,
            fromCurrency,
            paymentMethod,
            status,
        ].every(
            (field) => field === undefined || field === null || field.trim() === ""
        )
    ) {
        throw new ApiError(403, "At least one field is required to update");
    }

    const updateFinancial = await Financial.findByIdAndUpdate(
        financialDocsId,
        {
            $set: {
                transactionId,
                type,
                financialDate,
                fromAmount,
                fromCurrency,
                toAmount,
                toCurrency,
                exchangeRate,
                description,
                paymentMethod,
                account,
                notes,
                status,
                invoiceId,
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
                { updateFinancial },
                "financial data are updated successfully"
            )
        );
});

export {
    createFinancialItem,
    getAllFinancial,
    getOneFinancial,
    deleteFinancial,
    updateFinancialDetails
};
