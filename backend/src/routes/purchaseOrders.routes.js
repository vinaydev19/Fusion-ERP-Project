import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { createPurchaseItem, deletePurchase, getAllPurchase, updatePurchaseDetails } from "../controllers/purchaseOrders.controller.js"

const router = Router();


router.route("/create-purchase").post(verifyJWT, createPurchaseItem);
router.route("/get-all-purchase").get(verifyJWT, getAllPurchase);
router.route("/update-purchase/:purchaseMongodbId").patch(verifyJWT, updatePurchaseDetails);
router.route("/delete-purchase/:purchaseMongodbId").delete(verifyJWT, deletePurchase);

export default router;
