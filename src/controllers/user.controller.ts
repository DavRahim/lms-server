
import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { userModel } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";

interface MulterRequest extends Request {
    files: any;
}

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exist: username, email
    // check for image, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token filed from response
    // check for user creation 
    // return res

    try {
        const { name, email, password, gender, phonNumber, discordUsername, address } = req.body;

        if (
            [name, email, password, gender, phonNumber, discordUsername, address].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }

        const isEmailExist = await userModel.findOne({
            $or: [{ email }, { phonNumber }]
        });
        if (isEmailExist) {
            throw new ApiError(409, "Email and Phone Number already exit !")
        }

        const avatarLocalPath = (req as MulterRequest).files?.avatar[0]?.path;
        console.log(avatarLocalPath);
        if (!avatarLocalPath) {
            throw new ApiError(400, "avatarLocalPath file is required")
        };

        const avatar = await uploadOnCloudinary(avatarLocalPath, 150)
        if (!avatar) {
            throw new ApiError(400, "Avatar file is required")
        };


        const user = await userModel.create({
            name,
            email,
            password,
            gender,
            phonNumber,
            discordUsername,
            address,
            avatar: {
                public_id: avatar.public_id,
                url: avatar.secure_url
            }
        })

        const createdUser = await userModel.findById(user._id).select("-password")

        if (!createdUser) {
            throw new ApiError(500, "some this wrong")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User register successfully")
        )
    } catch (error: any) {
        throw new ApiError(500, error)
    }
})




