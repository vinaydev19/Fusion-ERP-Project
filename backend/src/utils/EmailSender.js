import { mailTransporter } from "./EmailConfig.js";
import {
  Email_Change_Confirmation_Email,
  Email_Change_Verification_Template,
  Password_Reset_Confirmation_Email,
  Reset_Password_Email_Template,
  Verification_Email_Template,
  Welcome_Email_Template,
} from "./EmailTemplate.js";

const sendVerificationCode = async (email, verificationCode) => {
  try {
    const response = await mailTransporter.sendMail({
      from: `"Fusion ERP" <fusionerp01@gmail.com>`,
      to: email,
      subject: "Verify your Email",
      text: "verify your Email",
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ),
    });
    console.log("Email send Successfully", response);
  } catch (error) {
    console.log(
      `something want wrong while send the verification code || ${error}`
    );
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const response = await mailTransporter.sendMail({
      from: `"Fusion ERP" <fusionerp01@gmail.com>`,
      to: email,
      subject: "Welcome Email",
      text: "Welcome Email",
      html: Welcome_Email_Template.replace("{name}", name),
    });
    console.log("Email send Successfully", response);
  } catch (error) {
    console.log(
      `something want wrong while send the welcome email || ${error}`
    );
  }
};

const resetPasswordEmail = async (email, verificationCode) => {
  try {
    const response = await mailTransporter.sendMail({
      from: `"Fusion ERP" <fusionerp01@gmail.com>`,
      to: email,
      subject: "Reset Your Password",
      text: "Reset Your Password",
      html: Reset_Password_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ),
    });
    console.log("verification code send to your email", response);
  } catch (error) {
    console.log(
      `something want wrong while send the reset password link || ${error}`
    );
  }
};

const resetPasswordConfirmationEmail = async (email, name) => {
  try {
    const response = await mailTransporter.sendMail({
      from: `"Fusion ERP" <fusionerp01@gmail.com>`,
      to: email,
      subject: "Password Reset Successful",
      text: "Password Reset Successful",
      html: Password_Reset_Confirmation_Email.replace("{name}", name),
    });
    console.log("password reset successful", response);
  } catch (error) {
    console.log(
      `something want wrong while send the reset password link || ${error}`
    );
  }
};

const ChangeEmailVerification = async (email, verificationCode) => {
  try {
    const response = await mailTransporter.sendMail({
      from: `"Fusion ERP" <fusionerp01@gmail.com>`,
      to: email,
      subject: "Verify your Email",
      text: "verify your Email",
      html: Email_Change_Verification_Template.replace(
        "{verificationCode}",
        verificationCode
      ),
    });
    console.log("Email send Successfully", response);
  } catch (error) {
    console.log(
      `something want wrong while send the verification code || ${error}`
    );
  }
};

const emailChangeConfirmation = async (email, name) => {
  try {
    const response = await mailTransporter.sendMail({
      from: `"Fusion ERP" <fusionerp01@gmail.com>`,
      to: email,
      subject: "Password Reset Successful",
      text: "Password Reset Successful",
      html: Email_Change_Confirmation_Email.replace("{name}", name),
    });
    console.log("password reset successful", response);
  } catch (error) {
    console.log(
      `something want wrong while send the reset password link || ${error}`
    );
  }
};

export {
  sendVerificationCode,
  sendWelcomeEmail,
  resetPasswordEmail,
  resetPasswordConfirmationEmail,
  emailChangeConfirmation,
  ChangeEmailVerification,
};
