import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { createEmployeeItem, deleteEmployee, getAllEmployee, updateEmployeeDetails } from "../controllers/employees.controller.js"

const router = Router();


router.route("/create-employee").post(verifyJWT, createEmployeeItem);
router.route("/get-all-employee").get(verifyJWT, getAllEmployee);
router.route("/update-employee/:employeeMongodbId").patch(verifyJWT, updateEmployeeDetails);
router.route("/delete-employee/:employeeMongodbId").delete(verifyJWT, deleteEmployee);

export default router;
