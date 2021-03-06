import express from "express";
import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
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
      to: "mrccc23@gmail.com", // list of receivers
      subject: "Bize Ulaşın Formu",
      html: `<p><b>Ad:</b> ${req.body.name}<br/><b>Soyad:</b> ${req.body.surname}<br/><b>Email:</b> ${req.body.email} <br/><b>Telefon:</b> ${req.body.phone}<br/><b>Açıklama:</b> ${req.body.text}</p>`,
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

module.exports = router;
