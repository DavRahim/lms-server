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
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailRegexPatten = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        index: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value) {
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
        enum: ["male", "woman"]
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
}, { timestamps: true });
// Hash password before saving
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        this.password = yield bcrypt_1.default.hash(this.password, 10);
        next();
    });
});
// compare password
userSchema.methods.isPasswordCorrect = function (enterPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(enterPassword, this.password);
    });
};
// jwt
// generateAccessToken
userSchema.methods.generateAccessToken = function () {
    return jsonwebtoken_1.default.sign({
        id: this._id,
        email: this.email,
        name: this.name
    }, process.env.ACCESS_TOKEN_SECRET || "", { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};
userSchema.methods.generateRefreshToken = function () {
    return jsonwebtoken_1.default.sign({
        id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET || "", { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};
exports.UserModel = mongoose_1.default.model("user", userSchema);
