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
exports.deletedCourse = exports.getAdminAllCourses = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCourseByUser = exports.getAllCourses = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const cloudinary_1 = require("../utils/cloudinary");
const course_model_1 = require("../models/course.model");
const ApiResponse_1 = require("../utils/ApiResponse");
const cloudinary_2 = __importDefault(require("cloudinary"));
const mongoose_1 = __importDefault(require("mongoose"));
// create course
exports.uploadCourse = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const data = req.body;
        const thumbnailPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        if (thumbnailPath) {
            const thumbnail = yield (0, cloudinary_1.uploadOnCloudinary)(thumbnailPath, 1080);
            if (thumbnail) {
                data.thumbnail = {
                    public_id: thumbnail.public_id,
                    url: thumbnail.secure_url,
                };
            }
        }
        ;
        const course = yield course_model_1.CourseModel.create(data);
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, course, "Course created successfully"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, (error === null || error === void 0 ? void 0 : error.message) || "course create error");
    }
}));
// edit course;
exports.editCourse = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const thumbnailPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        const courseData = yield course_model_1.CourseModel.findById(courseId);
        if (thumbnailPath && !(thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.startsWith("https"))) {
            yield cloudinary_2.default.v2.uploader.destroy(thumbnail.public_id);
            const thumbnails = yield (0, cloudinary_1.uploadOnCloudinary)(thumbnailPath, 1080);
            courseData.thumbnail = {
                public_id: thumbnails === null || thumbnails === void 0 ? void 0 : thumbnails.public_id,
                url: thumbnails === null || thumbnails === void 0 ? void 0 : thumbnails.url
            };
        }
        if (thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData.public_id,
                url: courseData.url,
            };
        }
        const course = yield course_model_1.CourseModel.findByIdAndUpdate(courseId, {
            $set: data,
        }, { new: true });
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, course, "Course update successfully;"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, (error === null || error === void 0 ? void 0 : error.message) || "course update error");
    }
}));
// get single course ----> without purchasing;
exports.getSingleCourse = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = req.params.id;
        const course = yield course_model_1.CourseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, course, "Single Data fetch successfully"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, "Get single course data error with out purchasing;");
    }
}));
// get all course ----> without purchasing
exports.getAllCourses = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield course_model_1.CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, courses, "Get All Courses Data fetch"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, "Get All courses with out purchasing;");
    }
}));
// get course content  ---> only for valid id
exports.getCourseByUser = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userCourseList = (_a = req.user) === null || _a === void 0 ? void 0 : _a.courses;
        const courseId = req.params.id;
        const courseExist = userCourseList === null || userCourseList === void 0 ? void 0 : userCourseList.find((course) => course._id.toString() === courseId);
        if (!courseExist) {
            throw new ApiError_1.ApiError(400, "You are not eligible to access this course");
        }
        const course = yield course_model_1.CourseModel.findById(courseId);
        const content = course === null || course === void 0 ? void 0 : course.courseData;
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, content));
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, error);
    }
}));
exports.addQuestion = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { question, courseId, contentId } = req.body;
        const course = yield course_model_1.CourseModel.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            throw new ApiError_1.ApiError(400, "Invalid content id");
        }
        const courseContent = (_a = course === null || course === void 0 ? void 0 : course.courseData) === null || _a === void 0 ? void 0 : _a.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            throw new ApiError_1.ApiError(400, "Invalid content id");
        }
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        // add this question to our course content
        courseContent.questions.push(newQuestion);
        // TODO: notification add
        // save the update course;
        yield (course === null || course === void 0 ? void 0 : course.save());
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, course, "New question add"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Add Question error");
    }
}));
exports.addAnswer = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = yield course_model_1.CourseModel.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            throw new ApiError_1.ApiError(400, "Invalid content id");
        }
        const courseContent = (_a = course === null || course === void 0 ? void 0 : course.courseData) === null || _a === void 0 ? void 0 : _a.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            throw new ApiError_1.ApiError(400, "Invalid content id");
        }
        const question = (_b = courseContent === null || courseContent === void 0 ? void 0 : courseContent.questions) === null || _b === void 0 ? void 0 : _b.find((item) => item._id.equals(questionId));
        if (!question) {
            throw new ApiError_1.ApiError(400, "Invalid question id");
        }
        //  create a new answer object
        const newAnswer = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        (_c = question.questionReplies) === null || _c === void 0 ? void 0 : _c.push(newAnswer);
        // save database
        yield (course === null || course === void 0 ? void 0 : course.save());
        // TODO: notification add
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, course));
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "add answer error");
    }
}));
exports.addReview = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userCorseList = (_a = req.user) === null || _a === void 0 ? void 0 : _a.courses;
        const courseId = req.params.id;
        // check if courseId already exit in userCourse base an _id;
        const courseExits = userCorseList === null || userCorseList === void 0 ? void 0 : userCorseList.some((course) => course._id.toString() === courseId.toString());
        if (!courseExits) {
            throw new ApiError_1.ApiError(404, "you are not eligible to access this course");
        }
        const course = yield course_model_1.CourseModel.findById(courseId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            comment: review,
            rating,
        };
        course === null || course === void 0 ? void 0 : course.reviews.push(reviewData);
        // average calculation
        let avg = 0;
        course === null || course === void 0 ? void 0 : course.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.rating = avg / course.reviews.length; //are example we have 2 review and 5 another and is 4 so math working like this = 9 / 2 = 4.5 rating
        }
        // save the course 
        yield (course === null || course === void 0 ? void 0 : course.save());
        // TODO: Notification add
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, course, "Add review done"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Add Review Done");
    }
}));
exports.addReplyToReview = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = yield course_model_1.CourseModel.findById(courseId);
        if (!course) {
            throw new ApiError_1.ApiError(400, "course not found");
        }
        const review = (_a = course.reviews) === null || _a === void 0 ? void 0 : _a.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            throw new ApiError_1.ApiError(404, "Review not found");
        }
        const replyData = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        if (review.commentReplies) {
            review.commentReplies = [];
        }
        (_b = review.commentReplies) === null || _b === void 0 ? void 0 : _b.push(replyData);
        yield (course === null || course === void 0 ? void 0 : course.save());
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, course, "Add Reply to review done"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Add Reply To Review error");
    }
}));
// get all course --- only for admin
exports.getAdminAllCourses = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield course_model_1.CourseModel.find().sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, courses, "Admin all courses fetch success"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Get admin all courses error");
    }
}));
// Deleted course ---> only for admin
exports.deletedCourse = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const course = yield course_model_1.CourseModel.findById(id);
        if (!course) {
            throw new ApiError_1.ApiError(400, "Course not found");
        }
        // course to database deleted
        yield course.deleteOne({ id });
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, "course deleted successfully"));
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Deleted course error");
    }
}));
