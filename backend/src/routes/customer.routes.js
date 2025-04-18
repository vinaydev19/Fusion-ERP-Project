import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { createCustomerItem, deleteCustomer, getAllCustomer, getOneCustomer, updateCustomerDetails } from "../controllers/customer.controller.js"

const router = Router();


router.route("/create-customer").post(verifyJWT, createCustomerItem);
router.route("/get-all-customer").get(verifyJWT, getAllCustomer);
router.route("/get-one-customer/:customerMongodbId").get(verifyJWT, getOneCustomer);
router.route("/update-customer/:customerMongodbId").patch(verifyJWT, updateCustomerDetails);
router.route("/delete-customer/:customerMongodbId").delete(verifyJWT, deleteCustomer);

export default router;