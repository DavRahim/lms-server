import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv"
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { IOrder } from "../models/order.model";
import { UserModel } from "../models/user.model";
import { CourseModel, ICourse } from "../models/course.model";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
dotenv.config({
    path: './.env'
})
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)



export const createOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { courseId, payment_info } = req.body as IOrder;

        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentIntentId
                )
                if (paymentIntent.status !== "succeeded") {
                    throw new ApiError(400, "Payment not authorized")
                }
            }
        }

        // check user already parched course
        const user = await UserModel.findById(req.user?._id);
        const courseExistInUser = user?.courses.some(
            (course: any) => course._id.toString() === courseId
        );
        if (courseExistInUser){
            throw new ApiError(400, "You Have already purchased this course")
        };

        // check course
        const course: ICourse | null = await CourseModel.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found")
        }

        // make data and save 
        const data: any = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        };

        //mail the user email
        const mailData = {
            order: {
                _id: course?._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        const html = await ejs.renderFile(
            path.join(__dirname, "../mails/order-confirmation.ejs"),
            { order: mailData }
        );
        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: "Order confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        } catch (error: any) {
            throw new ApiError(400, "course parched email not send")
        }
        
        user?.courses.push(course?._id.toString());
        
        await user?.save();

    } catch (error) {
        throw new ApiError(400, "createOrder error")
    }
})


