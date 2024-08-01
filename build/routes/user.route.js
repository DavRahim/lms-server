"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const userRouter = express_1.default.Router();
userRouter.route("/register").post(multer_middleware_1.upload.single("avatar"), user_controller_1.registerUser);
userRouter.route("/login").post(user_controller_1.loginUser);
userRouter.route("/active-user").post(user_controller_1.activateUser);
// secured routes
userRouter.route("/logout").post(auth_middleware_1.verifyJWT, user_controller_1.logoutUser);
userRouter.route("/refresh-token").post(auth_middleware_1.verifyJWT, user_controller_1.refreshAccessToken);
userRouter.route("/change-password").post(auth_middleware_1.verifyJWT, user_controller_1.changeCurrentPassword);
userRouter.route("/current-user").get(auth_middleware_1.verifyJWT, user_controller_1.getCurrentUser);
userRouter.route("/update-user").patch(auth_middleware_1.verifyJWT, user_controller_1.updateAccountDetails);
userRouter.route("/update-avatar").patch(auth_middleware_1.verifyJWT, multer_middleware_1.upload.single("avatar"), user_controller_1.updateUserAvatar);
exports.default = userRouter;
