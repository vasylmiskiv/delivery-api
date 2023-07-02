import { GlobalMiddleWare } from "./../middlewares/GlobalMiddleWare";
import { UserValidators } from "./../validators/UserValidators";
import { UserController } from "./../controllers/UserController";
import { Router } from "express";
import { Utils } from "../utils/Utils";

class UserRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.patchRoutes();
    this.putRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
    this.router.get(
      "/send/verification/email",
      GlobalMiddleWare.auth,
      UserController.resendVerificationEmail
    );
    this.router.get(
      "/login",
      UserValidators.login(),
      GlobalMiddleWare.checkError,
      UserController.login
    );
    this.router.get(
      "/send/reset/password/token",
      UserValidators.checkResetPasswordEmail(),
      GlobalMiddleWare.checkError,
      UserController.sendResetPasswordOtp
    );
    this.router.get(
      "/verify/resetPasswordToken",
      UserValidators.verifyResetPasswordToken(),
      GlobalMiddleWare.checkError,
      UserController.verifyResetPasswordToken
    );
    this.router.get("/profile", GlobalMiddleWare.auth, UserController.profile);
  }

  postRoutes() {
    this.router.post(
      "/signup",
      UserValidators.signup(),
      GlobalMiddleWare.checkError,
      UserController.signup
    );
    this.router.post(
      "/refresh_token",
      GlobalMiddleWare.decodeRefreshToken,
      UserController.getNewTokens
    );
    this.router.post(
      "/logout",
      GlobalMiddleWare.auth,
      GlobalMiddleWare.decodeRefreshToken,
      UserController.logout
    );
  }

  patchRoutes() {
    this.router.patch(
      "/reset/password",
      UserValidators.resetPassword(),
      GlobalMiddleWare.checkError,
      UserController.resetPassword
    );
    this.router.patch(
      "/verify/emailToken",
      GlobalMiddleWare.auth,
      UserValidators.verifyUserEmailToken(),
      GlobalMiddleWare.checkError,
      UserController.verifyUserEmailToken
    );
    this.router.patch(
      "/update/phone",
      GlobalMiddleWare.auth,
      UserValidators.verifyPhoneNumber(),
      GlobalMiddleWare.checkError,
      UserController.updatePhoneNumber
    );
    this.router.patch(
      "/update/profile",
      GlobalMiddleWare.auth,
      UserValidators.verifyUserProfile(),
      GlobalMiddleWare.checkError,
      UserController.updateUserProfile
    );
  }

  putRoutes() {
    this.router.put(
      "/update/profilePic",
      GlobalMiddleWare.auth,
      new Utils().multer.single("profileImages"),
      UserValidators.userProfilePic(),
      GlobalMiddleWare.checkError,
      UserController.updateUserProfilePic
    );
  }

  deleteRoutes() {}
}

export default new UserRouter().router;
