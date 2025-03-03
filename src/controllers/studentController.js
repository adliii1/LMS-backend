import bcrypt from "bcrypt";

import userModel from "../models/userModel.js";
import { mutateStudentSchema } from "../utils/schema.js";
import courseModel from "../models/courseModel.js";
import path from "path";
import fs from "fs";

export const getStudents = async (req, res) => {
  try {
    const students = await userModel
      .find({
        role: "student",
        manager: req.user._id,
      })
      .select("name courses photo");

    const imageURL = process.env.APP_URL + "/uploads/student/";

    const response = students.map((item) => {
      return {
        ...item.toObject(),
        photo_url: imageURL + item.photo,
      };
    });

    return res.json({
      message: "Get students success",
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server erorr",
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await userModel.findById(id).select("name email");

    return res.json({
      message: "Get student by id success",
      data: student,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const postStudent = async (req, res) => {
  try {
    const body = req.body;

    const parse = mutateStudentSchema.safeParse(body);

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

    const hashPassword = bcrypt.hashSync(parse?.data?.password, 12);

    const student = new userModel({
      name: parse?.data?.name,
      password: hashPassword,
      email: parse?.data?.email,
      photo: req?.file?.filename,
      manager: req?.user?._id,
      role: "student",
    });

    await student.save();

    return res.json({
      message: "Student created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const body = req.body;
    const { id } = req.params;

    const parse = mutateStudentSchema
      .partial({ password: true })
      .safeParse(body);

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

    const student = await userModel.findById(id);

    const hashPassword = parse?.data?.password
      ? bcrypt.hashSync(parse?.data?.password, 12)
      : student?.password;

    await userModel.findByIdAndUpdate(id, {
      name: parse?.data?.name,
      email: parse?.data?.email,
      password: hashPassword,
      photo: req?.file ? req?.file?.filename : student?.photo,
    });

    return res.json({
      message: "Student updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await userModel.findById(id);

    await courseModel.findOneAndUpdate(
      {
        students: id,
      },
      {
        $pull: {
          students: student.id,
        },
      }
    );

    const dirname = path.resolve();
    const filePath = path.join(
      dirname,
      "public/uploads/student",
      student.photo
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await userModel.findByIdAndDelete(id);

    return res.json({
      message: "Delete student success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
