const express = require("express");
const router = express.Router();
var Iyzipay = require("iyzipay");
const url = require("url");

var iyzipay = new Iyzipay({
  apiKey: "sandbox-FLDXJ5dH10YcfjLaxsLLmUToA4MhyKrX",
  secretKey: "sandbox-6n4zpnJctiAMAu5XGfSyV2xx7YjNZO6w",
  uri: "https://sandbox-api.iyzipay.com",
});
router.post("/", function (req, res) {
  iyzipay.checkoutFormInitialize.create(req.body, function (err, result) {
    if (err) {
      return res.status(400).send(err);
    }
    res.send(result);
  });
});

router.post("/callback", function (req, res) {
  console.log(req.body.token);
  iyzipay.checkoutForm.retrieve(
    {
      locale: "tr",
      conversationId: "123456789",
      token: req.body.token,
    },
    function (err, result) {
      console.log(err, result, "result");
    }
  );
  res.redirect(
    url.format({
      pathname: "https://falzamani.vercel.app/",
    })
  );
});

module.exports = router;
