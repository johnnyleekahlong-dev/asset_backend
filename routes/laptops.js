import laptopsController from "../controllers/laptops.js";
import { Router } from "express";
import roleList from "../config/rolesList.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import transactionsRoute from "./transactions.js";

const router = Router();

// re-route to other resource router
router.use("/:id/transactions", transactionsRoute);

router
  .route("/")
  .get(laptopsController.getLaptops)
  .post(
    verifyRoles(roleList.Admin, roleList.Editor),
    laptopsController.addLaptop
  );

router.route("/report").get(laptopsController.getExportedLaptops);
router.route("/in-stock").get(laptopsController.getInStockLaptops);
router.route("/active").get(laptopsController.getActiveLaptops);
router
  .route("/active-but-warranty-expired")
  .get(laptopsController.getActiveButWarrantyExipredLaptops);

router
  .route("/:id")
  .get(laptopsController.getLaptop)
  .put(
    verifyRoles(roleList.Admin, roleList.Editor),
    laptopsController.updateLaptop
  )
  .delete(verifyRoles(roleList.Admin), laptopsController.deleteLaptop);

export default router;
