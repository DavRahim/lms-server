import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


export const uploadOnCloudinary = async (localFilePath: any) => {
    try {
        if (!localFilePath) return null
        //   upload the file cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been upload successfuly 
        console.log("file is uploaded on cloudinary", response.url);
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally got failed

        return null
    }
}

