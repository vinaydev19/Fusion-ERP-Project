import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { createFinancialItem, deleteFinancial, getAllFinancial, getOneFinancial, updateFinancialDetails } from "../controllers/financialTransactions.controller.js"

const router = Router();


router.route("/create-financial").post(verifyJWT, createFinancialItem);
router.route("/get-all-financial").get(verifyJWT, getAllFinancial);
router.route("/get-one-financial/:financialMongodbId").get(verifyJWT, getOneFinancial);
router.route("/update-financial/:financialMongodbId").patch(verifyJWT, updateFinancialDetails);
router.route("/delete-financial/:financialMongodbId").delete(verifyJWT, deleteFinancial);

export default router;
