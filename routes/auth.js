import authController from "../controllers/auth.js";
import { Router } from "express";

const router = Router();

router.route("/login").post(authController.login);
router.route("/register").post(authController.register);
router.route("/refresh").get(authController.refresh);
router.route("/logout").post(authController.logout);

export default router;
