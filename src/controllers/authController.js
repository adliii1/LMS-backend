import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import transactionModel from "../models/transactionModel.js";
import jwt from "jsonwebtoken";

export const signUpAction = async (req, res) => {
  const MIDTRANS_URL = process.env.MIDTRANS_URL;
  const MIDTRANS_AUTH_STRING = process.env.MIDTRANS_AUTH_STRING;
  const SUCCESS_PAYMENT_URL = process.env.SUCCESS_PAYMENT_URL;
  try {
    const body = req.body;

    const hashPaswoord = bcrypt.hashSync(body.password, 12);

    const user = new userModel({
      name: body.name,
      email: body.email,
      password: hashPaswoord,
      photo: "default.png",
      role: "manager",
    });
    const transaction = new transactionModel({
      user: user._id,
      price: 280000,
    });

    const midtrans = await fetch(MIDTRANS_URL, {
      method: "POST",
      body: JSON.stringify({
        transaction_details: {
          order_id: user._id.toString(),
          gross_amount: transaction.price,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          email: user.email,
        },
        callbacks: {
          finish: SUCCESS_PAYMENT_URL,
        },
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${MIDTRANS_AUTH_STRING}`,
      },
    });

    const resMidtrans = await midtrans.json();

    await user.save();
    await transaction.save();

    return res.json({
      message: "Sign Up Succes",
      data: {
        midtrans_payment_URL: resMidtrans.redirect_url,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const signInAction = async (req, res) => {
  try {
    const body = req.body;
    const userExist = await userModel
      .findOne()
      .where("email")
      .equals(body.email);

    if (!userExist) {
      return res.status(400).json({
        messsage: "User Not Found",
      });
    }

    const comparePassword = bcrypt.compareSync(
      body.password,
      userExist.password
    );

    if (!comparePassword) {
      return res.status(400).json({
        message: "Wrong passoword / Email",
      });
    }

    const isUserValid = await transactionModel.findOne({
      user: userExist._id,
      status: "success",
    });

    if (userExist.role !== "student" && !isUserValid) {
      return res.status(400).json({
        message: "User Not Verified",
      });
    }

    const token = jwt.sign(
      {
        data: {
          id: userExist._id,
        },
      },
      process.env.SECRET_KEY_JWT,
      {
        expiresIn: "1day",
      }
    );

    return res.json({
      message: "User Logged In Success",
      data: {
        name: userExist.name,
        email: userExist.email,
        token,
        role: userExist.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
