import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
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

router.post("/callback/:customerId", function async(req: any, res: any) {
  console.log(req.body);
  iyzipay.checkoutForm.retrieve(
    {
      locale: "tr",
      conversationId: "123456789",
      token: req.body.token,
    },
    async function (err: any, result: any) {
      console.log(err, result, "result");
      if (err) {
        res.redirect(
          url.format({
            pathname: "https://falzamani.vercel.app/hata",
          })
        );
        return;
      } else {
        const customer = await prisma.customer.update({
          where: { id: parseInt(req.params.customerId) },
          data: {
            credit: { increment: result.itemTransactions[0].price * 10 },
          },
        });
        await res.redirect(
          url.format({
            pathname: "https://falzamani.vercel.app/basarili",
          })
        );
        await res.send(
          JSON.stringify({
            status: 200,
            error: "Success",
            data: result,
          })
        );
      }
    }
  );
});

module.exports = router;
