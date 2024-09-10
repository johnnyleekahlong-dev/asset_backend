import { Router } from "express";
import accessoriesController from "../controllers/accessories.js";

const router = Router();

router
  .route("/")
  .get(accessoriesController.getAccessories)
  .post(accessoriesController.createAccessories);

router
  .route("/:id")
  .get(accessoriesController.getAccessoriesById)
  .put(accessoriesController.updateAccessories);

export default router;
