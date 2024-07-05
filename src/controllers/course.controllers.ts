import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { CourseModel } from "../models/course.model";
import { ApiResponse } from "../utils/ApiResponse";
import cloudinary from "cloudinary";
import mongoose from "mongoose";



// create course
export const uploadCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnailPath = req.file?.path;
        if (thumbnailPath) {
            const thumbnail = await uploadOnCloudinary(thumbnailPath, 1080)
            if (thumbnail) {
                data.thumbnail = {
                    public_id: thumbnail.public_id,
                    url: thumbnail.secure_url,
                };
            }
        };


        const course = await CourseModel.create(data);
        return res.status(200).json(
            new ApiResponse(200, course, "Course created successfully")
        )
    } catch (error: any) {
        throw new ApiError(400, error?.message || "course create error")

    }
})


// edit course;

export const editCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const thumbnailPath = req.file?.path;

        const courseData = await CourseModel.findById(courseId) as any;


        if (thumbnailPath && !thumbnail?.startsWith("https")) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);
            const thumbnails = await uploadOnCloudinary(thumbnailPath, 1080)
            courseData.thumbnail = {
                public_id: thumbnails?.public_id,
                url: thumbnails?.url
            }
        }

        if (thumbnail?.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData.public_id,
                url: courseData.url,
            };

        }
        const course = await CourseModel.findByIdAndUpdate(
            courseId,
            {
                $set: data,
            },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, course, "Course update successfully;")
        )


    } catch (error: any) {
        throw new ApiError(400, error?.message || "course update error")
    }
})


// get single course ----> without purchasing;

export const getSingleCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        const course = await CourseModel.findById(courseId).select(
            "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        return res.status(200).json(
            new ApiResponse(200, course, "Single Data fetch successfully")
        )
    } catch (error: any) {
        throw new ApiError(400, "Get single course data error with out purchasing;")
    }
})


// get all course ----> without purchasing

export const getAllCourses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const courses = await CourseModel.find().select(
            "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        return res.status(200).json(
            new ApiResponse(200, courses, "Get All Courses Data fetch")
        )

    } catch (error: any) {
        throw new ApiError(400, "Get All courses with out purchasing;")

    }

})



// add question in course
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: IAddQuestionData = req.body;

        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            throw new ApiError(400, "Invalid content id")
        }

        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId))

        if (!courseContent) {
            throw new ApiError(400, "Invalid content id")
        }

        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        }

        // add this question to our course content
        courseContent.questions.push(newQuestion);

        // TODO: notification add

        // save the update course;
        await course?.save();

        return res.status(200).json(new ApiResponse(200, course, "New question add"))
    } catch (error) {
        throw new ApiError(500, "Add Question error")
    }

})


// add answer is course question;
interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;
        const course = await CourseModel.findById(courseId);
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            throw new ApiError(400, "Invalid content id")
        }

        const courseContent = course?.courseData?.find((item: any) =>
            item._id.equals(contentId)
        );

        if (!courseContent) {
            throw new ApiError(400, "Invalid content id")
        }

        const question = courseContent?.questions?.find((item: any) =>
            item._id.equals(questionId)
        );

        if (!question) {
            throw new ApiError(400, "Invalid question id")
        }

        //  create a new answer object
        const newAnswer: any = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        question.questionReplies?.push(newAnswer);

        // save database
        await course?.save();

        // TODO: notification add

        return res.status(200).json(new ApiResponse(200, course))
    } catch (error) {
        throw new ApiError(500, "add answer error")
    }
})


// add review in course
interface IAddReviewData {
    review: string;
    courseId: string;
    rating: number;
    userId: string;
}

export const addReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCorseList = req.user?.courses;
        const courseId = req.params.id;

        // check if courseId already exit in userCourse base an _id;
        const courseExits = userCorseList?.some(
            (course: any) => course._id.toString() === courseId.toString()
        );


        if (!courseExits) {
            throw new ApiError(404, "you are not eligible to access this course")
        }
        const course = await CourseModel.findById(courseId);
        const { review, rating } = req.body as IAddReviewData;

        const reviewData: any = {
            user: req.user,
            comment: review,
            rating,
        };

        course?.reviews.push(reviewData);

        // average calculation
        let avg = 0;
        course?.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.rating = avg / course.reviews.length; //are example we have 2 review and 5 another and is 4 so math working like this = 9 / 2 = 4.5 rating
        }

        // save the course 
        await course?.save();

        // TODO: Notification add

        return res.status(200).json(new ApiResponse(200, course, "Add review done"))
    } catch (error) {
        throw new ApiError(500, "Add Review Done")
    }
})


// add reply in review
interface IAddReviewData {
    comment: string;
    courseId: string;
    reviewId: string;
}

export const addReplyToReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, courseId, reviewId } = req.body as IAddReviewData;
        const course = await CourseModel.findById(courseId);

        if (!course) {
            throw new ApiError(400, "course not found")
        }

        const review = course.reviews?.find(
            (rev: any) => rev._id.toString() === reviewId
        );

        if (!review) {
            throw new ApiError(404, "Review not found")
        }

        const replyData: any = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (review.commentReplies) {
            review.commentReplies = [];
        }

        review.commentReplies?.push(replyData);

        await course?.save();

        return res.status(200).json(new ApiResponse(200, course, "Add Reply to review done"))


    } catch (error) {
        throw new ApiError(500, "Add Reply To Review error")
    }
})


// get all course --- only for admin
export const getAdminAllCourses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courses = await CourseModel.find().sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, courses, "Admin all courses fetch success"))
    } catch (error) {
        throw new ApiError(500, "Get admin all courses error")
    }
})


// Deleted course ---> only for admin
export const deletedCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const course = await CourseModel.findById(id);

        if (!course) {
            throw new ApiError(400, "Course not found")
        }

        // course to database deleted
        await course.deleteOne({ id });

        return res.status(200).json(new ApiResponse(200, "course deleted successfully"))
    } catch (error) {
        throw new ApiError(500, "Deleted course error")
    }
})

