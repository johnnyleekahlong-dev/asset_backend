import { Router } from "express";
import transactionsController from "../controllers/transactions.js";

const router = Router({ mergeParams: true });

router.route("/").get(transactionsController.getTransactions);

export default router;
