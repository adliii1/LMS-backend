import express from "express";
import {
  deleteContentCourse,
  deleteCourse,
  deleteStudentByCourseId,
  getCategories,
  getCourse,
  getCourseById,
  getCourseDetailById,
  getStudentByCourseId,
  postContentCourse,
  postCourse,
  postStudentByCourseId,
  updateContentCourse,
  updateCourse,
} from "../controllers/courseController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  addStudentCourseSchema,
  mutateContentSchema,
} from "../utils/schema.js";

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

courseRoute.post(
  "/courses/contents",
  verifyToken,
  validateRequest(mutateContentSchema),
  postContentCourse
);
courseRoute.put(
  "/courses/contents/:id",
  verifyToken,
  validateRequest(mutateContentSchema),
  updateContentCourse
);
courseRoute.delete("/courses/contents/:id", verifyToken, deleteContentCourse);
courseRoute.get("/courses/contents/:id", verifyToken, getCourseDetailById);

courseRoute.get("/courses/students/:id", verifyToken, getStudentByCourseId);
courseRoute.post(
  "/courses/students/:id",
  verifyToken,
  validateRequest(addStudentCourseSchema),
  postStudentByCourseId
);
courseRoute.put(
  "/courses/students/:id",
  verifyToken,
  validateRequest(addStudentCourseSchema),
  deleteStudentByCourseId
);

export default courseRoute;
