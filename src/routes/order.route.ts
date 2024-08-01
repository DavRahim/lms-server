import express from "express";
import { authorizeRole, verifyJWT } from "../middlewares/auth.middleware";
import { createOrder, getAllOrders, getUserOrders, newPayment, sendStripePublishableKey } from "../controllers/order.controller";


const orderRouter = express.Router();

orderRouter.route("/create-order").post(verifyJWT, createOrder);
orderRouter.route("/payment/stripepublishablekey").get(sendStripePublishableKey);
orderRouter.route("/payment").post(verifyJWT, newPayment);
orderRouter.route("/user-orders").get(verifyJWT, getUserOrders);

// admin route
orderRouter.route("/get-orders").get(verifyJWT, authorizeRole("admin"), getAllOrders);



export default orderRouter



