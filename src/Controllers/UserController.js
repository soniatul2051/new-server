import jsonwebtoken from "jsonwebtoken";
import { User, OTP } from "../Models/UserSchema.js";
import { errHandler, responseHandler } from "../helper/response.js";
import MailTransporter from "../Config/mail.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// const otpGenrater = async (data) => {
//   console.log("otpgenerator data : ", data);
//   sendmail(data);
// };
// const transporter = nodemailer.createTransport({
//   port: 587,
//   host: "smtp.gmail.com",
//   secure: false,
//   auth: {
//     user: "mlp.yashvantgupta@gmail.com",
//     pass: "ehqelcvxjgjlaghv",
//   },
//   tls: {
//     rejectUnauthorized: false, // Bypass certificate verification (fixes self-signed issues)
//   },
// });
const otpGenrater = async (data) => {
  const otp = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP
  console.log("Generated OTP: ", otp);

  try {
    // Store the OTP in the database, associating it with the user
    await OTP.create({ UserId: data._id, otp, createdAt: new Date() });

    // Send OTP email
    await sendMail(data.email, otp);
    console.log("OTP successfully generated and email sent.");
  } catch (error) {
    console.error("Error during OTP generation: ", error.message);
  }
};

const transporter = nodemailer.createTransport({
  port: 587,
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: "mlp.yashvantgupta@gmail.com", // Use environment variables for security
    pass: "ehqelcvxjgjlaghv",
  },
  tls: {
    rejectUnauthorized: false, // Optional: bypass certificate verification
  },
});

const sendMail = async (email, otp) => {
  const mailOptions = {
    from: "mlp.yashvantgupta@gmail.com", // Use a verified sender email
    to: email,
    subject: "News Website OTP Verification",
    text: `Your OTP is: ${otp}. This OTP is valid for 10 minutes.`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error occurred while sending email:", error.message);
        return reject(error);
      }
      console.log("Email sent: ", info.response);
      resolve(info);
    });
  });
};

// const sendmail = (data) => {
//   console.log("data in send mail : ", data);
//   const otp = Math.floor(1000 + Math.random() * 9000);
//   const mailOptions = {
//     from: "muhammadyaseen3294@gmail.com",
//     to: data.email,
//     subject: "News Website Registration",
//     text: `Your OTP is: ${otp}`,
//   };
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log("Error occurred:", error.message);
//     } else {
//       console.log(info);
//       OTP.create({ UserId: data._id, otp }).then(async (datas) => {
//         sendmail(otp, data.email);
//         console.log(datas, "hello");
//       });
//     }
//   });
// };

// const RegisterdUser = async (req, res) => {
//   let {
//     phone,
//     email,
//     password,
//     byAdmin = false,
//     role = "user",
//     acsses,
//     selectedKeywords,
//   } = req.body;
//   if (User && (await User.findOne({ email }))) {
//     errHandler(res, 1, 403);
//     return;
//   } else if (password?.trim().length < 8) {
//     errHandler(res, 2, 403);
//     return;
//   }

//   User.create({
//     phone,
//     email,
//     password,
//     registerd: byAdmin,
//     role,
//     selectedKeywords,
//     acsses,
//   })
//     .then(async (data) => {
//       let { phone, email, registerd, role, _id, createdAt, acsses } = data;
//       let token = jsonwebtoken.sign(
//         { phone, email, registerd, role, _id, createdAt, acsses },
//         process.env.SECRET_KEY
//       );

//       const otp = Math.floor(1000 + Math.random() * 9000);
//       console.log(otp);
//       const mailOptions = {
//         from: "mlp.yashvantgupta@gmail.com",
//         to: data.email,
//         subject: "News Website Registration",
//         text: `Your OTP for News Website Registeration is: ${otp}`,
//       };
//       byAdmin
//         ? responseHandler(res, {
//             phone,
//             email,
//             _id,
//             registerd,
//             createdAt,
//             token,
//             role,
//             acsses,
//           })
//         : transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//               console.log("error here", error);
//               errHandler(res, error, 409);
//             } else {
//               console.log(info);
//               OTP.create({ UserId: data._id, otp }).then(async (datas) => {
//                 console.log(datas);
//                 responseHandler(res, {
//                   phone,
//                   email,
//                   _id,
//                   registerd,
//                   createdAt,
//                   token,
//                   role,
//                 });
//               });
//             }
//           });

//       console.log("hello");
//     })
//     .catch((err) => {
//       errHandler(res, err, 409);
//     });
// };
const RegisterdUser = async (req, res) => {
  let {
    phone,
    email,
    password,
    byAdmin = false,
    role = "staff",
    acsses,
    selectedKeywords,
  } = req.body;

  // Check if the user already exists
  if (await User.findOne({ email })) {
    return errHandler(res, "User already exists", 403);
  }

  // Validate password length
  if (!password || password.trim().length < 8) {
    return errHandler(res, "Password must be at least 8 characters", 403);
  }

  try {
    // Create a new user
    const user = await User.create({
      phone,
      email,
      password,
      registerd: byAdmin,
      role,
      selectedKeywords,
      acsses,
    });

    // Generate token for the new user
    const {
      phone: userPhone,
      email: userEmail,
      _id,
      registerd,
      createdAt,
      acsses: userAccess,
    } = user;
    const token = jsonwebtoken.sign(
      {
        phone: userPhone,
        email: userEmail,
        registerd,
        role,
        _id,
        createdAt,
        acsses: userAccess,
      },
      process.env.SECRET_KEY
    );

    // Generate OTP and send email
    await otpGenrater(user); // Call the otpGenrater function

    // Respond with user data and token (if successful)
    return responseHandler(res, {
      phone: userPhone,
      email: userEmail,
      _id,
      registerd,
      createdAt,
      token,
      role,
      acsses,
    });
  } catch (err) {
    console.error("Error during registration:", err);
    return errHandler(res, "Registration failed", 409);
  }
};

const LoginUser = (req, res) => {
  let { email, password } = req.body;
  if (password.trim().length < 8) {
    errHandler(res, 2, 403);
    return;
  }
  User.findOne({ email, password })
    .then((data) => {
      let { phone, email, registerd, role, _id, createdAt } = data;
      let token = jsonwebtoken.sign(
        { phone, email, registerd, role, _id, createdAt },
        process.env.SECRET_KEY
      );
      responseHandler(res, {
        email,
        phone,
        registerd,
        _id,
        createdAt,
        token,
        role,
      });
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};
const DeleteUser = (req, res) => {
  let { id } = req.query;
  console.log(id);
  User.findByIdAndDelete({ _id: id })
    .then((data) => {
      let { phone, email, registerd, role, _id, createdAt } = data;
      responseHandler(res, {
        email,
        phone,
        registerd,
        _id,
        createdAt,
        role,
      });
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};
const getUser = (req, res) => {
  const { id, registerd, role, phone, date } = req.query;
  let obj = {};
  if (id) {
    obj._id = id;
  }
  if (registerd) {
    obj.registerd =
      registerd == "yes" ? true : registerd == "no" ? false : false;
  }
  if (role) {
    obj.role = role;
  }
  if (phone) {
    obj.phone = phone;
  }
  if (date) {
    if (typeof date === "string" && date.trim() !== "") {
      const dateRange = date.split(",").filter(Boolean);

      if (dateRange.length === 2) {
        // Convert date strings to Date objects or ISO strings
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);

        // Check if the conversion was successful
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          obj.date = { $gte: startDate, $lte: endDate };
        } else {
          // Handle invalid date format
          console.error("Invalid date format");
        }
      } else {
        // Handle invalid date range format
        console.error("Invalid date range format");
      }
    }
  }
  User.find(obj)
    .sort({ createdAt: -1 })
    .then((data) => {
      responseHandler(res, data);
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};

const forgotPassword = async (req, res) => {
  let { email } = req.body;
  console.log("email to forget : ", email);
  User.findOne({ email })
    .then(async (data) => {
      console.log("otp to send response : ", data);
      await otpGenrater(data);
      let token = jsonwebtoken.sign({ email }, process.env.SECRET_KEY);
      responseHandler(res, { _id: data._id, token });
    })
    .catch(() => {
      errHandler(res, 1, 403);
    });
};

const otpVerify = async (req, res) => {
  const { otp, _id } = req.body;
  console.log("ID and OTP from body to verify:", req.body);

  try {
    // Fetch the most recent OTP for the user
    const data = await OTP.findOne({ UserId: _id }).sort({ createdAt: -1 });
    console.log("Fetched OTP data:", data);

    if (!data) {
      return errHandler(res, "OTP not found for this user", 404);
    }

    // Check if the OTP is expired
    if (data.expireAt < Date.now()) {
      return errHandler(res, "OTP expired", 403);
    }

    // Verify the OTP
    if (data.otp === otp) {
      // Update user registration status
      const user = await User.findByIdAndUpdate(
        _id,
        { registered: true },
        { new: true }
      );
      if (!user) {
        return errHandler(res, "User not found", 404);
      }

      // Delete the OTP after successful verification
      await OTP.deleteOne({ UserId: _id });
      console.log("OTP verified successfully, user updated:", user);
      return responseHandler(res, user);
    } else {
      return errHandler(res, "Please provide the correct OTP", 404);
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return errHandler(res, "Invalid OTP", 404);
  }
};

const NewPassword = (req, res) => {
  let { id, password } = req.body;
  if (password.trim().length < 8) {
    errHandler(res, 2, 403);
    return;
  }
  // User.findByIdAndUpdate({ _id: id }, { password }, { new: true })
  User.findByIdAndUpdate(id, { password }, { new: true })

    .then((data) => {
      responseHandler(res, data);
    })
    .catch(() => {
      errHandler(res, 1, 403);
    });
};

const changeRole = (req, res) => {
  console.log("hello");
  let { id, role } = req.body;
  User.findByIdAndUpdate({ _id: id }, { role }, { new: true })
    .then((data) => {
      let { phone, email, registerd, _id, role, createdAt } = data;
      responseHandler(res, {
        email,
        registerd,
        _id,
        createdAt,
        role,
        phone,
      });
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { id, newPassword } = req.body;

    if (!id || !newPassword) {
      return errHandler(res, "User ID and new password are required.", 400);
    }

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return errHandler(res, "User not found.", 404);
    }

    // Check if the new password is the same as the current password
    if (user.password === newPassword) {
      return errHandler(
        res,
        "New password cannot be the same as the current password.",
        400
      );
    }

    // Update the user's password directly (no hashing)
    user.password = newPassword;
    await user.save();

    const { email, _id, createdAt, role, phone } = user;
    responseHandler(res, {
      message: "Password updated successfully.",
      user: { email, _id, createdAt, role, phone },
    });
  } catch (err) {
    console.error("Error updating password:", err);
    errHandler(res, "Internal server error.", 500);
  }
};

const changeRegister = (req, res) => {
  let { id } = req.body;

  User.findById(id)
    .then((user) => {
      if (!user) {
        return errHandler(res, "User not found", 404);
      }
      // Toggle the `registerd` field
      const newRegisterStatus = !user.registerd;

      // Update the `registerd` field
      return User.findByIdAndUpdate(
        id,
        { registerd: newRegisterStatus },
        { new: true }
      );
    })
    .then((data) => {
      if (data) {
        let { phone, email, registerd, _id, role, createdAt } = data;
        responseHandler(res, {
          email,
          registerd,
          _id,
          createdAt,
          role,
          phone,
        });
      }
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};

// const changeRegister = (req, res) => {
//   let { id } = req.body;
//   User.findByIdAndUpdate({ _id: id }, { registerd: true }, { new: true })
//     .then((data) => {
//       let { phone, email, registerd, _id, role, createdAt } = data;
//       responseHandler(res, {
//         email,
//         registerd,
//         _id,
//         createdAt,
//         role,
//         phone,
//       });
//     })
//     .catch((err) => {
//       errHandler(res, 5, 409);
//     });
// };

const otpResend = async (req, res) => {
  const { _id } = req.body;
  OTP.findOne({ UserId: _id })
    .then(async (data1) => {
      User.findOne({ _id }).then(async (data) => {
        await OTP.deleteOne({ UserId: _id });
        otpGenrater(data);
        responseHandler(res, data);
      });
    })
    .catch(() => {
      errHandler(res, "Not Resend otp", 404);
    });
};

const DashBoradUser = async (req, res) => {
  try {
    const { date } = req.query;
    let dateFilter = {};
    let todayData = 0;

    // Check if today's date falls within the provided date range
    const today = new Date();
    todayData = await User.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // If date query parameter is provided, attempt to construct date filtering criteria
    if (date) {
      const [startDate, endDate] = date.split(",");
      const isValidDate = (dateString) =>
        !isNaN(new Date(dateString).getTime());

      if (isValidDate(startDate) && isValidDate(endDate)) {
        // Construct date filtering criteria only if both startDate and endDate are valid dates
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        };
      }
    }

    const registeredUsersCount = await User.aggregate([
      {
        $match: dateFilter, // Apply date filtering criteria
      },
      {
        $group: {
          _id: "$registerd",
          count: { $sum: 1 },
        },
      },
    ]);

    // Map the result to separate active and inactive counts
    const activeCount =
      registeredUsersCount.find((item) => item._id === true)?.count || 0;
    const inactiveCount =
      registeredUsersCount.find((item) => item._id === false)?.count || 0;

    res.json({ activeCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  RegisterdUser,
  LoginUser,
  otpVerify,
  changeRole,
  getUser,
  DeleteUser,
  forgotPassword,
  NewPassword,
  otpResend,
  changeRegister,
  DashBoradUser,
  changePassword,
};
