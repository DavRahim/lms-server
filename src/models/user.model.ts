import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const emailRegexPatten: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string
    };
    gender: string;
    phonNumber: string;
    discordUsername: string;
    address: string;
    role: string;
    isVerified: boolean;
    refreshToken: string;
    courses: Array<{ courseId: string }>;
    isPasswordCorrect: (password: string) => Promise<boolean>;
    generateAccessToken: () => string;
    generateRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter your name"],
            index: true
        },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            validate: {
                validator: function (value: string) {
                    return emailRegexPatten.test(value);
                },
                message: "Please enter a valid email",
            },
        },
        password: {
            type: String,
            // required: [true, "Please enter your password"],  ->social auth not work
            minlength: [6, "Password must be at least 6 characters"],
        },
        gender: {
            type: String,
            required: [true, "Please enter your gender"],
        },
        phonNumber: {
            type: String,
            required: [true, "Please enter your phonNumber"],
        },
        discordUsername: {
            type: String
        },
        address: {
            type: String,
            required: [true, "Please enter your address"],
        },
        avatar: {
            public_id: String,
            url: String,
        },
        role: {
            type: String,
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String
        },
        courses: [
            {
                courseId: String,
            },
        ],
    },
    { timestamps: true }
)

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {

    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next()
});

// compare password
userSchema.methods.isPasswordCorrect = async function (enterPassword: string): Promise<boolean> {
    return await bcrypt.compare(enterPassword, this.password);
}

// jwt
// generateAccessToken
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET || "",
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as string}
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET || "",
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as string}
    )
}


export const UserModel: Model<IUser> = mongoose.model("user", userSchema);