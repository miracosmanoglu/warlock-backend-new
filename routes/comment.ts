import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const { gigId } = req.body;
  const filteredComments = await prisma.comment.findMany({
    where: {
      gigId: gigId,
    },
  });
  res.json(filteredComments);
});

router.post("/", async (req, res) => {
  const { text, rate, gigId, customerId } = req.body;

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

  const result = await prisma.comment.create({
    data: {
      text,
      rate,
      gigId,
      customerId,
    },
  });

  res.json(result);
});

module.exports = router;
