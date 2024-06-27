import express from "express";
import { activateUser, changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar } from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const userRouter = express.Router();


userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
)

userRouter.route("/login").post(loginUser)
userRouter.route("/active-user").post(activateUser)

// secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/refresh-token").post(verifyJWT, refreshAccessToken)

userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT, getCurrentUser)
userRouter.route("/update-user").patch(verifyJWT, updateAccountDetails)

userRouter.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

export default userRouter;