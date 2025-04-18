import {
  userRegister,
  userVerification,
  userLogin,
  userLogout,
  emailVerification,
  resetPasswordEmailVerfication,
  resetPassword,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  profilePicUpdate,
  updateUserAccountDetails,
  emailChangeConfirmation,
  emailChangeVerification,
  getOtherUsers,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("profilePic"), userRegister); // done
router.route("/verify-user").post(userVerification); // done
router.route("/login").post(userLogin); // done
router.route("/verify-email").post(emailVerification);
router
  .route("/reset-password-email-verfication")
  .post(resetPasswordEmailVerfication); // done
router.route("/reset-password").post(resetPassword); // done

//secured routes
router.route("/logout").post(verifyJWT, userLogout); // done
router.route("/change-password").post(verifyJWT, changeCurrentPassword); // done
router.route("/refresh-token").post(verifyJWT, refreshAccessToken); // done
router.route("/get-current-user").get(verifyJWT, getCurrentUser); // done
router
  .route("/update-account-details")
  .patch(verifyJWT, updateUserAccountDetails); // done
router
  .route("/update-email-address-verification")
  .post(verifyJWT, emailChangeVerification); // done
router
  .route("/update-email-address-confirmation")
  .post(verifyJWT, emailChangeConfirmation); // done
router
  .route("/update-profilepic")
  .patch(verifyJWT, upload.single("profilePic"), profilePicUpdate); // done

router.route('/other-users').get(verifyJWT, getOtherUsers)

export default router;
