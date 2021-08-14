import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  const horoscopes = await prisma.horoscope.findMany({});
  res.json(horoscopes);
});

router.post("/", async (req, res) => {
  const { name, image } = req.body;
  const user = await getUserId(req);
  if (user === null || user.message) {
    res.send(
      JSON.stringify({
        status: 401,
        error: "JWT expired or not provided",
        response: null,
      })
    );
    return;
  }

  try {
    const horoscopeExist = await prisma.horoscope.findMany({
      where: { name },
    });
    console.log("warlock: ", horoscopeExist);
    if (horoscopeExist.length != 0) {
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
        JSON.stringify({ status: 200, error: null, response: horoscope.id })
      );
    } catch (e) {
      res.send(
        JSON.stringify({
          status: 500,
          error: "In create horoscope " + e,
          response: null,
        })
      );
    }
  } catch (e) {
    res.send(
      JSON.stringify({
        status: 500,
        error: "In horoscope " + e,
        response: null,
      })
    );
  }
});
module.exports = router;
