import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/products.model.js";




const createProductItem = asyncHandler(async (req, res) => {

  console.log("Incoming request body:", req.body);


  const {
    productId,
    productName,
    category,
    description,
    quantity,
    expirationDate,
    costPrice,
    sellingPrice,
    notes,
    dateAdded,
    warehouse,
    status,
    supplierName,
  } = req.body;

  if (
    [
      productId,
      productName,
      quantity,
      costPrice,
      sellingPrice,
      status
    ].some((field) => !field?.trim())
  ) {
    throw new ApiError(401, "All fields are required");
  }

  const productIdIsUnique = await Product.findOne({ productId })

  if (productIdIsUnique) {
    throw new ApiError(401, "Product Id must be unique")
  }

  let productImageCloudinary = null;
  if (req.file) {
    const productImageLocalPath = req.file.path;
    productImageCloudinary = await uploadOnCloudinary(productImageLocalPath);
    if (!productImageCloudinary) {
      throw new ApiError(500, "Error uploading image");
    }
  }


  const product = await Product.create({
    productId,
    productName,
    category,
    description,
    quantity,
    expirationDate,
    costPrice,
    sellingPrice,
    notes,
    dateAdded,
    warehouse,
    status,
    supplierName,
    productImage: productImageCloudinary ? productImageCloudinary.url : "",
    userId: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, { product }, "Product added successfully"));
});


const getAllProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const AllProducts = await Product.find({ userId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { AllProducts }, "fetch all products successfully")
    );
});

const getOneProduct = asyncHandler(async (req, res) => {
  const productMongodbId = req.params.productMongodbId;

  const product = await Product.findById(productMongodbId);

  if (!product) {
    throw new ApiError(404, "product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "fetch one product successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const productMongodbId = req.params.productMongodbId;

  const product = await Product.findByIdAndDelete(productMongodbId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }


  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

const updateProductImage = asyncHandler(async (req, res) => {
  const productImageLocalPath = req.file?.path;
  const productMongodbId = req.params.productMongodbId;

  if (!productImageLocalPath) {
    throw new ApiError(403, "profile Pic is required");
  }

  const cloudinaryProductImage = await uploadOnCloudinary(
    productImageLocalPath
  );

  if (!cloudinaryProductImage) {
    throw new ApiError(403, "something want wrong while upload profile Pic");
  }

  const product = await Product.findById(productMongodbId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  console.log(cloudinaryProductImage);
  console.log(cloudinaryProductImage.url);

  const productImage = await Product.findByIdAndUpdate(
    productMongodbId,
    {
      $set: {
        ProductImage: cloudinaryProductImage.url,
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
        { productImage },
        "product image is update successfully"
      )
    );
});

const updateProductDetails = asyncHandler(async (req, res) => {
  const productDocsId = req.params.productMongodbId;

  const {
    productId,
    productName,
    category,
    description,
    quantity,
    expirationDate,
    costPrice,
    sellingPrice,
    notes,
    dateAdded,
    warehouse,
    status,
    supplierName,
  } = req.body;


  console.table([productId,
    productName,
    category,
    description,
    quantity,
    expirationDate,
    costPrice,
    sellingPrice,
    notes,
    dateAdded,
    warehouse,
    status,
    supplierName,]);


  // Ensure at least one field is provided for update
  if (
    [
      productId,
      productName,
      category,
      costPrice,
      sellingPrice,
      status
    ].every((field) => field === undefined || field === null || field.trim() === "")
  ) {
    throw new ApiError(403, "At least one field is required to update");
  }


  // Handle image upload
  let productImageCloudinary = null;
  if (req.file) {
    const productImageLocalPath = req.file.path;
    productImageCloudinary = await uploadOnCloudinary(productImageLocalPath);
    if (!productImageCloudinary) {
      throw new ApiError(500, "Error uploading image");
    }
  }

  let oldProductImage = await Product.findById(productDocsId);

  // Construct update object dynamically
  const updateFields = {
    productId,
    productName,
    category,
    description,
    quantity,
    expirationDate,
    costPrice,
    sellingPrice,
    notes,
    dateAdded,
    warehouse,
    status,
    supplierName,
    productImage: productImageCloudinary && productImageCloudinary.url
      ? productImageCloudinary.url // Use new image if uploaded
      : oldProductImage.productImage, // Otherwise, keep the existing image
  };

  if (productImageCloudinary) {
    updateFields.productImage = productImageCloudinary.url;
  }

  const updateProduct = await Product.findByIdAndUpdate(
    productDocsId,
    { $set: updateFields },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updateProduct },
        "Product data updated successfully"
      )
    );
});


export {
  createProductItem,
  getAllProduct,
  getOneProduct,
  deleteProduct,
  updateProductDetails,
  updateProductImage,
};
