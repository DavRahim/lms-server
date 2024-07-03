import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken"
import { UserModel } from "../models/user.model";


export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");
        console.log(req.cookies);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload

        const user = await UserModel.findById(decodedToken?.id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access token")
        }

        req.user = user

        next()
    } catch (error) {
        throw new ApiError(500, error || "Invalid Access Error")
    }
})





