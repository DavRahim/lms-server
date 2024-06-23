
import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";


export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    res.status(200).json({
        success: true,
        message: "Please check your email"
    })


})




