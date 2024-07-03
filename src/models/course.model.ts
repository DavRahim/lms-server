import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";


//  comment schema

interface IComment extends Document {
    user: IUser;
    question: string;
    questionReplies?: IComment[]
}

const commentSchema = new Schema<IComment>({
    user: Object,
    question: String,
    questionReplies: [Object]
}, { timestamps: true });


// Review schema

interface IReview extends Document {
    user: IUser;
    rating: number;
    comment: string;
    commentReplies?: IComment[]
}

const reviewSchema = new Schema<IReview>({
    user: Object,
    rating: {
        type: Number,
        default: 0
    },
    comment: String,
    commentReplies: [Object]
}, { timestamps: true })



// link schema

interface ILink extends Document {
    title: string;
    url: string;
}

const linkSchema = new Schema<ILink>({
    title: String,
    url: String,
});

// course data schema

interface ICourseData extends Document {
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail: object;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: ILink[];
    suggestion: string;
    questions: IComment[];
}

const courseDataSchema = new Schema<ICourseData>({
    title: String,
    description: String,
    videoUrl: String,
    // videoThumbnail: Object,
    videoSection: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema]
})

// course

export interface ICourse extends Document {
    name: string;
    description: string;
    categories: string;
    price: number;
    estimatePrice?: number;
    thumbnail: object;
    tags: string;
    level: string;
    demoUrl: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    reviews: IReview[];
    courseData: ICourseData[];
    rating?: number;
    purchased: number;
}

const courseSchema = new Schema<ICourse>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    categories: {
        type: String,
        // required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatePrice: {
        type: Number,
    },
    thumbnail: {
        public_id: {
            type: String,
            // required: true,
        },
        url: {
            type: String,
            // required: true,
        },
    },
    tags: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    demoUrl: {
        type: String,
        required: true,
    },
    benefits: [
        {
            title: String,
        },
    ],
    prerequisites: [
        {
            title: String,
        },
    ],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    rating: {
        type: Number,
        default: 0
    },
    purchased: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema)


