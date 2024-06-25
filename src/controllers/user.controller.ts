
import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { IUser, UserModel } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";
import jwt, { JwtPayload } from "jsonwebtoken"

interface MulterRequest extends Request {
    files: any;
}

const generateAccessAndRefreshToken = async (userId: any) => {
    try {

        const user = await UserModel.findById(userId)
        const accessToken = user?.generateAccessToken()
        const refreshToken = user?.generateRefreshToken()

        if (user) {
            user.refreshToken = refreshToken as string
        }
        await user?.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generate refresh and access token")
    }
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

        const isEmailExist = await UserModel.findOne({
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


        const user = await UserModel.create({
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

        const createdUser = await UserModel.findById(user._id).select("-password")

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

// login user
interface ILoginRequest {
    email: string;
    password: string;
}

interface ITokenOptions {
    httpOnly: boolean;
    secure?: boolean;
}


export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    // req body -> data
    // username or email
    // find the user 
    // password
    // access and refresh token
    // send 

    const { email, password } = req.body as ILoginRequest;

    if (!email && !password) {
        throw new ApiError(400, "email or password is required")
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User dose not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken");

    const tokenOptions: ITokenOptions = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, tokenOptions)
        .cookie("refreshToken", refreshToken, tokenOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In successfully"
            )
        )

})

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {

    await UserModel.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const tokenOptions: ITokenOptions = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", tokenOptions)
        .clearCookie("refreshToken", tokenOptions)
        .json(new ApiResponse(200, {}, "User logged Ou successfully!"))

})

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {

    const incomingRefreshToken = req.cookies.refreshToken as string || req.body.refreshToken as string;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as JwtPayload

        const user = await UserModel.findById(decodedToken?.id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }


        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const tokenOptions: ITokenOptions = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        console.log(accessToken);
        return res
            .status(200)
            .cookie("accessToken", accessToken, tokenOptions)
            .cookie("refreshToken", newRefreshToken, tokenOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error || "Invalid refresh token")
    }

})





