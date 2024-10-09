import express from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import { signUpAction } from "../controllers/authController.js";
import { signUpSchema } from "../utils/schema.js";

const authRoutes = express.Router();

authRoutes.post("/sign-up", validateRequest(signUpSchema), signUpAction);
export default authRoutes;
