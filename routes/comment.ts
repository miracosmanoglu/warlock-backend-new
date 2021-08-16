import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const { gigId } = req.body;
  try {
    const filteredComments = await prisma.comment.findMany({
      where: {
        gigId: gigId,
      },
    });
    res.send(
      JSON.stringify({ status: 200, error: null, data: filteredComments })
    );
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
});

router.post("/", async (req, res) => {
  const { text, rate, gigId, customerId } = req.body;

  const data = await getUserId(req);

  if (data === null || data.message) {
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
    const result = await prisma.comment.create({
      data: {
        text,
        rate,
        gigId,
        customerId,
      },
    });

    res.send(JSON.stringify({ status: 200, error: null, data: result.id }));
  } catch (error) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: error, data: null }));
  }
});

module.exports = router;
