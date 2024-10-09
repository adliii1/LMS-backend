import express from "express";
import { helloWorld } from "../controllers/globalController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { exampleSchema } from "../utils/schema.js";

const globalRoute = express.Router();

globalRoute.post(
  "/validate-request",
  validateRequest(exampleSchema),
  async (req, res) => {
    return res.json({ message: "Success" });
  }
);

globalRoute.get("/hello-world", helloWorld);
export default globalRoute;
