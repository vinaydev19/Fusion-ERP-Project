import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createProductItem,
  getAllProduct,
  getOneProduct,
  deleteProduct,
  updateProductImage,
  updateProductDetails,
} from "../controllers/products.controller.js";

const router = Router();


router
  .route("/create-product")
  .post(verifyJWT, upload.single("productImage"), createProductItem);
router.route("/get-all-product").get(verifyJWT, getAllProduct);
router
  .route("/get-one-product/:productMongodbId")
  .get(verifyJWT, getOneProduct);
router
  .route("/update-product/:productMongodbId")
  .patch(verifyJWT, upload.single("productImage"), updateProductDetails);
router
  .route("/delete-product/:productMongodbId")
  .delete(verifyJWT, deleteProduct);
router
  .route("/update-product-image/:productMongodbId")
  .patch(verifyJWT, upload.single("productImage"), updateProductImage);
export default router;
