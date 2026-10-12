import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name :process.env.Cloudinary_cloud_Name,
     api_key: process.env.Cloudinary_cloud_key,
     api_secret :process.env.Cloudinary_cloud_secret,
})

export default cloudinary;