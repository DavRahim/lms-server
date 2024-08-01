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
exports.updateUserAvatar = exports.updateAccountDetails = exports.getCurrentUser = exports.changeCurrentPassword = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.createActivationToken = exports.registerUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const user_model_1 = require("../models/user.model");
const ApiResponse_1 = require("../utils/ApiResponse");
const cloudinary_1 = require("../utils/cloudinary");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const generateAccessAndRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.UserModel.findById(userId);
        const accessToken = user === null || user === void 0 ? void 0 : user.generateAccessToken();
        const refreshToken = user === null || user === void 0 ? void 0 : user.generateRefreshToken();
        if (user) {
            user.refreshToken = refreshToken;
        }
        yield (user === null || user === void 0 ? void 0 : user.save({ validateBeforeSave: false }));
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Something went wrong while generate refresh and access token");
    }
});
exports.registerUser = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // get user details from frontend
    // validation - not empty
    // check if user already exist: username, email
    // check for image, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token filed from response
    // check for user creation 
    // return res
    var _a;
    try {
        const { name, email, password, gender, phonNumber, discordUsername, address } = req.body;
        if ([name, email, password, gender, phonNumber, discordUsername, address].some((field) => (field === null || field === void 0 ? void 0 : field.trim()) === "")) {
            throw new ApiError_1.ApiError(400, "All fields are required");
        }
        const isEmailExist = yield user_model_1.UserModel.findOne({
            $or: [{ email }, { phonNumber }]
        });
        if (isEmailExist) {
            throw new ApiError_1.ApiError(409, "Email and Phone Number already exit !");
        }
        // console.log(req);
        const avatarLocalPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        // console.log(avatarLocalPath);
        if (!avatarLocalPath) {
            throw new ApiError_1.ApiError(400, "avatarLocalPath file is required");
        }
        ;
        const avatar = yield (0, cloudinary_1.uploadOnCloudinary)(avatarLocalPath, 150);
        if (!avatar) {
            throw new ApiError_1.ApiError(400, "Avatar file is required");
        }
        ;
        // new code
        const user = {
            name,
            email,
            password,
            gender,
            phonNumber,
            discordUsername,
            address,
            avatar: {
                public_id: avatar.public_id,
                url: avatar.secure_url
            }
        };
        const activationToken = (0, exports.createActivationToken)(user);
        const activationCode = activationToken.activationCode;
        const data = {
            user: {
                name: user.name,
            },
            activationCode,
        };
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/activation-mail.ejs"), data);
        try {
            yield (0, sendMail_1.default)({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            });
            return res.status(200).json(new ApiResponse_1.ApiResponse(200, { activationToken: activationToken.token }, `Please check your email: ${user.email} to activate your account`));
        }
        catch (error) {
            throw new ApiError_1.ApiError(500, error);
        }
        // new code end
        // const user = await UserModel.create({
        //     name,
        //     email,
        //     password,
        //     gender,
        //     phonNumber,
        //     discordUsername,
        //     address,
        //     avatar: {
        //         public_id: avatar.public_id,
        //         url: avatar.secure_url
        //     }
        // })
        // const createdUser = await UserModel.findById(user._id).select("-password")
        // if (!createdUser) {
        //     throw new ApiError(500, "some this wrong")
        // }
        // return res.status(200).json(
        //     new ApiResponse(200, createdUser, "User register successfully")
        // )
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, error);
    }
}));
const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({
        user,
        activationCode,
    }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
    return { token, activationCode };
};
exports.createActivationToken = createActivationToken;
exports.activateUser = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activation_code, activation_token } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET);
        if (newUser.activationCode !== activation_code) {
            throw new ApiError_1.ApiError(400, "Invalid activation code");
        }
        const { name, email, password, gender, phonNumber, discordUsername, address, avatar: { public_id, url } } = newUser.user;
        const existUser = yield user_model_1.UserModel.findOne({ email });
        if (existUser) {
            throw new ApiError_1.ApiError(400, "Email already exit !");
        }
        const user = yield user_model_1.UserModel.create({
            name,
            email,
            password,
            gender,
            phonNumber,
            discordUsername,
            address,
            avatar: {
                public_id,
                url
            }
        });
        const createdUser = yield user_model_1.UserModel.findById(user._id).select("-password");
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, createdUser, "User register successfully"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, error);
    }
}));
exports.loginUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // req body -> data
    // username or email
    // find the user 
    // password
    // access and refresh token
    // send 
    const { email, password } = req.body;
    if (!email && !password) {
        throw new ApiError_1.ApiError(400, "email or password is required");
    }
    const user = yield user_model_1.UserModel.findOne({ email });
    if (!user) {
        throw new ApiError_1.ApiError(404, "User dose not exist");
    }
    const isPasswordValid = yield user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError_1.ApiError(401, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = yield generateAccessAndRefreshToken(user._id);
    const loggedInUser = yield user_model_1.UserModel.findById(user._id).select("-password -refreshToken");
    const tokenOptions = {
        httpOnly: true,
        secure: true
    };
    return res.status(200)
        .cookie("accessToken", accessToken, tokenOptions)
        .cookie("refreshToken", refreshToken, tokenOptions)
        .json(new ApiResponse_1.ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
    }, "User logged In successfully"));
}));
exports.logoutUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield user_model_1.UserModel.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    });
    const tokenOptions = {
        httpOnly: true,
        secure: true
    };
    return res
        .status(200)
        .clearCookie("accessToken", tokenOptions)
        .clearCookie("refreshToken", tokenOptions)
        .json(new ApiResponse_1.ApiResponse(200, {}, "User logged Ou successfully!"));
}));
exports.refreshAccessToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError_1.ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.UserModel.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id);
        if (!user) {
            throw new ApiError_1.ApiError(401, "Invalid refresh token");
        }
        if (incomingRefreshToken !== (user === null || user === void 0 ? void 0 : user.refreshToken)) {
            throw new ApiError_1.ApiError(401, "Refresh token is expired or used");
        }
        const tokenOptions = {
            httpOnly: true,
            secure: true
        };
        const { accessToken, refreshToken: newRefreshToken } = yield generateAccessAndRefreshToken(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, tokenOptions)
            .cookie("refreshToken", newRefreshToken, tokenOptions)
            .json(new ApiResponse_1.ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(401, error || "Invalid refresh token");
    }
}));
;
exports.changeCurrentPassword = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            throw new ApiError_1.ApiError(400, "Please enter your old & new password");
        }
        const user = yield user_model_1.UserModel.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const isPasswordCorrect = yield (user === null || user === void 0 ? void 0 : user.isPasswordCorrect(oldPassword));
        if (!isPasswordCorrect) {
            throw new ApiError_1.ApiError(400, "Invalid old password");
        }
        ;
        if (user)
            user.password = newPassword;
        if (user)
            yield user.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Password change successfully"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, error || "change password error");
    }
}));
exports.getCurrentUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, req.user, "current user fetched successfully"));
}));
;
exports.updateAccountDetails = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { discordUsername, address } = req.body;
        if (!discordUsername || !address) {
            throw new ApiError_1.ApiError(400, "Minium one field are required!");
        }
        const user = yield user_model_1.UserModel.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, {
            $set: {
                discordUsername: discordUsername,
                address: address
            }
        }, { new: true }).select("-password");
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, user, "Account details update successfully"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, error || "update account details error");
    }
}));
exports.updateUserAvatar = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const avatarLocalPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        if (!avatarLocalPath) {
            throw new ApiError_1.ApiError(400, "Avatar file is missing!!");
        }
        const avatar = yield (0, cloudinary_1.uploadOnCloudinary)(avatarLocalPath, 150);
        if (!(avatar === null || avatar === void 0 ? void 0 : avatar.public_id) && (avatar === null || avatar === void 0 ? void 0 : avatar.secure_url)) {
            throw new ApiError_1.ApiError(400, "Error while uploading on avatar");
        }
        const user = yield user_model_1.UserModel.findByIdAndUpdate((_b = req.user) === null || _b === void 0 ? void 0 : _b.id, {
            $set: {
                avatar: {
                    public_id: avatar === null || avatar === void 0 ? void 0 : avatar.public_id,
                    url: avatar === null || avatar === void 0 ? void 0 : avatar.secure_url
                }
            }
        }, { new: true }).select("-password");
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, user, "avatar update successfully"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, error || "avatar update error");
    }
}));
