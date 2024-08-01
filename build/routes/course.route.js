"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_controllers_1 = require("../controllers/course.controllers");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const courseRouter = express_1.default.Router();
// admin route
// TODO: admin check backend
courseRouter.route('/create-course').post(multer_middleware_1.upload.single("thumbnail"), auth_middleware_1.verifyJWT, (0, auth_middleware_1.authorizeRole)("admin"), course_controllers_1.uploadCourse);
courseRouter.route("/edit-course/:id").put(multer_middleware_1.upload.single("thumbnail"), auth_middleware_1.verifyJWT, (0, auth_middleware_1.authorizeRole)("admin"), course_controllers_1.editCourse);
// public route
courseRouter.route("/get-course/:id").get(course_controllers_1.getSingleCourse);
courseRouter.route("/get-courses").get(course_controllers_1.getAllCourses);
// verifyJWT || verify user access only
courseRouter.route("/get-course-content/:id").get(auth_middleware_1.verifyJWT, course_controllers_1.getCourseByUser);
courseRouter.route("/add-question").put(auth_middleware_1.verifyJWT, course_controllers_1.addQuestion);
courseRouter.route("/add-answer").put(auth_middleware_1.verifyJWT, course_controllers_1.addAnswer);
courseRouter.route("/add-review/:id").put(auth_middleware_1.verifyJWT, course_controllers_1.addReview);
// TODO: admin authorize 
courseRouter.route("/add-reply").put(auth_middleware_1.verifyJWT, course_controllers_1.addReplyToReview);
courseRouter.route("/get-admin-Courses").get(auth_middleware_1.verifyJWT, course_controllers_1.getAdminAllCourses);
courseRouter.route("/deleted-course/:id").delete(auth_middleware_1.verifyJWT, (0, auth_middleware_1.authorizeRole)("admin"), course_controllers_1.deletedCourse);
exports.default = courseRouter;
