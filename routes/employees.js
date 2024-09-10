import employeesController from "../controllers/employees.js";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .get(employeesController.getEmployees)
  .post(employeesController.createEmployee);

router
  .route("/:id")
  .get(employeesController.getEmployee)
  .put(employeesController.updateEmployee)
  .delete(employeesController.deleteEmployee);

router
  .route("/accessories/:id")
  .put(employeesController.updateEmployeeAccessories);

export default router;
