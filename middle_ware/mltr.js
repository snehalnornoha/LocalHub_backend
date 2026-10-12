
import multer  from "multer";

const  image_store = multer.memoryStorage()
console.log("hi iam in multer")
const upload = multer({
  storage:image_store,
  limits: {
    fileSize: 20 * 1024 * 1024, // 2 MB
  },
});

export default upload;