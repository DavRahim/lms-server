"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPayment = exports.sendStripePublishableKey = exports.getAllOrders = exports.getUserOrders = exports.createOrder = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const order_model_1 = require("../models/order.model");
const user_model_1 = require("../models/user.model");
const course_model_1 = require("../models/course.model");
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const ApiResponse_1 = require("../utils/ApiResponse");
dotenv_1.default.config({
    path: './.env'
});
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.createOrder = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId, payment_info } = req.body;
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== "succeeded") {
                    throw new ApiError_1.ApiError(400, "Payment not authorized");
                }
            }
        }
        // check user already parched course
        const user = yield user_model_1.UserModel.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        const courseExistInUser = user === null || user === void 0 ? void 0 : user.courses.some((course) => course._id.toString() === courseId);
        if (courseExistInUser) {
            throw new ApiError_1.ApiError(400, "You Have already purchased this course");
        }
        ;
        // check course
        const course = yield course_model_1.CourseModel.findById(courseId);
        if (!course) {
            throw new ApiError_1.ApiError(404, "Course not found");
        }
        // make data and save 
        const data = {
            courseId: course._id,
            courseName: course.name,
            userId: user === null || user === void 0 ? void 0 : user._id,
            payment_info,
        };
        //mail the user email
        const mailData = {
            order: {
                _id: course === null || course === void 0 ? void 0 : course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData });
        try {
            if (user) {
                yield (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            throw new ApiError_1.ApiError(400, "course parched email not send");
        }
        // user db save
        user === null || user === void 0 ? void 0 : user.courses.push(course === null || course === void 0 ? void 0 : course._id.toString());
        yield (user === null || user === void 0 ? void 0 : user.save());
        // TODO: create notification
        // course db add 1
        course.purchased = course.purchased + 1;
        yield course.save();
        const order = yield order_model_1.OrderModel.create(data);
        return res.status(201).json(new ApiResponse_1.ApiResponse(201, order, "order success"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, error);
    }
}));
// get order for user
exports.getUserOrders = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const orders = yield order_model_1.OrderModel.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, orders, "Single user Order fetch successfully!"));
}));
// get all orders --- only for admin
exports.getAllOrders = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.OrderModel.find().sort({ createdAt: -1 });
    return res.status(201).json(new ApiResponse_1.ApiResponse(201, orders, "Admin order fetch success"));
}));
//send strip publishable key payment
exports.sendStripePublishableKey = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({
        publishablekey: process.env.STRIPE_PUBLISHABLE_KEY
    });
}));
// new payment
exports.newPayment = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myPayment = yield stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "USD",
            metadata: {
                company: "E-Learning"
            },
            automatic_payment_methods: {
                enabled: true
            }
        });
        return res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret
        });
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "new payment error");
    }
}));
