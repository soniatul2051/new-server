import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  port: 587,
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: process.env.SERVICE,
    pass: process.env.PASS,
  },
});

const MailTransporter = async (data, datas) => {
  const mailOptions = {
    from: process.env.SERVICE, // sender address
    to: data.email, // list of receivers
    subject: "Verification code from New Web", // Subject line
    html: `<body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
    <table role="presentation"
      style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
      <tbody>
        <tr>
          <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
              <tbody>
                <tr>
                  <td style="padding: 40px 0px 0px;">
                    <div style="text-align: left;">
                      <div style="padding-bottom: 20px;"><div style="border-bottom:1px solid #eee">
                      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">News web</a>
                    </div></div>
                    </div>
                    <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                      <div style="color: rgb(0, 0, 0); text-align: left;">
                        <h1 style="margin: 1rem 0">Verification code</h1>
                        <p style="padding-bottom: 16px">Thank you for choosing News web Brand. Use the following OTP to complete your Registration procedures. OTP is valid for 1 hour</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${datas.otp}</h2>
                        <p style="padding-bottom: 16px">If you didn’t request this, you can ignore this email.</p>
                        <p style="padding-bottom: 16px">Thanks,<br>The News web team</p>
                      </div>
                    </div>
                    
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>`, // html body
  };

  const mail = await transporter.sendMail(mailOptions).then((response) => {
    {
      console.log("optSEnd..", response);
    }
  });
};

export default MailTransporter;
