import express from "express";
import midtransClient from "midtrans-client";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

dotenv.config();

router.post("/process-transaction", async (req, res) => {
  try {
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.SERVER_KEY,
      clientKey: process.env.CLIENT_KEY,
    });

    const { total_price, items, customers } = req.body;

    const customer = customers[0];

    const transactionDetails = {
      transaction_details: {
        order_id: uuidv4(),
        gross_amount: total_price,
      },
      item_details: items.map((item) => ({
        id: item.packetId,
        price: item.packetPrice,
        merchant_name: "PropertEase",
        quantity: item.quantity,
        name: item.name,
      })),
      customer_details: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    };

    const transaction = await snap.createTransaction(transactionDetails);
    const dataPayment = {
      response: JSON.stringify(transaction),
    };
    const token = transaction.token;

    res.status(200).json({ message: "berhasil", dataPayment, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
