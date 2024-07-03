import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { CourseModel } from "../models/course.model";
import { ApiResponse } from "../utils/ApiResponse";
import cloudinary from "cloudinary";



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

