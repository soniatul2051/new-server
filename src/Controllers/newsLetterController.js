import { Subscription } from "../Models/UserSchema.js";
import nodemailer from "nodemailer";

const createSubscription = async (req, res) => {
  try {
    const { email } = req.body;
    const subs = await Subscription.findOne({ email: email });

    if (subs)
      return res.status(500).json({ message: "User Already Subscribed..." });

    // Create a new subscription document
    const subscription = new Subscription({ email });

    // Save the subscription to the database
    await subscription.save();

    res
      .status(201)
      .json({ message: "Subscription created successfully", subscription });
    sendMail(email);
  } catch (error) {
    // If there's an error, handle it and send an error response
    console.error("Error creating subscription:", error);
    res.status(500).json({ message: "Failed to create subscription" });
  }
};
const transporter = nodemailer.createTransport({
  port: 587,
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: "mlp.yashvantgupta@gmail.com",
    pass: "ehqelcvxjgjlaghv",
  },
});

const sendMail = (email) => {
  console.log("email", email);
  const mailOptions = {
    from: "mlp.yashvantgupta@gmail.com",
    to: email,
    subject: "Newsletter Subscription",
    text: `Thanks\nYou have successfully subscribed to our newsletter`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred:", error.message);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Get subscription
const getallSubscription = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();

    res.status(201).json({
      message: "Subscription get successfully",
      length: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create subscription" });
  }
};

// Delete subscription
const deleteSubscription = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find and delete the subscription
    const subscription = await Subscription.findOneAndDelete({ email });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json({
      message: "Subscription deleted successfully",
      subscription,
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ message: "Failed to delete subscription" });
  }
};

export { createSubscription, getallSubscription, deleteSubscription };
