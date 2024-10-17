import userModel from "../models/userModel.js";

export const getStudents = async (req, res) => {
  try {
    const students = await userModel.find({
      role: "student",
      manager: req.user._id,
    });

    return res.json({
      message: "Get students success",
      data: students,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server erorr",
    });
  }
};
