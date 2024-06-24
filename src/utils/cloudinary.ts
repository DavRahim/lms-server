import dotenv from "dotenv"
import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
dotenv.config({
    path: './.env'
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


export const uploadOnCloudinary = async (localFilePath: any, proWidth:number ) => {
    try {
        if (!localFilePath) return null
        //   upload the file cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            width: proWidth || 150
        })
        // file has been upload successfully 
        // console.log("file is uploaded on cloudinary", response);
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally got failed
        return null
    }
}

