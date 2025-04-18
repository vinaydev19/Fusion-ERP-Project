import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Delivery } from "../models/deliveries.model.js";


const createDeliveryProductItem = asyncHandler(async (req, res) => {

    const {
        deliveryId,
        orderNumber,
        customerName,
        customerContact,
        deliveryAddress,
        products,
        deliveryMethod,
        trackingNumber,
        courierDetails,
        paymentStatus,
        paymentMethod,
        notes,
        totalPrice,
    } = req.body;

    console.log("req", req.body);



    if (
        [
            deliveryId,
            orderNumber,
            customerName,
            customerContact,
            deliveryAddress,
            deliveryMethod,
            paymentStatus,
            paymentMethod,
            totalPrice,
        ].some((field) => field === undefined || field === null || String(field).trim() === "") ||
        !products || !Array.isArray(products) ||
        products.some((product) => !product.productId || !product.productName || !product.productImage || !product.sellingPrice || !product.productMongodbId || !product.quantity)
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const deliveryIdIsUnique = await Delivery.findOne({ deliveryId })

    if (deliveryIdIsUnique) {
        throw new ApiError(401, "Delivery Id must be unique")
    }

    


    const orderNumberIsUnique = await Delivery.findOne({ orderNumber })

    if (orderNumberIsUnique) {
        throw new ApiError(401, "Order Number must be unique")
    }

    const delivery = await Delivery.create({
        deliveryId,
        orderNumber,
        customerName,
        customerContact,
        deliveryAddress,
        products,
        deliveryMethod,
        trackingNumber,
        courierDetails,
        paymentStatus,
        paymentMethod,
        notes,
        totalPrice,
        userId: req.user._id,
    });

    if (!delivery) {
        throw new ApiError(500, "Something went wrong while creating delivery");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { delivery }, "Delivery added successfully"));
});

const getAllDeliveryProduct = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const AllDeliverys = await Delivery.find({ userId }).populate("products", "_id productId productName productImage sellingPrice quantity");

    return res
        .status(200)
        .json(
            new ApiResponse(200, { AllDeliverys }, "Fetched all deliveries successfully")
        );
});

const getOneDeliveryProduct = asyncHandler(async (req, res) => {
    const deliveryMongodbId = req.params.deliveryMongodbId;

    const delivery = await Delivery.findById(deliveryMongodbId);

    if (!delivery) {
        throw new ApiError(404, "Delivery not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { delivery }, "Fetched one delivery successfully"));
});

const deleteDeliveryProduct = asyncHandler(async (req, res) => {
    const deliveryMongodbId = req.params.deliveryMongodbId;

    const delivery = await Delivery.findByIdAndDelete(deliveryMongodbId);

    if (!delivery) {
        throw new ApiError(404, "Delivery not found");
    }


    return res
        .status(200)
        .json(new ApiResponse(200, delivery, "Delivery deleted successfully"));
});

const updateDeliveryProductDetails = asyncHandler(async (req, res) => {
    const deliveryDocsId = req.params.deliveryMongodbId;
    const {
        deliveryId,
        orderNumber,
        customerName,
        customerContact,
        deliveryAddress,
        products,
        deliveryMethod,
        trackingNumber,
        courierDetails,
        paymentStatus,
        paymentMethod,
        notes,
        totalPrice,
    } = req.body;

    if (
        [
            deliveryId,
            orderNumber,
            customerName,
            customerContact,
            deliveryAddress,
            deliveryMethod,
            paymentStatus,
            paymentMethod,
            totalPrice,
        ].some((field) => field === undefined || field === null || String(field).trim() === "") ||
        !products || !Array.isArray(products) ||
        products.some((product) => !product.productId || !product.productName || !product.productImage || !product.sellingPrice)
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }


    const updateDelivery = await Delivery.findByIdAndUpdate(
        deliveryDocsId,
        {
            $set: {
                deliveryId,
                orderNumber,
                customerName,
                customerContact,
                deliveryAddress,
                products,
                deliveryMethod,
                trackingNumber,
                courierDetails,
                paymentStatus,
                paymentMethod,
                notes,
                totalPrice,
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
                { updateDelivery },
                "Delivery data are updated successfully"
            )
        );
});

export {
    createDeliveryProductItem,
    getAllDeliveryProduct,
    getOneDeliveryProduct,
    deleteDeliveryProduct,
    updateDeliveryProductDetails,
};
