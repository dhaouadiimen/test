//import express from "express";
//import bodyParser from "body-parser";
//import cookieParser from "cookie-parser";

const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { jwtkey } = require("../KeyBD");
const router = express.Router();
const User = require("../Models/User.js");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/signup", async (req, res) => {
  console.log(req.body);
  // new mongoose.Types.ObjectId(),
  const { _id, email, username, password, confirmePassword } = req.body;
  try {
    const user = await new User({
      _id: _id,
      email: email,
      username: username,
      password: password,
      confirmePassword: confirmePassword,
    }).save();
    const verificationToken = user.generateVerificationToken();
    console.log(verificationToken);
    const url = `http://localhost:4000/verify/${verificationToken}`;
    transporter.sendMail({
      to: email,
      subject: "Verify Account",
      html: `Click <a href = '${url}'>here</a> to confirm your email.`,
    });
    return res.status(201).send({
      message: `Sent a verification email to ${email}`,
    });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});
//**************************Login**********/
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({
      error: "Missing email or password",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({
      error: "please verify your email",
    });
  }
  if (!user.verified) {
    return res.status(403).send({
      message: "Verify your Account.",
    });
  } else {
    return res.status(200).send({
      message: "login successfully",
    });
  }
});

router.get("/verify/:id", async (req, res) => {
  const id = req.params.id;
  
  console.log(id);

  if (!id) {
    return res.status(422).send({
      message: "Missing Token",
    });
  }

  let payload = null;
  try {
    payload = jwt.verify(id, process.env.USER_VERIFICATION_TOKEN_SECRET);
   
    console.log(payload);
  } catch (err) {
    return res.status(500).send(err);
  }
  try {
   
    const user = await User.findOne({ _id: payload.ID }).exec();
   
    console.log(user);
    if (!user) {
      return res.status(404).send({
        message: "User does not  exists",
      });
    }
   
    user.verified = true;
    await user.save();
    return res.status(200).send({
      message: "Account Verified",
    });
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
