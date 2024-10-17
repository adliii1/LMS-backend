import express from "express";
import multer from "multer";

import { verifyToken } from "../middlewares/verifyToken.js";
import {
  deleteStudent,
  getStudents,
  postStudent,
  updateStudent,
} from "../controllers/studentController.js";
import { fileStorage, fileFilter } from "../utils/multer.js";

const studentRoutes = express.Router();

const upload = multer({
  storage: fileStorage("student"),
  fileFilter,
});

studentRoutes.get("/students", verifyToken, getStudents);
studentRoutes.post(
  "/students",
  verifyToken,
  upload.single("photo"),
  postStudent
);
studentRoutes.put(
  "/students/:id",
  verifyToken,
  upload.single("photo"),
  updateStudent
);
studentRoutes.delete("/students/:id", verifyToken, deleteStudent);

export default studentRoutes;
