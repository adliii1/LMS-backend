import multer from "multer";

export const fileStorageCourse = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/uploads/courses");
  },
  filename: (req, file, callback) => {
    const extension = file.mimetype.split(".")[1];
    const uniqeId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${file.fieldname}-${uniqeId}.${extension}`);
  },
});

export const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};