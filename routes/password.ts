import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const passwordTokens = await prisma.forgotTokens.findMany({});
    res.send(
      JSON.stringify({ status: 200, error: null, data: passwordTokens })
    );
    return;
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
    return;
  }
});

router.get("/forgot-password", async (req, res) => {
  try {
    const warlock = await prisma.forgotTokens.findMany({
      where: {
        used: false,
      },
    });

    console.log(warlock);

    res.send(JSON.stringify({ status: 200, error: null, data: null }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const isCustomer = await prisma.customer.findUnique({
      where: { email: req.body.email },
    });
    const isWarlock = await prisma.warlock.findUnique({
      where: { email: req.body.email },
    });
    const isAdmin = await prisma.admin.findUnique({
      where: { email: req.body.email },
    });

    if (!(isCustomer || isAdmin || isWarlock)) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "Kullanıcı bulunamadı.",
          data: null,
        })
      );
      return;
    }

    const updatedTokens = await prisma.forgotTokens.updateMany({
      where: { email: req.body.email },
      data: { used: true },
    });

    // Create random reset token
    const fpSalt = crypto.randomBytes(64).toString("hex");

    //token expires after one hour
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1 / 24);

    const passwordToken = await prisma.forgotTokens.create({
      data: {
        email: req.body.email,
        expiration: expireDate,
        token: fpSalt,
        used: false,
      },
    });

    const transporter = nodemailer.createTransport(
      smtpTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        auth: {
          user: "furkanmailsender@gmail.com",
          pass: "12323434f",
        },
      })
    );

    const mailData = {
      from: "furkanmailsender@gmail.com", // sender address
      to: req.body.email, // list of receivers
      subject: "Sending Email using Node.js",
      text: `Linki takip ederek yeni şifreni girebilirsin, https://falzamani.vercel.app/ChangePassword/${JSON.stringify(
        passwordToken.token
      )} `,
    };
    //send email
    transporter.sendMail(mailData, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    res.send(JSON.stringify({ status: 200, error: null, data: mailData }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.put("/forgot-password/:token", async (req, res) => {
  try {
    const tokenExist = await prisma.forgotTokens.findMany({
      where: {
        token: req.params.token,
        used: false,
      },
    });
    if (tokenExist.length === 0) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "Geçersiz token.",
          data: null,
        })
      );
      return;
    }

    if (req.body.password !== req.body.rePassword) {
      res.status(500);
      res.send(
        JSON.stringify({
          status: 500,
          error: "Şifreler uyuşmuyor. Kontrol ediniz.",
          data: null,
        })
      );
      return;
    }

    req.body.password = await bcrypt.hash(req.body.password, 12);

    const isCustomer = await prisma.customer.findUnique({
      where: { email: tokenExist[0].email },
    });
    const isWarlock = await prisma.warlock.findUnique({
      where: { email: tokenExist[0].email },
    });
    const isAdmin = await prisma.admin.findUnique({
      where: { email: tokenExist[0].email },
    });

    if (isCustomer) {
      const customer = await prisma.customer.update({
        where: { email: tokenExist[0].email },
        data: { password: req.body.password },
      });
    }

    if (isWarlock) {
      const warlock = await prisma.warlock.update({
        where: { email: tokenExist[0].email },
        data: { password: req.body.password },
      });
    }

    if (isAdmin) {
      const admin = await prisma.admin.update({
        where: { email: tokenExist[0].email },
        data: { password: req.body.password },
      });
    }

    const usedToken = await prisma.forgotTokens.update({
      where: { token: req.params.token },
      data: { used: true },
    });

    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        data: "Başarılı bir şekilde değiştirildi.",
      })
    );
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

module.exports = router;
