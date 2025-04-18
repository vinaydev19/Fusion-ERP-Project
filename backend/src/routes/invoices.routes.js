import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { createInvoice, deleteInvoice, downloadInvoice, getAllInvoice, updateInvoice } from "../controllers/invoices.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();


router.route("/create-invoice").post(verifyJWT, createInvoice);
router.route("/get-all-invoice").get(verifyJWT, getAllInvoice);
router.route("/update-invoice/:invoiceMongodbId").patch(verifyJWT, updateInvoice);
router.route("/delete-invoice/:invoiceMongodbId").delete(verifyJWT, deleteInvoice);
router.route("/download/:invoiceMongodbId").get(verifyJWT, downloadInvoice)


export default router;
