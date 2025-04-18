import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { createSaleItem, deleteSale, getAllSale, getOneSale, updateSaleDetails } from "../controllers/sales.controller.js"

const router = Router();


router.route("/create-sale").post(verifyJWT, createSaleItem);
router.route("/get-all-sale").get(verifyJWT, getAllSale);
router.route("/get-one-sale/:saleMongodbId").get(verifyJWT, getOneSale);
router.route("/update-sale/:saleMongodbId").patch(verifyJWT, updateSaleDetails);
router.route("/delete-sale/:saleMongodbId").delete(verifyJWT, deleteSale);

export default router;
