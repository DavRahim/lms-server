import express from "express";
import { editCourse, getAllCourses, getSingleCourse, uploadCourse } from "../controllers/course.controllers";
import { upload } from "../middlewares/multer.middleware";

const courseRouter = express.Router();
courseRouter.route('/create-course').post(upload.single("thumbnail"), uploadCourse);
courseRouter.route("/edit-course/:id").put(upload.single("thumbnail"), editCourse);
courseRouter.route("/get-course/:id").get(getSingleCourse);
courseRouter.route("/get-courses").get(getAllCourses)

export default courseRouter;