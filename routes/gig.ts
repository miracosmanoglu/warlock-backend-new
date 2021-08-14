import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const { categoryId, warlockId } = req.body;
  const filteredGigs = await prisma.gig.findMany({
    where: {
      OR: [
        {
          categoryId: categoryId,
        },
        {
          warlockId: warlockId,
        },
      ],
    },
  });
  res.json(filteredGigs);
});

router.post("/", async (req, res) => {
  const { description, price, title, duration, warlockId, categoryId } =
    req.body;

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
    const result = await prisma.gig.create({
      data: {
        description,
        price,
        title,
        duration,
        warlockId,
        categoryId,
      },
    });

    res.send(JSON.stringify({ status: 200, error: null, response: result }));
  } catch (e) {
    res.send(
      JSON.stringify({ status: 500, error: "In gig " + e, response: null })
    );
  }
});
module.exports = router;
