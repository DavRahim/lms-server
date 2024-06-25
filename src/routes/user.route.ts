import express from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller";
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

// secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/refresh-token").post(verifyJWT, refreshAccessToken)

export default userRouter;