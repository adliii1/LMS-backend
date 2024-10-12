import courseModel from "../models/courseModel.js";

export const getCourse = async (req, res) => {
  try {
    const course = await courseModel
      .find({
        manager: req.user?._id,
      })
      .select("name thumbnail")
      .populate({ path: "category", select: "name -_id" })
      .populate({ path: "student", select: "name" });

    return res.json({ message: "Get course success", data: course });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
