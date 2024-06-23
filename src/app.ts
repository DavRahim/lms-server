import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())




// routes import
import userRouter from './routes/user.route';



// routes declaration 
app.use("/api/v1/users", userRouter)



// http://localhost:8000/api/v1/users/register

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "Api is working",
    });
});

export { app }