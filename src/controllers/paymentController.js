import transactionModel from "../models/transactionModel.js";
import trasactionModel from "../models/transactionModel.js";

const handlePayment = async (req, res) => {
  try {
    const body = req.body;

    const orderId = body.order_id;
    switch (body.transaction_status) {
      case "capture":
      case "settlement":
        await trasactionModel.findByIdAndUpdate(orderId, {
          status: "success",
        });

        break;
      case "deny":
      case "cancel":
      case "expire":
      case "failure":
        await transactionModel.findByIdAndUpdate(orderId, {
          status: "failed",
        });

        breack;
    }

    return res.json({
        message: "payment success",
        data: {}
    })
  } catch (error) {
    console.log(error);

    return res.status(500).json({
        message: "Internal server error",
    })
  }
};

export default handlePayment;
