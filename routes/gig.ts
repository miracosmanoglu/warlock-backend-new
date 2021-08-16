import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const { categoryId, warlockId } = req.body;
  try {
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
    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        data: filteredGigs,
      })
    );
  } catch (error) {
    res.status(404);
    res.send(
      JSON.stringify({
        status: 404,
        error: error,
        data: null,
      })
    );
  }
});

router.post("/", async (req, res) => {
  const { description, price, title, duration, warlockId, categoryId } =
    req.body;

  const data = await getUserId(req);
  if (data === null || data.message || data?.user?.user.role === "CUSTOMER") {
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

    res.send(JSON.stringify({ status: 200, error: null, data: result }));
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
  }
});
module.exports = router;
