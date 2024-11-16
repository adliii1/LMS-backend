import courseModel from "../models/courseModel.js";
import categoryModel from "../models/categoryModel.js";
import userModel from "../models/userModel.js";

import { mutateCourseSchema } from "../utils/schema.js";
import fs from "fs";
import path from "path";
import courseDetailModel from "../models/courseDetailModel.js";

export const getCourse = async (req, res) => {
  try {
    const course = await courseModel
      .find({
        manager: req.user?._id,
      })
      .select("name thumbnail")
      .populate({ path: "category", select: "name -_id" })
      .populate({ path: "students", select: "name" });

    const imageURL = process.env.APP_URL + "/uploads/courses/";

    const response = course.map((item) => {
      return {
        ...item.toObject(),
        thumbnail_url: imageURL + item.thumbnail,
        total_student: item.students.length,
      };
    });

    return res.json({ message: "Get course success", data: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();

    return res.json({
      message: "Get categories success",
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseModel
      .findById(id)
      .populate({
        path: "category",
        name: "name, -_id",
      })
      .populate({
        path: "details",
        name: "title type",
      });

    const imageURL = process.env.APP_URL + "/uploads/courses/";

    return res.json({
      message: "Get course by Id success",
      data: {
        ...course.toObject(),
        thumbnail_url: imageURL + course.thumbnail,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const postCourse = async (req, res) => {
  try {
    const body = req.body;

    const parse = mutateCourseSchema.safeParse(body);

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      if (req?.file?.path && fs.existsSync(req?.file?.path)) {
        fs.unlinkSync(req?.file?.path);
      }

      return res.status(500).json({
        message: "Internal Server Error",
        data: null,
        errorMessages: errorMessages,
      });
    }

    const category = await categoryModel.findById(parse.data.categoryId);

    if (!category) {
      return res.status(500).json({
        message: "Category Id not Found",
      });
    }

    const course = new courseModel({
      name: parse.data.name,
      thumbnail: req.file?.filename,
      category: parse.data.categoryId,
      tagline: parse.data.tagline,
      description: parse.data.description,
      manager: req.user._id,
    });

    await course.save();

    await categoryModel.findByIdAndUpdate(
      category._id,
      {
        $push: {
          courses: course._id,
        },
      },
      { new: true }
    );

    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          courses: course._id,
        },
      },
      { new: true }
    );

    return res.json({
      message: "Create course Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const body = req.body;
    const courseId = req.params.id;

    const parse = mutateCourseSchema.safeParse(body);

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      if (req?.file?.path && fs.existsSync(req?.file?.path)) {
        fs.unlinkSync(req?.file?.path);
      }

      return res.status(500).json({
        message: "Internal Server Error",
        data: null,
        errorMessages: errorMessages,
      });
    }

    const category = await categoryModel.findById(parse.data.categoryId);
    const oldCourse = await courseModel.findById(courseId);

    if (!category) {
      return res.status(500).json({
        message: "Category Id not Found",
      });
    }

    await courseModel.findByIdAndUpdate(courseId, {
      name: parse.data.name,
      thumbnail: req.file ? req.file?.filename : oldCourse.thumbnail,
      category: parse.data.categoryId,
      tagline: parse.data.tagline,
      description: parse.data.description,
      manager: req.user._id,
    });

    return res.json({
      message: "Update course Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await courseModel.findById(id);

    const dirname = path.resolve();

    const filePath = path.join(
      dirname,
      "public/uploads/courses",
      course.thumbnail
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await courseModel.findByIdAndDelete(id);

    return res.json({
      message: "Delete course success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const postContentCourse = async (req, res) => {
  try {
    const body = req.body;
    const course = await courseModel.findById(body.courseId);

    const content = new courseDetailModel({
      title: body.title,
      type: body.type,
      youtubeId: body.videoId,
      text: body.text,
      course: course._id,
    });

    await content.save();

    await courseModel.findByIdAndUpdate(
      course._id,
      {
        $push: {
          details: content._id,
        },
      },
      { new: true }
    );

    return res.json({
      message: "Create course content success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateContentCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const course = await courseModel.findByIdAndUpdate(body.courseId);

    await courseDetailModel.findByIdAndUpdate(
      id,
      {
        title: body.title,
        type: body.type,
        youtubeId: body.videoId,
        text: body.text,
        course: course._id,
      },
      { new: true }
    );

    return res.json({
      message: "Update course content success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteContentCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await courseDetailModel.findByIdAndDelete(id);

    return res.json({
      message: "Delete course content success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCourseDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await courseDetailModel.findById(id);

    return res.json({
      message: "Get course content success",
      data: content,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getStudentByCourseId = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await courseModel.findById(id).select("name").populate({
      path: "students",
      select: "name email photo",
    });

    return res.json({
      message: "Get student by course success",
      data: student,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const postStudentByCourseId = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    await userModel.findByIdAndUpdate(id, {
      $push: {
        course: id,
      },
    });

    await courseModel.findByIdAndUpdate(id, {
      $push: {
        students: body.studentId,
      },
    });

    return res.json({
      message: "Add student to course success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteStudentByCourseId = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    await userModel.findByIdAndUpdate(id, {
      $pull: {
        course: id,
      },
    });

    await courseModel.findByIdAndUpdate(id, {
      $pull: {
        students: body.studentId,
      },
    });

    return res.json({
      message: "Delete student to course success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
