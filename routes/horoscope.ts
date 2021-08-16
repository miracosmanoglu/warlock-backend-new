import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const horoscopes = await prisma.horoscope.findMany({});
    res.send(JSON.stringify({ status: 200, error: null, data: horoscopes }));
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
  }
});

router.post("/", async (req, res) => {
  const { name, image } = req.body;
  const data = await getUserId(req);
  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "WARLOCK" ||
    data?.user?.user.role === "CUSTOMER"
  ) {
    res.status(401);
    res.send(
      JSON.stringify({
        status: 401,
        error: "JWT expired or not provided",
        data: null,
      })
    );
    return;
  }

  try {
    const horoscopeExist = await prisma.horoscope.findMany({
      where: { name },
    });
    if (horoscopeExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "horoscope is found with that name",
        })
      );
      return;
    }
    try {
      const horoscope = await prisma.horoscope.create({
        data: {
          name,
          image,
        },
      });
      res.send(
        JSON.stringify({ status: 200, error: null, data: horoscope.id })
      );
    } catch (e) {
      res.status(500);
      res.send(
        JSON.stringify({
          status: 500,
          error: e,
          data: null,
        })
      );
    }
  } catch (e) {
    res.status(500);
    res.send(
      JSON.stringify({
        status: 500,
        error: e,
        data: null,
      })
    );
  }
});
module.exports = router;
