import express from "express";
import {
  deleteCourse,
  getCategories,
  getCourse,
  getCourseById,
  postCourse,
  updateCourse,
} from "../controllers/courseController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

import multer from "multer";
import { fileFilter, fileStorageCourse } from "../utils/multer.js";

const courseRoute = express.Router();
const upload = multer({
  storage: fileStorageCourse,
  fileFilter,
});

courseRoute.get("/courses", verifyToken, getCourse);
courseRoute.get("/categories", verifyToken, getCategories);
courseRoute.get("/courses/:id", verifyToken, getCourseById);
courseRoute.post(
  "/courses",
  verifyToken,
  upload.single("thumbnail"),
  postCourse
);
courseRoute.put(
  "/courses/:id",
  verifyToken,
  upload.single("thumbnail"),
  updateCourse
);
courseRoute.delete("/courses/:id", verifyToken, deleteCourse);

export default courseRoute;
