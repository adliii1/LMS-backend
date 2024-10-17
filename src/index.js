import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import globalRoute from "./routes/globalRoute.js";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./utils/database.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import courseRoute from "./routes/courseRoute.js";
import studentRoutes from "./routes/studentRoutes.js";

const port = 3000;
const app = express();
app.use(cors());
dotenv.config();
app.use(bodyParser.json());
app.use(express.static("public"));
connectDB();

app.get("/", (req, res) => {
  res.json({ text: "Hello World!" });
});

app.use("/api", globalRoute);
app.use("/api", authRoutes);
app.use("/api", paymentRoutes);
app.use("/api", courseRoute);
app.use("/api", studentRoutes);

app.listen(port, () => {
  console.log("Express listening to port 3000");
});
