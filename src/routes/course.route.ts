import express from "express";
import { addAnswer, addQuestion, addReplyToReview, addReview, editCourse, getAdminAllCourses, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controllers";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const courseRouter = express.Router();
// admin route
// TODO: admin check backend
courseRouter.route('/create-course').post(upload.single("thumbnail"), verifyJWT, uploadCourse);
courseRouter.route("/edit-course/:id").put(upload.single("thumbnail"), verifyJWT, editCourse);

// public route
courseRouter.route("/get-course/:id").get(getSingleCourse);
courseRouter.route("/get-courses").get(getAllCourses);

// verifyJWT || verify user access only
courseRouter.route("/get-course-content/:id").get(verifyJWT, getCourseByUser);
courseRouter.route("/add-question").put(verifyJWT, addQuestion);
courseRouter.route("/add-answer").put(verifyJWT, addAnswer);
courseRouter.route("/add-review/:id").put(verifyJWT, addReview);
// TODO: admin authorize 
courseRouter.route("/add-reply").put(verifyJWT, addReplyToReview)
courseRouter.route("/get-admin-Courses").get(verifyJWT, getAdminAllCourses)

export default courseRouter;