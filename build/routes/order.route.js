"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const order_controller_1 = require("../controllers/order.controller");
const orderRouter = express_1.default.Router();
orderRouter.route("/create-order").post(auth_middleware_1.verifyJWT, order_controller_1.createOrder);
orderRouter.route("/payment/stripepublishablekey").get(order_controller_1.sendStripePublishableKey);
orderRouter.route("/payment").post(auth_middleware_1.verifyJWT, order_controller_1.newPayment);
orderRouter.route("/user-orders").get(auth_middleware_1.verifyJWT, order_controller_1.getUserOrders);
// admin route
orderRouter.route("/get-orders").get(auth_middleware_1.verifyJWT, (0, auth_middleware_1.authorizeRole)("admin"), order_controller_1.getAllOrders);
exports.default = orderRouter;
