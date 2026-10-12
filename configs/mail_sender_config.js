import  nodemailer from "nodemailer" ;

 const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:process.env.Email_app_user,
    pass:process.env.Email_app_pass,
  },
});

export default transporter;