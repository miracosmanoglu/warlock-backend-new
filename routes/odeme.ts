import express from "express";
const router = express.Router();
// @ts-ignore: Unreachable code error
import Iyzipay from "iyzipay";
import url from "url";

var iyzipay = new Iyzipay({
  apiKey: "sandbox-FLDXJ5dH10YcfjLaxsLLmUToA4MhyKrX",
  secretKey: "sandbox-6n4zpnJctiAMAu5XGfSyV2xx7YjNZO6w",
  uri: "https://sandbox-api.iyzipay.com",
});
router.post("/", function (req: any, res: any) {
  iyzipay.checkoutFormInitialize.create(
    req.body,
    function (err: any, result: any) {
      if (err) {
        return res.status(400).send(err);
      }
      res.send(result);
    }
  );
});

router.post("/callback", function async(req: any, res: any) {
  console.log(req.body);
  iyzipay.checkoutForm.retrieve(
    {
      locale: "tr",
      conversationId: "123456789",
      token: req.body.token,
    },
    function (err: any, result: any) {
      console.log(err, result, "result");
      if (err) {
        res.redirect(
          url.format({
            pathname: "https://falzamani.vercel.app/hata",
          })
        );
      } else {
        res.redirect(
          url.format({
            pathname: "https://falzamani.vercel.app/basarili",
          })
        );
      }
    }
  );
});

module.exports = router;
