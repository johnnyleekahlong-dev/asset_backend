import { Router } from "express";
import usersController from "../controllers/user.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import roleList from "../config/rolesList.js";

const router = Router();

router
  .route("/")
  .post(verifyRoles(roleList.Admin), usersController.createUser)
  .get(usersController.getUsers)
  .put(verifyRoles(roleList.Admin), usersController.resetOtherPassword);

router.route("/email/:email").get(usersController.fetchUserByEmail);

router
  .route("/:id")
  .get(usersController.getUser)
  .put(
    verifyRoles(roleList.Admin, roleList.User),
    usersController.changePassword
  )
  .delete(verifyRoles(roleList.Admin), usersController.deleteUser);

export default router;
