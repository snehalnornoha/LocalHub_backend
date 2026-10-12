import cloudinary from "../configs/cloudinary.js";

export const uploadToCloudinary = (buffer) => {
   console.log("->" , "iam in uploat0 cloudinary")
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {},
            (error, result) => {

                if (error) {
                    console.log("CLOUDINARY UPLOAD ERROR:");
                    console.log(error);
                    reject(error);
                    return;
                }

                console.log("CLOUDINARY UPLOAD SUCCESS:");
                console.log(result.secure_url);

                resolve(result.secure_url);
            }
        );

        stream.end(buffer);
    });
};


export const deleteFromCloudinary = async (imageUrl) => {
    if(imageUrl.trim() === ""){return {success :true }}
    try {
        const url = new URL(imageUrl);

        const parts = url.pathname.split("/");

        // Last part = wnwi3ilzz1ydxirnod3c.png
        const fileName = parts[parts.length - 1];

        // Remove extension
        const publicId = fileName.replace(/\.[^/.]+$/, "");

        console.log("Public ID:", publicId);

        const result = await cloudinary.uploader.destroy(publicId);

        console.log("Delete result:", result);

        return {success :true };

    } catch (err) {
        console.error("Cloudinary delete error:", err);
        return {success :false }
    }
};
export default uploadToCloudinary;