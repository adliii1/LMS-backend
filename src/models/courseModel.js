import mongoose from "mongoose";
import categoryModel from "./categoryModel.js";
import courseDetailModel from "./courseDetailModel.js";
import userModel from "./userModel.js";

const courseModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  tagline: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  detail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseDetail",
  },
});

courseModel.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await categoryModel.findOneAndUpdate(doc.category, {
      $pull: {
        courses: doc._id,
      },
    });

    await courseDetailModel.deleteMany({ course: doc._id });

    doc.student?.map(async (std) => {
      await userModel.findByIdAndUpdate(std._id, {
        $pull: {
          courses: doc._id,
        },
      });
    });
  }
});

export default mongoose.model("Course", courseModel);
