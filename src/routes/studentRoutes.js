import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { getStudents, postStudent } from "../controllers/studentController.js";
import multer from "multer";
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

export default studentRoutes;
