import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { createDeliveryProductItem, deleteDeliveryProduct, getAllDeliveryProduct, getOneDeliveryProduct, updateDeliveryProductDetails } from "../controllers/deliveries.controller.js"

const router = Router();


router.route("/create-delivery").post(verifyJWT, createDeliveryProductItem);
router.route("/get-all-delivery").get(verifyJWT, getAllDeliveryProduct);
router.route("/get-one-delivery/:deliveryMongodbId").get(verifyJWT, getOneDeliveryProduct);
router.route("/update-delivery/:deliveryMongodbId").patch(verifyJWT, updateDeliveryProductDetails);
router.route("/delete-delivery/:deliveryMongodbId").delete(verifyJWT, deleteDeliveryProduct);

export default router;
