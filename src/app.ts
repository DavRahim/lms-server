import dotenv from "dotenv"
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config({
    path: './.env'
})

const app = express();



app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())




// routes import
import userRouter from './routes/user.route';
import courseRouter from './routes/course.route';
import orderRouter from "./routes/order.route";



// routes declaration 
app.use("/api/v1/users", userRouter)
app.use("/api/v1/course", courseRouter)
app.use("/api/v1/order", orderRouter)

// http://localhost:8000/api/v1/users/register

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "Api is working",
    });
});

export { app }