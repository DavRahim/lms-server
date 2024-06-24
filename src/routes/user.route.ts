import express from "express";
import { registerUser } from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";

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


export default userRouter;